/**
 * studentService.ts
 * -----------------------------------------------------------------------------
 * The single gateway between the React UI and the backend's student endpoints.
 *
 * Every function here follows the same secure pattern:
 *   - BEFORE sending data out  → encrypt it (level-1) with `encryptStudent`.
 *   - AFTER receiving data back → decrypt it (level-1) with `decryptStudent`.
 *
 * Components never deal with encryption directly; they just call these functions
 * with plain, readable data and get plain, readable data back.
 */

import { api } from './api';
import { encryptStudent, decryptStudent } from '../utils/crypto';
import type { ApiResponse, Student, StudentFormData } from '../types/student';

/**
 * CREATE — registers a new student.
 * Endpoint: POST /api/register
 *
 * @param formData - The plaintext student details from the form.
 * @returns The newly created student (decrypted), including its server-assigned id.
 */
export async function createStudent(formData: StudentFormData): Promise<Student> {
  // Encrypt every field (level-1) before it leaves the browser.
  const encryptedPayload = encryptStudent(formData);

  const response = await api.post<ApiResponse<Record<string, unknown>>>(
    '/register',
    encryptedPayload,
  );

  // Decrypt the echoed-back record so the UI can show it immediately.
  return decryptStudent(response.data.data);
}

/**
 * READ — fetches the full list of students.
 * Endpoint: GET /api/students
 *
 * @returns An array of students, each decrypted and ready to display.
 */
export async function getStudents(): Promise<Student[]> {
  const response = await api.get<ApiResponse<Record<string, unknown>[]>>('/students');

  // The API returns an array of encrypted records; decrypt each one.
  return response.data.data.map(decryptStudent);
}

/**
 * UPDATE — edits an existing student.
 * Endpoint: PUT /api/student/:id
 *
 * @param id       - The id of the student to update.
 * @param formData - The updated plaintext student details.
 * @returns The updated student (decrypted).
 */
export async function updateStudent(id: string, formData: StudentFormData): Promise<Student> {
  const encryptedPayload = encryptStudent(formData);

  const response = await api.put<ApiResponse<Record<string, unknown>>>(
    `/student/${id}`,
    encryptedPayload,
  );

  return decryptStudent(response.data.data);
}

/**
 * DELETE — removes a student.
 * Endpoint: DELETE /api/student/:id
 *
 * @param id - The id of the student to delete.
 * @returns The id that was deleted (echoed back by the server).
 */
export async function deleteStudent(id: string): Promise<string> {
  const response = await api.delete<ApiResponse<{ id: string }>>(`/student/${id}`);
  return response.data.data.id;
}
