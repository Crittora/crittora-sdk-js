import axios from "axios";
import crypto from "crypto-js";

import {
  EncryptParams,
  EncryptResponse,
  Config,
  DecryptParams,
  DecryptResponse,
  SignParams,
  SignResponse,
  VerifyParams,
  VerifyResponse,
} from "./types";

const BASE_API_URL =
  "https://qh8enufhje.execute-api.us-east-1.amazonaws.com/sbx/event";

const COGNITO_API_URL = "https://cognito-idp.us-east-1.amazonaws.com/";

class Crittora {
  private config: Config;
  private currentAccessToken: string | null = null;
  private accessTokenExpiry: number | null = null;

  constructor(config: Config) {
    this.config = config;
    this.currentAccessToken = config.currentAccessToken || null;
    this.accessTokenExpiry = config.accessTokenExpiry || null;
  }

  private generateSecretHash(
    username: string,
    clientId: string,
    clientSecret: string
  ): string {
    const message = username + clientId;
    const hash = crypto.HmacSHA256(message, clientSecret);
    return crypto.enc.Base64.stringify(hash);
  }

  private async fetchAccessToken(): Promise<void> {
    const {
      credentialsUsername,
      credentialsPassword,
      cognitoPoolClientId,
      clientId,
      clientSecret,
      fetchTokenOnEveryRequest,
    } = this.config;

    if (fetchTokenOnEveryRequest) {
      this.currentAccessToken = null;
      this.accessTokenExpiry = null;
    }

    const currentTime = new Date().getTime();
    if (
      this.currentAccessToken &&
      this.accessTokenExpiry &&
      currentTime < this.accessTokenExpiry
    ) {
      return;
    }

    const secretHash = this.generateSecretHash(
      credentialsUsername,
      clientId,
      clientSecret
    );

    const body = {
      AuthParameters: {
        USERNAME: credentialsUsername,
        PASSWORD: credentialsPassword,
        SECRET_HASH: secretHash,
      },
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: clientId,
    };

    try {
      const response = await axios.post(COGNITO_API_URL, body, {
        headers: {
          "Content-Type": "application/x-amz-json-1.1",
          "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
        },
      });

      const responseData = response.data;
      if (responseData.AuthenticationResult) {
        this.currentAccessToken = responseData.AuthenticationResult.IdToken;
        this.accessTokenExpiry =
          new Date().getTime() +
          responseData.AuthenticationResult.ExpiresIn * 1000;
      } else {
        throw new Error("AuthenticationResult not found in the response");
      }
    } catch (error) {
      this.handleError(error, "Failed to fetch access token");
    }
  }

  private async makeAuthenticatedRequest<T>(
    params: any,
    errorMessage: string
  ): Promise<T> {
    await this.fetchAccessToken();

    console.log("Request Params:", params);

    try {
      const response = await axios.post(BASE_API_URL, params, {
        headers: {
          Authorization: `Bearer ${this.currentAccessToken}`,
          api_key: this.config.api_key,
          access_key: this.config.access_key,
          secret_key: this.config.secret_key,
          "Content-Type": "application/json",
        },
      });
      console.log("Response Data:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, errorMessage);
    }
  }

  private handleError(error: unknown, defaultMessage: string): never {
    if (axios.isAxiosError(error)) {
      console.error("Error Response:", error.response?.data || error.message);
      throw new Error(`${defaultMessage}: ${error.message}`);
    } else if (error instanceof Error) {
      console.error("Error:", error.message);
      throw new Error(`${defaultMessage}: ${error.message}`);
    } else {
      throw new Error(defaultMessage);
    }
  }

  public async encrypt(params: EncryptParams): Promise<EncryptResponse> {
    return this.makeAuthenticatedRequest<EncryptResponse>(
      params,
      "Failed to encrypt data"
    );
  }

  public async decrypt(params: DecryptParams): Promise<DecryptResponse> {
    return this.makeAuthenticatedRequest<DecryptResponse>(
      params,
      "Failed to decrypt data"
    );
  }

  public async sign(params: SignParams): Promise<SignResponse> {
    return this.makeAuthenticatedRequest<SignResponse>(
      params,
      "Failed to sign data"
    );
  }

  public async verify(params: VerifyParams): Promise<VerifyResponse> {
    return this.makeAuthenticatedRequest<VerifyResponse>(
      params,
      "Failed to verify data"
    );
  }

  // Implement other methods: signEncrypt(), verifyDecrypt(), verify()
}

export { Crittora, Config, EncryptParams, EncryptResponse };
