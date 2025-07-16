import mongoose from 'mongoose';

const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017/ack-guest-house';

if (!MONGODB_URI) {
  throw new Error('Please define the VITE_MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global cache to prevent multiple connections in development
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached!.conn = await cached!.promise;
    console.log('✅ Connected to MongoDB successfully');
    return cached!.conn;
  } catch (e) {
    cached!.promise = null;
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }
}

export async function testMongoConnection(): Promise<boolean> {
  try {
    await connectToDatabase();
    return mongoose.connection.readyState === 1;
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return false;
  }
}

export { mongoose };