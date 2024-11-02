import { AuthResponse, DecryptVerifyResponse } from "./types";
export declare class Crittora {
    private authService;
    private encryptionService;
    constructor();
    authenticate(username: string, password: string): Promise<AuthResponse>;
    encrypt(idToken: string, data: string, permissions?: string[]): Promise<string>;
    decrypt(idToken: string, encryptedData: string, permissions?: string[]): Promise<string>;
    decryptVerify(idToken: string, encryptedData: string, permissions?: string[]): Promise<DecryptVerifyResponse>;
}
