export class CrittoraError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "CrittoraError";
    Object.setPrototypeOf(this, CrittoraError.prototype);
  }
}

export class AuthenticationError extends CrittoraError {
  constructor(message: string) {
    super(message, "AUTH_ERROR");
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class EncryptionError extends CrittoraError {
  constructor(message: string, status?: number) {
    super(message, "ENCRYPTION_ERROR", status);
    this.name = "EncryptionError";
    Object.setPrototypeOf(this, EncryptionError.prototype);
  }
}

export class DecryptionError extends CrittoraError {
  constructor(message: string, status?: number) {
    super(message, "DECRYPTION_ERROR", status);
    this.name = "DecryptionError";
    Object.setPrototypeOf(this, DecryptionError.prototype);
  }
}
