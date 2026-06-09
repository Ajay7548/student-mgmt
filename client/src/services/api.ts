/**
 * api.ts
 * -----------------------------------------------------------------------------
 * Creates a single, shared Axios instance that every API call goes through.
 * Centralising it means the base URL, headers, and error handling live in ONE
 * place instead of being repeated in every request.
 */

import axios, { AxiosError } from 'axios';

/**
 * The pre-configured Axios client. `baseURL` is prepended to every request path,
 * so elsewhere we can write `api.get('/students')` instead of the full URL.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Turns a raw Axios error into a clean, human-readable message we can show in
 * the UI. The backend always sends `{ success, message }`, so we try to surface
 * that `message`; otherwise we fall back to a generic description.
 *
 * @param error - The error caught from a failed request (typed as `unknown`).
 * @returns A user-friendly error message string.
 */
export function getApiErrorMessage(error: unknown): string {
  // Axios errors carry the server's response (if any) on `error.response`.
  if (error instanceof AxiosError) {
    const serverMessage = (error.response?.data as { message?: string } | undefined)?.message;
    if (serverMessage) return serverMessage;
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot reach the server. Is the backend running?';
    }
    return error.message;
  }
  // Anything that is not an Axios error (rare) gets a safe generic message.
  return 'An unexpected error occurred.';
}
