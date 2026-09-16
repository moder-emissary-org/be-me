import { AppError } from "@/error/core/AppError/AppError.js";
import { SERVICE_ERROR_STATUS, type ServiceErrorCode } from "./ErrorCodes.js";

export class ServiceError extends AppError {
  /** LAYER */
  readonly layer = 'service';

  constructor(
    public readonly code: ServiceErrorCode,
    message: string,
    context?: Record<string, unknown>,

  ) {
    super(message, context);
  }

  get statusCode(): number {
    return SERVICE_ERROR_STATUS[this.code]; 
  }
}
