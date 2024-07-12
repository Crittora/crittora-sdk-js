var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
import crypto from "crypto-js";
const BASE_API_URL = "https://qh8enufhje.execute-api.us-east-1.amazonaws.com/sbx/event";
const COGNITO_API_URL = "https://cognito-idp.us-east-1.amazonaws.com/";
class Crittora {
    constructor(config) {
        this.currentAccessToken = null;
        this.accessTokenExpiry = null;
        this.config = config;
        this.currentAccessToken = config.currentAccessToken || null;
        this.accessTokenExpiry = config.accessTokenExpiry || null;
    }
    generateSecretHash(username, clientId, clientSecret) {
        const message = username + clientId;
        const hash = crypto.HmacSHA256(message, clientSecret);
        return crypto.enc.Base64.stringify(hash);
    }
    fetchAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const { credentialsUsername, credentialsPassword, cognitoPoolClientId, clientId, clientSecret, fetchTokenOnEveryRequest, } = this.config;
            if (fetchTokenOnEveryRequest) {
                this.currentAccessToken = null;
                this.accessTokenExpiry = null;
            }
            const currentTime = new Date().getTime();
            if (this.currentAccessToken &&
                this.accessTokenExpiry &&
                currentTime < this.accessTokenExpiry) {
                return;
            }
            const secretHash = this.generateSecretHash(credentialsUsername, clientId, clientSecret);
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
                const response = yield axios.post(COGNITO_API_URL, body, {
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
                }
                else {
                    throw new Error("AuthenticationResult not found in the response");
                }
            }
            catch (error) {
                this.handleError(error, "Failed to fetch access token");
            }
        });
    }
    makeAuthenticatedRequest(params, errorMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchAccessToken();
            console.log("Request Params:", params);
            try {
                const response = yield axios.post(BASE_API_URL, params, {
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
            }
            catch (error) {
                this.handleError(error, errorMessage);
            }
        });
    }
    handleError(error, defaultMessage) {
        var _a;
        if (axios.isAxiosError(error)) {
            console.error("Error Response:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw new Error(`${defaultMessage}: ${error.message}`);
        }
        else if (error instanceof Error) {
            console.error("Error:", error.message);
            throw new Error(`${defaultMessage}: ${error.message}`);
        }
        else {
            throw new Error(defaultMessage);
        }
    }
    encrypt(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.makeAuthenticatedRequest(params, "Failed to encrypt data");
        });
    }
    decrypt(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.makeAuthenticatedRequest(params, "Failed to decrypt data");
        });
    }
    sign(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.makeAuthenticatedRequest(params, "Failed to sign data");
        });
    }
    verify(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.makeAuthenticatedRequest(params, "Failed to verify data");
        });
    }
    signEncrypt(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.makeAuthenticatedRequest(params, "Failed to verify data");
        });
    }
}
export { Crittora };
