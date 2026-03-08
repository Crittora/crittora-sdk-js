"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crittora = void 0;
const cognito_1 = require("./auth/cognito");
const client_1 = require("./client");
class Crittora {
    constructor(options = {}) {
        this.options = options;
        this.cognito = (0, cognito_1.cognitoAuthProvider)({
            userPoolId: options.cognito?.userPoolId ?? "us-east-1_Tmljk4Uiw",
            clientId: options.cognito?.clientId ?? "5cvaao4qgphfp38g433vi5e82u",
            username: options.cognito?.username,
            password: options.cognito?.password,
        });
        this.client = new client_1.CrittoraClient({
            ...options,
            baseUrl: options.baseUrl ?? "https://api.crittoraapis.com",
            credentials: options.credentials ??
                (process.env.API_KEY
                    ? {
                        apiKey: process.env.API_KEY,
                        accessKey: process.env.ACCESS_KEY,
                        secretKey: process.env.SECRET_KEY,
                    }
                    : undefined),
        });
    }
    async authenticate(username, password) {
        const tokens = await this.cognito.login({ username, password });
        return {
            IdToken: tokens.idToken,
            AccessToken: tokens.accessToken,
            RefreshToken: tokens.refreshToken,
        };
    }
    async encrypt(idToken, data, permissions) {
        const result = await this.client
            .withAuth({ type: "bearer", token: idToken })
            .encrypt({
            data,
            permissions: this.toLegacyPermissions(permissions),
        });
        return result.encryptedData;
    }
    async signEncrypt(idToken, data, permissions) {
        const result = await this.client
            .withAuth({ type: "bearer", token: idToken })
            .signEncrypt({
            data,
            permissions: this.toLegacyPermissions(permissions),
        });
        return result.encryptedData;
    }
    async decrypt(idToken, encryptedData, permissions) {
        const result = await this.client
            .withAuth({ type: "bearer", token: idToken })
            .decrypt({
            encryptedData,
            permissions: this.toLegacyPermissions(permissions),
        });
        return result.decryptedData;
    }
    async decryptVerify(idToken, encryptedData, permissions) {
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
    toLegacyPermissions(permissions) {
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
exports.Crittora = Crittora;
//# sourceMappingURL=crittora.js.map