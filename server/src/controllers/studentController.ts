/**
 * studentController.ts
 * -----------------------------------------------------------------------------
 * Contains the actual logic for each Student API endpoint. A "controller" is just
 * a function that receives the request, does some work (talk to the database,
 * apply encryption, etc.), and sends back a response.
 *
 * Encryption responsibilities of THIS layer (the server):
 *   - On WRITE  (create/update): take the level-1 ciphertext sent by the browser
 *     and add our level-2 layer before saving to MongoDB.
 *   - On READ   (list):          take the level-2 ciphertext from MongoDB and peel
 *     off our layer, returning level-1 ciphertext for the browser to finish.
 */

import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Student } from '../models/Student';
import { ApiError } from '../middleware/errorHandler';
import {
  STUDENT_ENCRYPTED_FIELDS,
  encryptStudentFields,
  decryptStudentFields,
  type EncryptedField,
} from '../utils/crypto';

/** The shape of a student field map: each known field maps to a string (optional). */
type StudentFieldMap = Partial<Record<EncryptedField, string>>;

/** A database record as returned by Mongoose's `.lean()` (a plain object). */
interface PersistedStudent extends StudentFieldMap {
  _id: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Converts a database record (level-2 ciphertext) into the JSON object we send to
 * the browser (level-1 ciphertext + friendly metadata).
 *
 * @param doc - A lean student document straight from MongoDB.
 * @returns An object the frontend can decrypt and display.
 */
function toClientStudent(doc: PersistedStudent) {
  // Peel off the server (level-2) layer for every encrypted field.
  const levelOneFields = decryptStudentFields(doc);

  return {
    id: doc._id.toString(), // Expose a clean string id instead of Mongo's ObjectId.
    ...levelOneFields,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Validates the request body and extracts the encrypted student fields from it.
 *
 * Because the data arrives ALREADY encrypted by the browser, the server cannot
 * check things like "is this a valid email?" (it only sees ciphertext). So here
 * we only verify *structure*: that the expected fields are present and are
 * non-empty strings. The human-friendly format validation happens on the client
 * BEFORE encryption (see client/src/utils/validation.ts).
 *
 * @param body    - The raw `req.body`.
 * @param partial - When true (for updates) missing fields are allowed; when false
 *                  (for create) every field is required.
 * @returns A clean map containing only the recognised student fields.
 */
function extractEncryptedPayload(body: unknown, partial: boolean): StudentFieldMap {
  if (typeof body !== 'object' || body === null) {
    throw new ApiError(400, 'Request body must be a JSON object.');
  }

  const source = body as Record<string, unknown>;
  const result: StudentFieldMap = {};
  const missing: string[] = [];

  for (const field of STUDENT_ENCRYPTED_FIELDS) {
    const value = source[field];

    if (value === undefined) {
      // For a create request, every field must be present.
      if (!partial) missing.push(field);
      continue;
    }

    if (typeof value !== 'string' || value.trim() === '') {
      throw new ApiError(400, `Field "${field}" must be a non-empty (encrypted) string.`);
    }

    result[field] = value;
  }

  if (!partial && missing.length > 0) {
    throw new ApiError(400, `Missing required field(s): ${missing.join(', ')}.`);
  }

  if (partial && Object.keys(result).length === 0) {
    throw new ApiError(400, 'No valid fields were provided to update.');
  }

  return result;
}

/**
 * Guards against invalid Mongo IDs. A malformed id would otherwise cause an ugly
 * 500 error deep inside Mongoose; this turns it into a clean 400 instead.
 *
 * @param id - The `:id` value from the URL.
 */
function assertValidObjectId(id: string): void {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `"${id}" is not a valid student id.`);
  }
}

/**
 * CREATE  →  POST /api/register
 * Registers a new student. The body holds level-1 ciphertext; we add level-2 and save.
 *
 * @param req - Express request; `req.body` holds the encrypted student fields.
 * @param res - Express response used to return the created student.
 */
export async function createStudent(req: Request, res: Response): Promise<void> {
  // 1. Validate + extract the level-1 ciphertext fields from the request.
  const levelOnePayload = extractEncryptedPayload(req.body, /* partial */ false);

  // 2. Add the server (level-2) encryption layer.
  const levelTwoPayload = encryptStudentFields(levelOnePayload);

  // 3. Save the double-encrypted record to MongoDB.
  const created = await Student.create(levelTwoPayload);

  // 4. Return the new student (decrypted back to level-1) with HTTP 201 = "Created".
  res.status(201).json({
    success: true,
    message: 'Student registered successfully.',
    data: toClientStudent(created.toObject() as PersistedStudent),
  });
}

/**
 * READ  →  GET /api/students
 * Returns the full list of students, newest first.
 *
 * @param _req - Express request (unused).
 * @param res  - Express response used to return the list.
 */
export async function getStudents(_req: Request, res: Response): Promise<void> {
  // `.lean()` returns plain JS objects (faster, and easy to transform).
  const docs = (await Student.find().sort({ createdAt: -1 }).lean()) as unknown as PersistedStudent[];

  // Peel the server layer off every record before sending it back.
  const data = docs.map(toClientStudent);

  res.json({ success: true, count: data.length, data });
}

/**
 * UPDATE  →  PUT /api/student/:id
 * Updates one or more fields of an existing student.
 *
 * @param req - Express request; `req.params.id` is the student id, `req.body`
 *              holds the (partial) encrypted fields to change.
 * @param res - Express response used to return the updated student.
 */
export async function updateStudent(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  assertValidObjectId(id);

  // Allow partial updates: only the fields the client sent will be changed.
  const levelOnePayload = extractEncryptedPayload(req.body, /* partial */ true);
  const levelTwoPayload = encryptStudentFields(levelOnePayload);

  // `new: true` returns the document AFTER the update; `runValidators` re-checks
  // the schema rules (e.g. required fields) on the changed values.
  const updated = (await Student.findByIdAndUpdate(id, levelTwoPayload, {
    new: true,
    runValidators: true,
  }).lean()) as PersistedStudent | null;

  if (!updated) {
    throw new ApiError(404, 'Student not found.');
  }

  res.json({
    success: true,
    message: 'Student updated successfully.',
    data: toClientStudent(updated),
  });
}

/**
 * DELETE  →  DELETE /api/student/:id
 * Permanently removes a student.
 *
 * @param req - Express request; `req.params.id` is the student id to delete.
 * @param res - Express response confirming the deletion.
 */
export async function deleteStudent(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  assertValidObjectId(id);

  const deleted = await Student.findByIdAndDelete(id).lean();

  if (!deleted) {
    throw new ApiError(404, 'Student not found.');
  }

  res.json({
    success: true,
    message: 'Student deleted successfully.',
    data: { id },
  });
}
