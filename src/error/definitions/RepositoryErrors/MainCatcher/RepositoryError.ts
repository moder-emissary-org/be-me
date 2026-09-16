import { AppError } from "@/error/core/AppError/AppError.js";
import { REPOSITORY_ERROR_STATUS, type RepositoryErrorCode } from "./ErrorCodes.js";

export class RepositoryError extends AppError {
  readonly layer = 'repository';

  constructor(
    public readonly code: RepositoryErrorCode,
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(message, context);
  }
  get statusCode(): number {
    return REPOSITORY_ERROR_STATUS[this.code]
  }
}
