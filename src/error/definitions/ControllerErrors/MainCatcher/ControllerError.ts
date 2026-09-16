import { AppError } from "@/error/core/AppError/AppError.js";
import { CONTROLLER_ERROR_STATUS, type ControllerErrorCode } from "./ErrorCodes.js";

export class ControllerError extends AppError {
  readonly layer = 'controller';

  constructor(
    public readonly code: ControllerErrorCode,
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(message, context);
  }

  get statusCode(): number {
    return CONTROLLER_ERROR_STATUS[this.code];
  }
}
