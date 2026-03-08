export interface CrittoraErrorOptions {
  code: string;
  status?: number;
  details?: unknown;
  requestId?: string;
  cause?: unknown;
}

export class CrittoraError extends Error {
  public readonly code: string;
  public readonly status?: number;
  public readonly details?: unknown;
  public readonly requestId?: string;
  public readonly cause?: unknown;

  constructor(message: string, options: CrittoraErrorOptions) {
    super(message);
    this.name = "CrittoraError";
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
    this.requestId = options.requestId;
    this.cause = options.cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends CrittoraError {
  constructor(message: string, details?: unknown) {
    super(message, { code: "VALIDATION_ERROR", details });
    this.name = "ValidationError";
  }
}

export class AuthError extends CrittoraError {
  constructor(message: string, details?: unknown, cause?: unknown) {
    super(message, { code: "AUTH_ERROR", details, cause });
    this.name = "AuthError";
  }
}

export class RequestError extends CrittoraError {
  constructor(
    message: string,
    options: Omit<CrittoraErrorOptions, "code"> = {}
  ) {
    super(message, { code: "REQUEST_ERROR", ...options });
    this.name = "RequestError";
  }
}

export class RateLimitError extends CrittoraError {
  constructor(
    message: string,
    options: Omit<CrittoraErrorOptions, "code"> = {}
  ) {
    super(message, { code: "RATE_LIMIT_ERROR", ...options });
    this.name = "RateLimitError";
  }
}

export class EncryptError extends CrittoraError {
  constructor(
    message: string,
    options: Omit<CrittoraErrorOptions, "code"> = {}
  ) {
    super(message, { code: "ENCRYPT_ERROR", ...options });
    this.name = "EncryptError";
  }
}

export class DecryptError extends CrittoraError {
  constructor(
    message: string,
    options: Omit<CrittoraErrorOptions, "code"> = {}
  ) {
    super(message, { code: "DECRYPT_ERROR", ...options });
    this.name = "DecryptError";
  }
}
