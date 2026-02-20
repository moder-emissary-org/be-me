import { AppError } from "@/Error/AppError/AppError.js";

export class ControllerError extends AppError {
  readonly layer = 'controller';

  constructor(
    public readonly code:
      | 'BAD_REQUEST'
      | 'UNAUTHORIZED'
      | 'FORBIDDEN'
      | 'NOT_FOUND'
      | 'CONFLICT'
      | 'INTERNAL_ERROR',
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(message, context);
  }
}
