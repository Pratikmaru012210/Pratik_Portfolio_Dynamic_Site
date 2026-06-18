import mongoose from "mongoose";
import dns from "dns";

// Configure public DNS servers to resolve MongoDB Atlas SRV records under local network restrictions
dns.setServers(["8.8.8.8", "1.1.1.1"]);


const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable inside .env.local");
}

// Global cached connection reference for serverless environment
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCached: MongooseCache | undefined;
}

const cached = (global.mongooseCached || { conn: null, promise: null }) as MongooseCache;

if (!global.mongooseCached) {
  global.mongooseCached = cached;
}

export default async function connectDB() {
  if (cached?.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("Establishing new MongoDB connection...");
    const startConnect = Date.now();
    cached.promise = mongoose.connect(MONGO_URI!, opts).then((mongooseInstance) => {
      const endConnect = Date.now();
      console.log(`MongoDB Connect Time: ${endConnect - startConnect}ms`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
