import { EncryptParams, EncryptResponse, Config, DecryptParams, DecryptResponse, SignParams, SignResponse, VerifyParams, VerifyResponse, SignEncryptParams, SignEncryptResponse, DecryptVerifyParams, DecryptVerifyResponse } from "./types";
declare class Crittora {
    private config;
    private currentAccessToken;
    private accessTokenExpiry;
    constructor(config: Config);
    private generateSecretHash;
    private fetchAccessToken;
    private makeAuthenticatedRequest;
    private handleError;
    encrypt(params: EncryptParams): Promise<EncryptResponse>;
    decrypt(params: DecryptParams): Promise<DecryptResponse>;
    sign(params: SignParams): Promise<SignResponse>;
    verify(params: VerifyParams): Promise<VerifyResponse>;
    signEncrypt(params: SignEncryptParams): Promise<SignEncryptResponse>;
    decryptVerify(params: DecryptVerifyParams): Promise<DecryptVerifyResponse>;
}
export { Crittora, Config, EncryptParams, EncryptResponse };
