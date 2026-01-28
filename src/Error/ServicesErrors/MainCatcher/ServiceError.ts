import { AppError } from "@/Error/AppError/AppError.js";

export class ServiceError extends AppError {
  readonly layer = 'service';

  constructor(
    public readonly code:
      | 'SERVICE_INPUT_INVALID'
      | 'USER_ALREADY_REGISTERED'
      | 'ROLE_CONSTRAINT_VIOLATION'
      | 'SOCIETY_NOT_FOUND'
      | 'APARTMENT_SCOPE_INVALID'
      | 'OPERATION_NOT_ALLOWED',
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(message, context);
  }
}
