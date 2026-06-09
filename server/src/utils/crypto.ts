/**
 * crypto.ts  (BACKEND / SERVER-SIDE ENCRYPTION  —  LEVEL 2 / OUTER LAYER)
 * -----------------------------------------------------------------------------
 * This file implements the SECOND of the two encryption layers.
 *
 * Reminder of the full data flow (see the README for the big picture):
 *
 *   PLAINTEXT
 *      │  (1) the browser encrypts with the CLIENT key  →  "level-1 ciphertext"
 *      ▼
 *   LEVEL-1 CIPHERTEXT   ──────────────►  sent over the network to this server
 *      │  (2) THIS FILE encrypts again with the SERVER key  →  "level-2 ciphertext"
 *      ▼
 *   LEVEL-2 CIPHERTEXT   ──────────────►  stored in MongoDB (double-encrypted)
 *
 * On the way back out we simply reverse step (2): we peel off OUR layer and hand
 * the still-encrypted level-1 ciphertext back to the browser, which peels the last
 * layer itself. The server therefore NEVER sees the real plaintext — a nice
 * privacy property of this design.
 *
 * We use the well-known `crypto-js` library so that BOTH the client and the
 * server speak the exact same AES dialect, which keeps the explanation simple.
 */

import CryptoJS from 'crypto-js';
import { env } from '../config/env';

/**
 * The list of student fields that are encrypted. We keep it in one place so the
 * controller, the model, and these helpers can never drift out of sync.
 */
export const STUDENT_ENCRYPTED_FIELDS = [
  'fullName',
  'email',
  'phone',
  'dateOfBirth',
  'gender',
  'address',
  'course',
  'password',
] as const;

/** A union type of the encrypted field names, e.g. "fullName" | "email" | ... */
export type EncryptedField = (typeof STUDENT_ENCRYPTED_FIELDS)[number];

/**
 * Encrypts a single string with the server's secret key (adds the level-2 layer).
 *
 * `CryptoJS.AES.encrypt` returns an object; calling `.toString()` on it produces
 * the classic OpenSSL-style, Base64-encoded ciphertext (it embeds a random salt,
 * so encrypting the same value twice yields different output — a good thing).
 *
 * @param value - The text to encrypt (here, it is already level-1 ciphertext).
 * @returns The level-2 ciphertext string, safe to store in the database.
 */
export function encrypt(value: string): string {
  return CryptoJS.AES.encrypt(value, env.serverEncryptionKey).toString();
}

/**
 * Decrypts a single string with the server's secret key (removes the level-2 layer).
 *
 * @param value - The level-2 ciphertext read from the database.
 * @returns The level-1 ciphertext (still encrypted with the client key).
 * @throws If the value cannot be decrypted (e.g. the key is wrong or data is corrupt).
 */
export function decrypt(value: string): string {
  const bytes = CryptoJS.AES.decrypt(value, env.serverEncryptionKey);
  const result = bytes.toString(CryptoJS.enc.Utf8);

  // When the key is wrong, crypto-js returns an empty string rather than throwing,
  // so we detect that case explicitly and surface a clear error instead.
  if (!result) {
    throw new Error('Server-side decryption failed (wrong key or corrupted data).');
  }
  return result;
}

/**
 * A plain object whose known student fields are strings. We use `Partial` because
 * an update request might only include SOME of the fields.
 */
type StudentFieldMap = Partial<Record<EncryptedField, string>>;

/**
 * Adds the server (level-2) encryption layer to every known student field that is
 * present in the given object. Unknown keys are ignored.
 *
 * Used right BEFORE saving a record to MongoDB.
 *
 * @param data - An object containing level-1 ciphertext for some/all student fields.
 * @returns A new object with each known field encrypted one more time.
 */
export function encryptStudentFields(data: StudentFieldMap): StudentFieldMap {
  const output: StudentFieldMap = {};
  for (const field of STUDENT_ENCRYPTED_FIELDS) {
    const value = data[field];
    // Only touch fields that were actually provided (supports partial updates).
    if (typeof value === 'string') {
      output[field] = encrypt(value);
    }
  }
  return output;
}

/**
 * Removes the server (level-2) encryption layer from every known student field.
 *
 * Used right AFTER reading a record from MongoDB and BEFORE sending it back to the
 * browser. The returned object still holds level-1 ciphertext — the browser will
 * decrypt that final layer itself.
 *
 * @param data - An object containing level-2 ciphertext for the student fields.
 * @returns A new object with each known field decrypted back to level-1 ciphertext.
 */
export function decryptStudentFields(data: StudentFieldMap): StudentFieldMap {
  const output: StudentFieldMap = {};
  for (const field of STUDENT_ENCRYPTED_FIELDS) {
    const value = data[field];
    if (typeof value === 'string') {
      output[field] = decrypt(value);
    }
  }
  return output;
}
