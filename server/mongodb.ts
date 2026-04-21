import mongoose from "mongoose";

/**
 * Cached connection for serverless environments (Vercel, Lambda).
 * In serverless, each invocation may reuse a warm container — caching the
 * connection on `globalThis` prevents opening a new socket every request.
 * Works identically in traditional long-running servers.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const g = globalThis as unknown as { __mongooseCache?: MongooseCache };
if (!g.__mongooseCache) {
  g.__mongooseCache = { conn: null, promise: null };
}
const cached = g.__mongooseCache;

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        bufferCommands: false,
        maxPoolSize: 1,           // serverless: one connection per function instance
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      .then((m) => {
        console.log("[MongoDB] Connected successfully");
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        console.error("[MongoDB] Connection failed:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function disconnectFromDatabase() {
  if (!cached.conn) return;

  try {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log("[MongoDB] Disconnected successfully");
  } catch (error) {
    console.error("[MongoDB] Disconnection failed:", error);
    throw error;
  }
}

export function getMongooseConnection() {
  return mongoose.connection;
}
