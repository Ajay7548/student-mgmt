/**
 * student.ts (types)
 * -----------------------------------------------------------------------------
 * Central place for the TypeScript types that describe a Student throughout the
 * frontend. Keeping them here means every component and service agrees on the
 * exact same shape, and a change only has to be made in one spot.
 */

/**
 * The plaintext student data as a human types it into the form and as it is shown
 * on screen. These values are NEVER sent to the network in this raw form — they
 * are encrypted first (see utils/crypto.ts).
 */
export interface StudentFormData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string; // Stored as an ISO date string, e.g. "2001-05-20".
  gender: string;
  address: string;
  course: string;
  password: string;
}

/**
 * A student as returned by the API and displayed in the list. It is the plaintext
 * form data plus the server-generated metadata (`id` and timestamps).
 */
export interface Student extends StudentFormData {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * The standard envelope every API response is wrapped in by the backend.
 * The generic `T` is the type of the `data` payload for a given endpoint.
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}
