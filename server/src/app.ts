/**
 * app.ts
 * -----------------------------------------------------------------------------
 * Builds and configures the Express application: middleware, routes, and error
 * handlers. We deliberately keep this SEPARATE from `server.ts` (which actually
 * starts listening) so the app can be imported and tested without opening a port.
 */

import express, { type Application, type Request, type Response } from 'express';
import cors, { type CorsOptions } from 'cors';
import { env } from './config/env';
import studentRoutes from './routes/studentRoutes';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

/** Matches any localhost origin, e.g. http://localhost:5173 or http://127.0.0.1:3000. */
const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * Decides which website origins may call this API.
 *
 * - The configured `CLIENT_ORIGIN` is always allowed.
 * - Requests with no Origin header (e.g. curl, mobile apps, server-to-server) are
 *   allowed — the browser is what enforces CORS, so these are not cross-site risks.
 * - In DEVELOPMENT only, any localhost origin is allowed too, so the app keeps
 *   working even if Vite picks a different port (e.g. 5174 when 5173 is busy).
 * - In PRODUCTION, only `CLIENT_ORIGIN` is accepted.
 */
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    const isProduction = process.env.NODE_ENV === 'production';
    const isLocalhost = !!origin && LOCALHOST_ORIGIN.test(origin);

    if (!origin || origin === env.clientOrigin || (!isProduction && isLocalhost)) {
      callback(null, true); // Allowed.
    } else {
      callback(new Error(`Origin "${origin}" is not allowed by CORS.`));
    }
  },
};

/**
 * Creates a fully configured Express application instance.
 *
 * @returns The ready-to-use Express `Application`.
 */
export function createApp(): Application {
  const app = express();

  // ----- Global middleware (runs on every request, in order) ----------------

  // CORS = Cross-Origin Resource Sharing. The browser blocks a website from
  // calling an API on a different origin unless the API opts in. See `corsOptions`
  // above for exactly which origins are permitted.
  app.use(cors(corsOptions));

  // Parse incoming JSON request bodies into `req.body` (with a sane size limit).
  app.use(express.json({ limit: '1mb' }));

  // ----- Health-check route --------------------------------------------------
  // A simple endpoint to confirm the server is alive (useful for uptime checks).
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ success: true, status: 'ok' });
  });

  // ----- Feature routes ------------------------------------------------------
  // Mount the student router; every route inside it is prefixed with `/api`.
  app.use('/api', studentRoutes);

  // ----- Fallback handlers (must be registered LAST) -------------------------
  // 1. Any request that didn't match a route above → 404.
  app.use(notFoundHandler);
  // 2. Any error thrown anywhere above → consistent JSON error response.
  app.use(errorHandler);

  return app;
}
