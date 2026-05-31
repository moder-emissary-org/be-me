import { AppError } from "@/error/AppError/AppError.js";

export class ServiceError extends AppError {
  readonly layer = 'service';

  constructor(
    public readonly code:
      | 'SERVICE_INPUT_INVALID'
      | 'USER_ALREADY_REGISTERED'
      | 'ROLE_CONSTRAINT_VIOLATION'
      | 'SOCIETY_NOT_FOUND'
      | 'APARTMENT_SCOPE_INVALID'
      | 'OPERATION_NOT_ALLOWED'
      | 'USER_NOT_FOUND'
      | 'DUPLICATE_APARTMENT_FOUND'
      | 'SOCIETY_CREATION_FAILED'
      | 'OPERATION_FAILED'
      | 'SOCIETY_ALREADY_BOOTSTRAPPED'
      | 'ADMIN_NOT_FOUND'
      | 'INVITATION_FAILED'
      | 'INVITATION_ALREADY_EXISTS'
      | 'APARTMENT_NOT_FOUND'
      | 'USER_INACTIVE'
      | 'INSUFFICIENT_PERMISSIONS'
      | 'VISITOR_NOT_FOUND'
      | 'VISITOR_NOT_BELONGS_TO_APARTMENT'
      | 'VISITOR_NOT_BELONGS_TO_SOCIETY'
      | 'VISITOR_NOT_BELONGS_TO_RESIDENT'
      | 'INVALID_VISITOR_APPROVAL_TRANSITION'
      | 'COMPLAINT_NOT_FOUND'
      | 'INVALID_COMPLAINT_STATUS_TRANSITION',
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(message, context);
  }
}
