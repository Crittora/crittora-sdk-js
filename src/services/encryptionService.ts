import { ConfigManager } from "../config/config";
import { HttpClient } from "../http/httpClient";
import { EncryptionError } from "../errors/crittoraErrors";
import { Headers, DecryptVerifyResponse } from "../types";

export class EncryptionService {
  private static instance: EncryptionService;
  private readonly baseUrl: string;
  private readonly httpClient: HttpClient;

  private constructor() {
    const config = ConfigManager.getInstance().getConfig();
    this.baseUrl = config.baseUrl;
    this.httpClient = HttpClient.getInstance();
  }

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  private getHeaders(idToken: string): Headers {
    return {
      Authorization: `Bearer ${idToken}`,
      api_key: process.env.API_KEY || "",
      access_key: process.env.ACCESS_KEY || "",
      secret_key: process.env.SECRET_KEY || "",
      "Content-Type": "application/json",
    };
  }

  async encrypt(
    idToken: string,
    data: string,
    permissions?: string[]
  ): Promise<string> {
    const url = `${this.baseUrl}/encrypt`;
    const headers = this.getHeaders(idToken);
    const payload = {
      data,
      requested_actions: ["e"],
      ...(permissions && { permissions }),
    };

    try {
      const response = await this.httpClient.post<{ encrypted_data: string }>(
        url,
        headers,
        payload
      );
      return response.encrypted_data;
    } catch (error) {
      throw new EncryptionError(
        error instanceof Error ? error.message : "Encryption failed"
      );
    }
  }

  async decrypt(
    idToken: string,
    encryptedData: string,
    permissions?: string[]
  ): Promise<string> {
    const url = `${this.baseUrl}/decrypt`;
    const headers = this.getHeaders(idToken);
    const payload = {
      encrypted_data: encryptedData,
      ...(permissions && { permissions }),
    };

    try {
      const response = await this.httpClient.post<{ decrypted_data: string }>(
        url,
        headers,
        payload
      );
      return response.decrypted_data;
    } catch (error) {
      throw new EncryptionError(
        error instanceof Error ? error.message : "Decryption failed"
      );
    }
  }

  async decryptVerify(
    idToken: string,
    encryptedData: string,
    permissions?: string[]
  ): Promise<DecryptVerifyResponse> {
    const url = `${this.baseUrl}/decrypt-verify`;
    const headers = this.getHeaders(idToken);
    const payload = {
      encrypted_data: encryptedData,
      ...(permissions && { permissions }),
    };

    try {
      const response = await this.httpClient.post<DecryptVerifyResponse>(
        url,
        headers,
        payload
      );
      return response;
    } catch (error) {
      throw new EncryptionError(
        error instanceof Error ? error.message : "Decrypt-verify failed"
      );
    }
  }
}
