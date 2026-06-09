/**
 * Student.ts
 * -----------------------------------------------------------------------------
 * Defines the Mongoose "schema" and "model" for a Student document.
 *
 *  - A SCHEMA describes the shape of the data (which fields exist and their types).
 *  - A MODEL is the object we actually use to create / read / update / delete
 *    documents in the `students` collection.
 *
 * IMPORTANT: Every student field below is stored as a `String` because, by the
 * time the data reaches the database, it is DOUBLE-ENCRYPTED ciphertext — not a
 * real name, email, or date. The database only ever sees scrambled text.
 */

import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

/**
 * The schema. The second argument, `{ timestamps: true }`, tells Mongoose to
 * automatically add and maintain two extra fields:
 *   - `createdAt`: when the document was first saved.
 *   - `updatedAt`: when it was last modified.
 * These are stored in plain text (they are not sensitive) and are handy for the UI.
 */
const studentSchema = new Schema(
  {
    // Each field is `required` so we never accidentally store a half-empty record.
    // `trim: true` removes accidental leading/trailing whitespace.
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    dateOfBirth: { type: String, required: true, trim: true },
    gender: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
    // `toJSON` controls how a document is converted when sent as JSON in a response.
    toJSON: {
      virtuals: true,
      // Reshape the output: expose a friendly `id` string and hide Mongo internals
      // (`_id` and the version key `__v`) so the API response stays clean.
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

/**
 * A TypeScript type automatically inferred from the schema above. This gives us
 * full type-safety (autocomplete + compile-time checks) without writing the field
 * list out twice.
 */
export type StudentAttributes = InferSchemaType<typeof studentSchema>;

/** The type of a single Student document as it lives inside the app. */
export type StudentDocument = HydratedDocument<StudentAttributes>;

/**
 * The Student model. Importing this elsewhere lets us run queries such as
 * `Student.find()`, `Student.create(...)`, `Student.findByIdAndUpdate(...)`, etc.
 */
export const Student = model<StudentAttributes>('Student', studentSchema);
