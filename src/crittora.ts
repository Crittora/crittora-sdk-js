import axios from "axios";
import crypto from "crypto-js";

import {
  EncryptParams,
  EncryptResponse,
  Config,
  DecryptParams,
  DecryptResponse,
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
      if (axios.isAxiosError(error)) {
        console.error("Error Response:", error.response?.data || error.message);
        throw new Error(`Failed to fetch access token: ${error.message}`);
      } else if (error instanceof Error) {
        console.error("Error:", error.message);
        throw new Error(`Failed to fetch access token: ${error.message}`);
      } else {
        throw new Error("Failed to fetch access token");
      }
    }
  }

  public async encrypt(params: EncryptParams): Promise<EncryptResponse> {
    await this.fetchAccessToken();

    console.log("Encrypt Params:", params);

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
      console.log("Encrypted Data Response:", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error Response:", error.response?.data || error.message);
        throw new Error(`Failed to encrypt data: ${error.message}`);
      } else if (error instanceof Error) {
        console.error("Error:", error.message);
        throw new Error(`Failed to encrypt data: ${error.message}`);
      } else {
        throw new Error("Failed to encrypt data");
      }
    }
  }

  public async decrypt(params: DecryptParams): Promise<DecryptResponse> {
    await this.fetchAccessToken();

    console.log("Decrypt Params:", params);

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
      console.log("Decrypted Data Response:", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error Response:", error.response?.data || error.message);
        throw new Error(`Failed to decrypt data: ${error.message}`);
      } else if (error instanceof Error) {
        console.error("Error:", error.message);
        throw new Error(`Failed to decrypt data: ${error.message}`);
      } else {
        throw new Error("Failed to decrypt data");
      }
    }
  }

  // Implement other methods: signEncrypt(), sign(), verifyDecrypt(), verify(), decrypt()
}

export { Crittora, Config, EncryptParams, EncryptResponse };
