/**
 * asyncHandler.ts
 * -----------------------------------------------------------------------------
 * A tiny helper that removes repetitive `try/catch` blocks from our route handlers.
 *
 * Express (version 4) does NOT automatically catch errors thrown inside `async`
 * functions. Without help, an error in an async controller would hang the request
 * forever. This wrapper catches any rejected promise and forwards the error to
 * Express's error-handling middleware via `next(error)`.
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async route handler so that any thrown error or rejected promise is
 * automatically passed to Express's central error handler.
 *
 * Usage:
 *   router.get('/students', asyncHandler(getStudents));
 *
 * @param handler - An async Express request handler.
 * @returns A normal Express handler with automatic error forwarding.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    // `Promise.resolve(...)` guarantees we have a promise, then `.catch(next)`
    // forwards any error to the error-handling middleware.
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
