/**
 * ------- MongoServerError Inspectors ---------
*/

import mongoose from "mongoose";

const DUPLICATE_KEY_CODE = 11000;

class PersistenceErrorInspector {
  static isValidationError(error: unknown): error is mongoose.Error.ValidationError {
    return error instanceof mongoose.Error.ValidationError;
  }

  static isMongoServerError(error: unknown): error is mongoose.mongo.MongoServerError {
    return error instanceof mongoose.mongo.MongoServerError;
  }

  static isDuplicateKeyError(error: unknown): error is mongoose.mongo.MongoServerError {
    return this.isMongoServerError(error) && error.code === DUPLICATE_KEY_CODE;
  }

  /** Generic check for a duplicate-key error on a specific field */
  static isDuplicateFieldError(error: unknown, field: string): boolean {
    return (
      this.isDuplicateKeyError(error) &&
      error.keyPattern?.[field] === 1
    );
  }

  static isDuplicateEmailError(error: unknown): boolean {
    return this.isDuplicateFieldError(error, "email");
  }

  static isDuplicateClerkUserIdError(error: unknown): boolean {
    return this.isDuplicateFieldError(error, "clerkUserId");
  }
}

/** Freeze the class to make all methods strictly READ-ONLY */
Object.freeze(PersistenceErrorInspector);

export default PersistenceErrorInspector;