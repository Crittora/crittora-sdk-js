import { CognitoAuthConfig, CrittoraClientOptions, LegacyAuthResponse } from "./types";
export interface LegacyCrittoraOptions extends CrittoraClientOptions {
    cognito?: CognitoAuthConfig;
}
export declare class Crittora {
    private readonly options;
    private readonly client;
    private readonly cognito;
    constructor(options?: LegacyCrittoraOptions);
    authenticate(username: string, password: string): Promise<LegacyAuthResponse>;
    encrypt(idToken: string, data: string, permissions?: string[]): Promise<string>;
    signEncrypt(idToken: string, data: string, permissions?: string[]): Promise<string>;
    decrypt(idToken: string, encryptedData: string, permissions?: string[]): Promise<string>;
    decryptVerify(idToken: string, encryptedData: string, permissions?: string[]): Promise<{
        decrypted_data: string;
        is_valid_signature: boolean;
        signed_by?: string;
        signed_timestamp?: string;
        repudiator?: string;
    }>;
    private toLegacyPermissions;
}
