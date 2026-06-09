/**
 * errorHandler.ts
 * -----------------------------------------------------------------------------
 * Centralised error handling for the API. Instead of every controller formatting
 * its own error responses, they simply throw an `ApiError` (or any Error) and
 * these middleware functions turn it into a consistent JSON response.
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * A custom error type that carries an HTTP status code alongside the message.
 * This lets a controller say "this is a 404" or "this is a 400" in one line:
 *
 *   throw new ApiError(404, 'Student not found');
 */
export class ApiError extends Error {
  /** The HTTP status code to send back to the client (e.g. 400, 404, 500). */
  public readonly statusCode: number;

  /**
   * @param statusCode - The HTTP status code for this error.
   * @param message    - A human-readable description of what went wrong.
   */
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

/**
 * "Not Found" middleware. Express runs this when no earlier route matched the
 * request URL, producing a clean 404 instead of Express's default HTML page.
 *
 * @param req - The incoming request (used only for its URL).
 * @param res - The response object used to send the 404.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * The central error handler. Express recognises this as an error handler because
 * it has FOUR parameters (err, req, res, next). Any `next(error)` call anywhere
 * in the app ends up here.
 *
 * @param err  - The error that was thrown or forwarded.
 * @param _req - The request (unused, hence the leading underscore).
 * @param res  - The response used to send the error JSON.
 * @param _next- Required by Express's signature even though we don't call it.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Default to a generic 500 ("Internal Server Error") ...
  let statusCode = 500;
  let message = 'Something went wrong on the server.';

  // ... but use the richer details when we recognise the error type.
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Log the full error on the server for debugging (never sent to the client).
  console.error('❌  Error:', err);

  res.status(statusCode).json({ success: false, message });
}
