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
