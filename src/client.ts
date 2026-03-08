import { bearerToken } from "./auth/bearer";
import { AuthProvider } from "./auth/types";
import {
  CrittoraClientOptions,
  DecryptInput,
  DecryptResult,
  DecryptVerifyInput,
  DecryptVerifyResult,
  EncryptInput,
  EncryptResult,
  SignEncryptInput,
  SignEncryptResult,
} from "./types";
import { CryptoResource } from "./resources/crypto";
import { HttpTransport } from "./transport/httpTransport";

const DEFAULT_BASE_URL = "https://api.crittoraapis.com";
const DEFAULT_TIMEOUT_MS = 10_000;

export class CrittoraClient {
  private readonly transport: HttpTransport;
  private readonly authProvider?: AuthProvider;
  private readonly cryptoResource: CryptoResource;

  constructor(private readonly options: CrittoraClientOptions = {}) {
    this.authProvider = this.resolveAuthProvider(options.auth);
    this.transport = new HttpTransport(
      {
        baseUrl: options.baseUrl ?? DEFAULT_BASE_URL,
        credentials: options.credentials,
        headers: options.headers,
        timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        userAgent: options.userAgent,
      },
      {
        fetch: options.fetch,
        retry: options.retry,
      }
    );
    this.cryptoResource = new CryptoResource(this.transport, this.authProvider);
  }

  get auth(): AuthProvider | undefined {
    return this.authProvider;
  }

  withAuth(
    auth: AuthProvider | { type: "bearer"; token: string }
  ): CrittoraClient {
    return new CrittoraClient({
      ...this.options,
      auth,
    });
  }

  async encrypt(input: EncryptInput): Promise<EncryptResult> {
    return this.cryptoResource.encrypt(input);
  }

  async signEncrypt(input: SignEncryptInput): Promise<SignEncryptResult> {
    return this.cryptoResource.signEncrypt(input);
  }

  async decrypt(input: DecryptInput): Promise<DecryptResult> {
    return this.cryptoResource.decrypt(input);
  }

  async decryptVerify(
    input: DecryptVerifyInput
  ): Promise<DecryptVerifyResult> {
    return this.cryptoResource.decryptVerify(input);
  }

  private resolveAuthProvider(
    auth?: CrittoraClientOptions["auth"]
  ): AuthProvider | undefined {
    if (!auth) {
      return undefined;
    }

    if ("type" in auth && auth.type === "bearer") {
      return bearerToken(auth.token);
    }

    if ("getAuthorizationHeader" in auth) {
      return auth;
    }

    return undefined;
  }
}
