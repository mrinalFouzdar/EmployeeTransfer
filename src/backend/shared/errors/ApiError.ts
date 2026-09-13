export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly extra: Record<string, unknown>;

  constructor(statusCode: number, code: string, extra: Record<string, unknown> = {}) {
    super(code);
    this.statusCode = statusCode;
    this.code = code;
    this.extra = extra;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  toBody() {
    return { error: this.code, ...this.extra };
  }
}
