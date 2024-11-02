import { AuthService } from "./services/authService";
import { EncryptionService } from "./services/encryptionService";
import { AuthResponse, DecryptVerifyResponse } from "./types";

export class Crittora {
  private authService: AuthService;
  private encryptionService: EncryptionService;

  constructor() {
    this.authService = AuthService.getInstance();
    this.encryptionService = EncryptionService.getInstance();
  }

  async authenticate(
    username: string,
    password: string
  ): Promise<AuthResponse> {
    return this.authService.authenticate(username, password);
  }

  async encrypt(
    idToken: string,
    data: string,
    permissions?: string[]
  ): Promise<string> {
    return this.encryptionService.encrypt(idToken, data, permissions);
  }

  async decrypt(
    idToken: string,
    encryptedData: string,
    permissions?: string[]
  ): Promise<string> {
    return this.encryptionService.decrypt(idToken, encryptedData, permissions);
  }

  async decryptVerify(
    idToken: string,
    encryptedData: string,
    permissions?: string[]
  ): Promise<DecryptVerifyResponse> {
    return this.encryptionService.decryptVerify(
      idToken,
      encryptedData,
      permissions
    );
  }
}
