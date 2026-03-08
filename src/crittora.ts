import { cognitoAuthProvider } from "./auth/cognito";
import { CrittoraClient } from "./client";
import {
  CognitoAuthConfig,
  CrittoraClientOptions,
  LegacyAuthResponse,
  Permission,
} from "./types";

export interface LegacyCrittoraOptions extends CrittoraClientOptions {
  cognito?: CognitoAuthConfig;
}

export class Crittora {
  private readonly client: CrittoraClient;
  private readonly cognito: ReturnType<typeof cognitoAuthProvider>;

  constructor(private readonly options: LegacyCrittoraOptions = {}) {
    this.cognito = cognitoAuthProvider({
      userPoolId: options.cognito?.userPoolId ?? "us-east-1_Tmljk4Uiw",
      clientId: options.cognito?.clientId ?? "5cvaao4qgphfp38g433vi5e82u",
      username: options.cognito?.username,
      password: options.cognito?.password,
    });
    this.client = new CrittoraClient({
      ...options,
      baseUrl: options.baseUrl ?? "https://api.crittoraapis.com",
      credentials:
        options.credentials ??
        (process.env.API_KEY
          ? {
              apiKey: process.env.API_KEY,
              accessKey: process.env.ACCESS_KEY,
              secretKey: process.env.SECRET_KEY,
            }
          : undefined),
    });
  }

  async authenticate(
    username: string,
    password: string
  ): Promise<LegacyAuthResponse> {
    const tokens = await this.cognito.login({ username, password });
    return {
      IdToken: tokens.idToken,
      AccessToken: tokens.accessToken,
      RefreshToken: tokens.refreshToken,
    };
  }

  async encrypt(
    idToken: string,
    data: string,
    permissions?: string[]
  ): Promise<string> {
    const result = await this.client
      .withAuth({ type: "bearer", token: idToken })
      .encrypt({
        data,
        permissions: this.toLegacyPermissions(permissions),
      });

    return result.encryptedData;
  }

  async signEncrypt(
    idToken: string,
    data: string,
    permissions?: string[]
  ): Promise<string> {
    const result = await this.client
      .withAuth({ type: "bearer", token: idToken })
      .signEncrypt({
        data,
        permissions: this.toLegacyPermissions(permissions),
      });

    return result.encryptedData;
  }

  async decrypt(
    idToken: string,
    encryptedData: string,
    permissions?: string[]
  ): Promise<string> {
    const result = await this.client
      .withAuth({ type: "bearer", token: idToken })
      .decrypt({
        encryptedData,
        permissions: this.toLegacyPermissions(permissions),
      });

    return result.decryptedData;
  }

  async decryptVerify(
    idToken: string,
    encryptedData: string,
    permissions?: string[]
  ): Promise<{
    decrypted_data: string;
    is_valid_signature: boolean;
    signed_by?: string;
    signed_timestamp?: string;
    repudiator?: string;
  }> {
    const result = await this.client
      .withAuth({ type: "bearer", token: idToken })
      .decryptVerify({
        encryptedData,
        permissions: this.toLegacyPermissions(permissions),
      });

    return {
      decrypted_data: result.decryptedData,
      is_valid_signature: result.isValidSignature,
      signed_by: result.signedBy,
      signed_timestamp: result.signedTimestamp,
      repudiator: result.repudiator,
    };
  }

  private toLegacyPermissions(permissions?: string[]): Permission[] | undefined {
    if (!permissions?.length) {
      return undefined;
    }

    return [
      {
        partnerId: "default",
        actions: permissions,
      },
    ];
  }
}
