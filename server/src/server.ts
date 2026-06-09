/**
 * server.ts
 * -----------------------------------------------------------------------------
 * The application ENTRY POINT. Running `npm run dev` (or `npm start` after a
 * build) executes this file. Its job is to:
 *   1. Connect to MongoDB.
 *   2. Start the Express HTTP server listening for requests.
 *   3. Shut everything down gracefully when the process is asked to stop.
 */

import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/db';

/**
 * Boots the whole backend in the correct order and wires up graceful shutdown.
 */
async function startServer(): Promise<void> {
  // 1. Connect to the database FIRST. If this fails we never start the server,
  //    so the app is never "up" while unable to read/write data.
  await connectDatabase();

  // 2. Build the Express app and start listening on the configured port.
  const app = createApp();
  const httpServer = app.listen(env.port, () => {
    console.log(`🚀  API server running at http://localhost:${env.port}`);
  });

  /**
   * Gracefully shuts down: stop accepting new connections, then close the DB.
   * This runs when the hosting platform (or Ctrl+C) sends a stop signal.
   *
   * @param signal - The OS signal that triggered the shutdown (e.g. "SIGINT").
   */
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received — shutting down gracefully...`);
    httpServer.close(); // Stop accepting new HTTP requests.
    await disconnectDatabase(); // Close the MongoDB connection.
    process.exit(0);
  };

  // SIGINT  = you pressed Ctrl+C.   SIGTERM = the platform asked us to stop.
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

// Kick everything off. If start-up fails, log the reason and exit with a
// non-zero code so tooling/hosting knows the launch was unsuccessful.
startServer().catch((error) => {
  console.error('❌  Failed to start the server:', error);
  process.exit(1);
});
