import * as crypto from "crypto-js";
import {
  AuthTokens,
  SignEncryptPayload,
  DecryptVerifyPayload,
  EncryptPayload,
  DecryptPayload,
  Headers,
} from "./types";

class Crittora {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly userPoolId: string;
  private readonly baseUrl: string =
    "https://cognito-idp.us-east-1.amazonaws.com/";

  constructor(clientId: string, clientSecret: string, userPoolId: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.userPoolId = userPoolId;
  }

  private generateSecretHash(username: string): string {
    const message = username + this.clientId;
    const hash = crypto.HmacSHA256(message, this.clientSecret);
    return crypto.enc.Base64.stringify(hash);
  }

  public async authenticate(
    username: string,
    password: string
  ): Promise<string> {
    if (!username || !password) {
      throw new Error("Username and password are required");
    }

    const secretHash = this.generateSecretHash(username);

    const body = {
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: this.clientId,
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-amz-json-1.1",
          "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseJson = await response.json();

      if (responseJson.AuthenticationResult?.IdToken) {
        return responseJson.AuthenticationResult.IdToken;
      } else {
        throw new Error("Authentication failed: No IdToken received");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      throw new Error("Authentication failed");
    }
  }

  private createHeaders(
    idToken: string,
    apiKey: string,
    accessKey: string,
    secretKey: string
  ): Headers {
    return {
      Authorization: `Bearer ${idToken}`,
      "x-api-key": apiKey,
      "x-access-key": accessKey,
      "x-secret-key": secretKey,
      "Content-Type": "application/json",
    };
  }

  private async makeApiCall(
    url: string,
    headers: Headers,
    payload: any
  ): Promise<Response> {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `API call failed: ${response.status} ${response.statusText}`
      );
    }

    return response;
  }

  public async signEncrypt(
    idToken: string,
    apiKey: string,
    accessKey: string,
    secretKey: string,
    data: string,
    permissions?: string[],
    url: string = "SIGN_ENCRYPT_URL"
  ): Promise<Response> {
    const headers = this.createHeaders(idToken, apiKey, accessKey, secretKey);
    const payload: SignEncryptPayload = {
      data: data,
      requested_actions: ["e", "s"],
      permissions: permissions,
    };
    return this.makeApiCall(url, headers, payload);
  }

  public async decryptVerify(
    idToken: string,
    apiKey: string,
    accessKey: string,
    secretKey: string,
    encryptedData: string,
    permissions?: string[],
    url: string = "DECRYPT_VERIFY_URL"
  ): Promise<Response> {
    const headers = this.createHeaders(idToken, apiKey, accessKey, secretKey);
    const payload: DecryptVerifyPayload = {
      encrypted_data: encryptedData,
      permissions: permissions,
    };
    return this.makeApiCall(url, headers, payload);
  }

  public async encrypt(
    idToken: string,
    apiKey: string,
    accessKey: string,
    secretKey: string,
    data: string,
    permissions?: string[],
    url: string = "ENCRYPT_URL"
  ): Promise<Response> {
    const headers = this.createHeaders(idToken, apiKey, accessKey, secretKey);
    const payload: EncryptPayload = {
      data: data,
      requested_actions: ["e"],
      permissions: permissions,
    };
    return this.makeApiCall(url, headers, payload);
  }

  public async decrypt(
    idToken: string,
    apiKey: string,
    accessKey: string,
    secretKey: string,
    encryptedData: string,
    permissions?: string[],
    url: string = "DECRYPT_URL"
  ): Promise<Response> {
    const headers = this.createHeaders(idToken, apiKey, accessKey, secretKey);
    const payload: DecryptPayload = {
      encrypted_data: encryptedData,
      permissions: permissions,
    };
    return this.makeApiCall(url, headers, payload);
  }
}

export default Crittora;
