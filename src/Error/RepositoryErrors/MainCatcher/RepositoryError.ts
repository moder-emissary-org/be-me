import { AppError } from "@/Error/AppError/AppError.js";

export class RepositoryError extends AppError {
  readonly layer = 'repository';

  constructor(
    public readonly code:
      | 'DB_CONNECTION_FAILED'
      | 'DB_WRITE_FAILED'
      | 'DB_READ_FAILED'
      | 'DB_DUPLICATE_KEY'
      | 'DB_TIMEOUT',
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(message, context);
  }
}
