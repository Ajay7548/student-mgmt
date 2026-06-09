/**
 * vite.config.ts
 * -----------------------------------------------------------------------------
 * Configuration for Vite, the build tool and dev server that powers the frontend.
 * Vite gives us instant start-up and hot-reloading during development, and an
 * optimised production bundle when we run `npm run build`.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `defineConfig` just gives us type-checking and autocomplete for the options.
export default defineConfig({
  // The React plugin enables JSX and Fast Refresh (live updates without losing state).
  plugins: [react()],
  server: {
    // The port the dev server runs on. Must match CLIENT_ORIGIN in the backend .env.
    port: 5173,
  },
});
