import {
  DecryptInput,
  DecryptResult,
  DecryptVerifyInput,
  DecryptVerifyResult,
  EncryptInput,
  EncryptResult,
  SignEncryptInput,
  SignEncryptResult,
  WireDecryptResult,
  WireDecryptVerifyResult,
  WireEncryptResult,
  WirePermission,
  WireSignEncryptResult,
} from "../types";
import { AuthProvider } from "../auth/types";
import { HttpTransport } from "../transport/httpTransport";
import { DecryptError, EncryptError, RequestError } from "../errors";

export class CryptoResource {
  constructor(
    private readonly transport: HttpTransport,
    private readonly authProvider?: AuthProvider
  ) {}

  async encrypt(input: EncryptInput): Promise<EncryptResult> {
    try {
      const result = await this.transport.request<WireEncryptResult>(
        {
          path: "/encrypt",
          body: {
            data: input.data,
            requested_actions: ["e"],
            ...(input.permissions && {
              permissions: this.serializePermissions(input.permissions),
            }),
          },
        },
        this.authProvider
      );

      return {
        encryptedData: result.encrypted_data,
      };
    } catch (error) {
      throw this.wrapEncryptError("Encryption failed", error);
    }
  }

  async signEncrypt(input: SignEncryptInput): Promise<SignEncryptResult> {
    try {
      const result = await this.transport.request<WireSignEncryptResult>(
        {
          path: "/sign-encrypt",
          body: {
            data: input.data,
            requested_actions: ["e", "s"],
            ...(input.permissions && {
              permissions: this.serializePermissions(input.permissions),
            }),
          },
        },
        this.authProvider
      );

      return {
        encryptedData: result.encrypted_data,
      };
    } catch (error) {
      throw this.wrapEncryptError("Sign-encrypt failed", error);
    }
  }

  async decrypt(input: DecryptInput): Promise<DecryptResult> {
    try {
      const result = await this.transport.request<WireDecryptResult>(
        {
          path: "/decrypt",
          body: {
            encrypted_data: input.encryptedData,
            ...(input.permissions && {
              permissions: this.serializePermissions(input.permissions),
            }),
          },
        },
        this.authProvider
      );

      return {
        decryptedData: result.decrypted_data,
      };
    } catch (error) {
      throw this.wrapDecryptError("Decryption failed", error);
    }
  }

  async decryptVerify(
    input: DecryptVerifyInput
  ): Promise<DecryptVerifyResult> {
    try {
      const result = await this.transport.request<WireDecryptVerifyResult>(
        {
          path: "/decrypt-verify",
          body: {
            encrypted_data: input.encryptedData,
            ...(input.permissions && {
              permissions: this.serializePermissions(input.permissions),
            }),
          },
        },
        this.authProvider
      );

      return {
        decryptedData: result.decrypted_data,
        isValidSignature: result.is_valid_signature,
        signedBy: result.signed_by,
        signedTimestamp: result.signed_timestamp,
        repudiator: result.repudiator,
      };
    } catch (error) {
      throw this.wrapDecryptError("Decrypt-verify failed", error);
    }
  }

  private serializePermissions(
    permissions: EncryptInput["permissions"]
  ): WirePermission[] {
    return (permissions ?? []).map((permission) => ({
      partner_id: permission.partnerId,
      permissions: permission.actions,
    }));
  }

  private wrapEncryptError(message: string, error: unknown): EncryptError {
    if (error instanceof RequestError) {
      return new EncryptError(message, {
        status: error.status,
        details: error.details,
        requestId: error.requestId,
        cause: error,
      });
    }

    return new EncryptError(message, { cause: error });
  }

  private wrapDecryptError(message: string, error: unknown): DecryptError {
    if (error instanceof RequestError) {
      return new DecryptError(message, {
        status: error.status,
        details: error.details,
        requestId: error.requestId,
        cause: error,
      });
    }

    return new DecryptError(message, { cause: error });
  }
}
