/**
 * db.ts
 * -----------------------------------------------------------------------------
 * Handles connecting to (and disconnecting from) the MongoDB database using
 * Mongoose. Mongoose is an "ODM" (Object Data Modeling) library: it lets us
 * describe our data with schemas and work with plain JavaScript objects instead
 * of raw database queries.
 */

import mongoose from 'mongoose';
import { env } from './env';

/**
 * Opens a connection to MongoDB.
 *
 * We `await` this once during start-up (see `server.ts`). If the connection
 * fails we throw, which stops the server from starting in a broken state.
 *
 * @returns A promise that resolves once the connection is established.
 */
export async function connectDatabase(): Promise<void> {
  // `strictQuery` makes Mongoose ignore fields that are not in our schema when
  // building queries — a safer default that prevents accidental typos in filters.
  mongoose.set('strictQuery', true);

  // Attempt the connection. The connection string comes from our validated env.
  await mongoose.connect(env.mongoUri);

  console.log('✅  Connected to MongoDB');
}

/**
 * Closes the MongoDB connection cleanly.
 *
 * Called when the process is shutting down (e.g. you press Ctrl+C) so that we
 * don't leave dangling connections open on the database server.
 *
 * @returns A promise that resolves once the connection is closed.
 */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
  console.log('👋  Disconnected from MongoDB');
}
