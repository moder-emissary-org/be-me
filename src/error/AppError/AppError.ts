export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly layer: 'repository' | 'service' | 'controller';
  readonly isOperational: boolean = true;

  protected constructor(
    message: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

// This file contains the definition of the AppError abstract class, which serves as a base class for all application-specific errors. It extends the built-in Error class and adds additional properties to capture error context and categorize errors by application layer.