/**
 * crypto.ts  (FRONTEND / CLIENT-SIDE ENCRYPTION  —  LEVEL 1 / INNER LAYER)
 * -----------------------------------------------------------------------------
 * This file implements the FIRST of the two encryption layers.
 *
 * The browser encrypts every field BEFORE it ever leaves the user's machine, and
 * decrypts data only AFTER it arrives back. This means the data travels the
 * network already scrambled, and the server stores it scrambled twice over.
 *
 *   PLAINTEXT  ──encrypt() with CLIENT key──►  LEVEL-1 CIPHERTEXT  ──► server
 *   PLAINTEXT  ◄──decrypt() with CLIENT key──  LEVEL-1 CIPHERTEXT  ◄── server
 *
 * We use the same `crypto-js` AES library as the backend so both sides speak an
 * identical, easy-to-explain encryption dialect (just with different keys).
 */

import CryptoJS from 'crypto-js';
import type { Student, StudentFormData } from '../types/student';

// The client-side secret key, read from the Vite environment (see .env.example).
const CLIENT_KEY = import.meta.env.VITE_CLIENT_ENCRYPTION_KEY;

// Fail loudly during development if the key was not configured, instead of
// silently producing broken ciphertext.
if (!CLIENT_KEY) {
  throw new Error(
    'VITE_CLIENT_ENCRYPTION_KEY is not set. Copy client/.env.example to client/.env.',
  );
}

/** The student fields that get encrypted, kept in one list to avoid duplication. */
const STUDENT_FIELDS: (keyof StudentFormData)[] = [
  'fullName',
  'email',
  'phone',
  'dateOfBirth',
  'gender',
  'address',
  'course',
  'password',
];

/**
 * Encrypts a single plaintext string with the client key (adds the level-1 layer).
 *
 * @param value - The human-readable text to protect.
 * @returns The level-1 ciphertext string to send to the server.
 */
export function encryptValue(value: string): string {
  return CryptoJS.AES.encrypt(value, CLIENT_KEY).toString();
}

/**
 * Decrypts a single level-1 ciphertext string back into plaintext.
 *
 * @param value - The level-1 ciphertext received from the server.
 * @returns The original plaintext. Returns an empty string if decryption fails
 *          (e.g. the key changed), so the UI degrades gracefully instead of crashing.
 */
export function decryptValue(value: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(value, CLIENT_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '';
  }
}

/**
 * Encrypts every field of a student form object before it is sent to the API.
 *
 * @param data - The plaintext form values typed by the user.
 * @returns An object with the same keys, but each value encrypted (level-1).
 */
export function encryptStudent(data: StudentFormData): Record<string, string> {
  const encrypted: Record<string, string> = {};
  for (const field of STUDENT_FIELDS) {
    encrypted[field] = encryptValue(data[field]);
  }
  return encrypted;
}

/**
 * Decrypts a student object received from the API back into readable values.
 *
 * The server sends the encrypted fields (level-1 ciphertext) plus plaintext
 * metadata (`id`, `createdAt`, `updatedAt`). We decrypt the former and keep the latter.
 *
 * @param data - A student object from the API with encrypted fields.
 * @returns A fully decrypted `Student` ready to display in the UI.
 */
export function decryptStudent(data: Record<string, unknown>): Student {
  const decrypted: Record<string, string> = {};
  for (const field of STUDENT_FIELDS) {
    const value = data[field];
    decrypted[field] = typeof value === 'string' ? decryptValue(value) : '';
  }

  return {
    id: String(data.id ?? ''),
    fullName: decrypted.fullName,
    email: decrypted.email,
    phone: decrypted.phone,
    dateOfBirth: decrypted.dateOfBirth,
    gender: decrypted.gender,
    address: decrypted.address,
    course: decrypted.course,
    password: decrypted.password,
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : undefined,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
  };
}
