export class Service_InputMissingFieldsError extends Error {
  readonly code = 'SERVICE_INPUT_INVALID';

  constructor(
    message: string,
    public readonly missingFields: string[],
  ) {
    super(message);
  }
}