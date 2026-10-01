import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

/**
 * -> connectDB
 * DB connection is allowed from this func only, 
 */

export const connectDB = async (): Promise<void> => {
  try {
    const MongoURI: string | undefined = process.env.MONGODB_URI;

    if (!MongoURI) {
      throw new Error("__MONGODB_URI is not defined in environment variables__");
    }

    const connectionInstance = await mongoose.connect(`${MongoURI}/${DB_NAME}`);

    console.info("db.connected", {
      provider: "mongodb",
      host: connectionInstance.connection.host,
    });

  } catch (error: unknown) {
    console.error("db.connection_failed", {
      provider: "mongodb",
      error:
        error instanceof Error ? error.message : "UNKNOWN_ERROR",
    });

    throw error;
  }
}

