/**
 * env.ts
 * -----------------------------------------------------------------------------
 * Loads environment variables from the `.env` file and exposes them as a single,
 * strongly-typed `env` object for the rest of the app to import.
 *
 * Why centralise this?
 *  - We read `process.env` in exactly ONE place, so the rest of the code never
 *    has to worry about missing variables or string/undefined checks.
 *  - If a required variable is missing we fail fast with a clear error message,
 *    instead of getting a confusing crash deep inside the app later on.
 */

import dotenv from 'dotenv';

// `dotenv.config()` reads the `.env` file (if present) and copies its
// key=value pairs into `process.env`. Must run before we read any variable.
dotenv.config();

/**
 * Reads a required environment variable.
 * Throws a descriptive error if it is missing so misconfiguration is obvious.
 *
 * @param key  - The name of the environment variable to read.
 * @returns    - The variable's value as a string.
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable "${key}". ` +
        `Did you copy server/.env.example to server/.env and fill it in?`,
    );
  }
  return value;
}

/**
 * Reads an optional environment variable, returning a fallback when it is unset.
 *
 * @param key          - The name of the environment variable to read.
 * @param fallback     - The default value to use when the variable is missing.
 * @returns            - The variable's value, or the fallback.
 */
function optionalEnv(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value.trim() !== '' ? value : fallback;
}

/**
 * The single, validated configuration object used throughout the backend.
 * `as const` makes every property read-only, preventing accidental mutation.
 */
export const env = {
  /** Port the HTTP server listens on (defaults to 5000). */
  port: Number(optionalEnv('PORT', '5000')),

  /** MongoDB connection string. */
  mongoUri: requireEnv('MONGODB_URI'),

  /** Secret key for the server-side (level-2) AES encryption layer. */
  serverEncryptionKey: requireEnv('SERVER_ENCRYPTION_KEY'),

  /** Frontend origin allowed by CORS. */
  clientOrigin: optionalEnv('CLIENT_ORIGIN', 'http://localhost:5173'),
} as const;
