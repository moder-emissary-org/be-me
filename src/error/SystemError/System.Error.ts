export class SystemError extends Error {
  readonly layer = 'service';

  constructor(
    public readonly code:
      | 'ADMIN_USER_CREATION_FAILED'
      | 'SOCIETY_CREATION_FAILED',
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(message, context);
  }
}