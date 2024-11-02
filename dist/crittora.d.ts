export declare class Crittora {
    private cognito_endpoint;
    private base_url;
    private user_pool_id;
    private client_id;
    private userPool;
    constructor();
    private getHeaders;
    authenticate(username: string, password: string): Promise<{
        IdToken: string;
        AccessToken: string;
        RefreshToken: string;
    }>;
    encrypt(idToken: string, data: string, permissions?: string[]): Promise<string>;
    decrypt(idToken: string, encryptedData: string, permissions?: string[]): Promise<string>;
    signEncrypt(idToken: string, data: string, permissions?: string[]): Promise<string>;
    decryptVerify(idToken: string, encryptedData: string, permissions?: string[]): Promise<any>;
}
