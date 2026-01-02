import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

/**
 * -> Establishes a connection to the MongoDB database using Mongoose.
 * -> This function retrieves the MongoDB URI from environment variables 
 * and attempts to connect to the specified database.
 * -> If the connection fails due to a missing URI, it logs an error
 * message and exits the process.
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
      db: DB_NAME,
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

