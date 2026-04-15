const mongoose = require('mongoose');

// Cache the connection across serverless invocations (warm starts reuse it)
let cached = { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      serverApi: { version: '1', strict: true, deprecationErrors: true },
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
  } catch (error) {
    cached.promise = null; // reset so next request retries
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
