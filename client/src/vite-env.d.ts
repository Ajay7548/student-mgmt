/// <reference types="vite/client" />

/**
 * vite-env.d.ts
 * -----------------------------------------------------------------------------
 * Type definitions for the environment variables we read via `import.meta.env`.
 * Declaring them here gives us autocomplete and compile-time safety so we can't
 * mistype a variable name like `import.meta.env.VITE_API_BASE_URL`.
 */
interface ImportMetaEnv {
  /** Base URL of the backend API, e.g. http://localhost:5000/api */
  readonly VITE_API_BASE_URL: string;
  /** Secret key for the client-side (level-1) AES layer. */
  readonly VITE_CLIENT_ENCRYPTION_KEY: string;
  /** Demo login email used by the Login page gate. */
  readonly VITE_DEMO_EMAIL: string;
  /** Demo login password used by the Login page gate. */
  readonly VITE_DEMO_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
