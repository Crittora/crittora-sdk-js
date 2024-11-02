var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CognitoUserPool, CognitoUser, AuthenticationDetails, } from "amazon-cognito-identity-js";
export class Crittora {
    constructor() {
        this.cognito_endpoint = "https://cognito-idp.us-east-1.amazonaws.com/";
        // dev
        this.base_url = "https://dev-api.crittoraapi.com";
        this.user_pool_id = "us-east-1_Zl27AI2Vr";
        this.client_id = "5ok4074j0itrc27gbihn5s2bgn";
        // Prod
        // this.base_url = 'https://api.crittoraapis.com';
        // this.user_pool_id = 'us-east-1_Tmljk4Uiw';
        // this.client_id = '5cvaao4qgphfp38g433vi5e82u';
        this.userPool = new CognitoUserPool({
            UserPoolId: this.user_pool_id,
            ClientId: this.client_id,
        });
    }
    getHeaders(idToken) {
        const headers = new Headers({
            Authorization: `Bearer ${idToken}`,
            api_key: process.env.API_KEY || "",
            access_key: process.env.ACCESS_KEY || "",
            secret_key: process.env.SECRET_KEY || "",
            "Content-Type": "application/json",
        });
        return headers;
    }
    authenticate(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const authenticationDetails = new AuthenticationDetails({
                    Username: username,
                    Password: password,
                });
                const cognitoUser = new CognitoUser({
                    Username: username,
                    Pool: this.userPool,
                });
                cognitoUser.authenticateUser(authenticationDetails, {
                    onSuccess: (result) => {
                        resolve({
                            IdToken: result.getIdToken().getJwtToken(),
                            AccessToken: result.getAccessToken().getJwtToken(),
                            RefreshToken: result.getRefreshToken().getToken(),
                        });
                    },
                    onFailure: (err) => {
                        reject(err);
                    },
                });
            });
        });
    }
    encrypt(idToken, data, permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.base_url}/encrypt`;
            const headers = this.getHeaders(idToken);
            console.log("Request URL:", url);
            console.log("Request Headers:", Object.fromEntries(headers));
            const payload = {
                data: data,
                requested_actions: ["e"],
            };
            if (permissions) {
                Object.assign(payload, { permissions });
            }
            console.log("Request Payload:", payload);
            try {
                const response = yield fetch(url, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    const errorBody = yield response.text();
                    console.error("Response status:", response.status);
                    console.error("Response body:", errorBody);
                    throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
                }
                const responseData = yield response.json();
                console.log("Response Data:", responseData);
                if ("body" in responseData) {
                    const body = JSON.parse(responseData.body);
                    return body.encrypted_data;
                }
                else {
                    throw new Error(`An error has occurred, please check your credentials and try again. ${JSON.stringify(responseData)}`);
                }
            }
            catch (error) {
                console.error("Encryption error:", error);
                throw error;
            }
        });
    }
    decrypt(idToken, encryptedData, permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.base_url}/decrypt`;
            const headers = this.getHeaders(idToken);
            const payload = {
                encrypted_data: encryptedData,
            };
            if (permissions) {
                Object.assign(payload, { permissions });
            }
            try {
                const response = yield fetch(url, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const responseData = yield response.json();
                if ("body" in responseData) {
                    const body = JSON.parse(responseData.body);
                    return body.decrypted_data;
                }
                else {
                    throw new Error("An error has occurred, please check your credentials and try again.");
                }
            }
            catch (error) {
                console.error("Decryption error:", error);
                throw error;
            }
        });
    }
    signEncrypt(idToken, data, permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.base_url}/sign-encrypt`;
            const headers = this.getHeaders(idToken);
            const payload = {
                data: data,
                requested_actions: ["e", "s"],
            };
            if (permissions) {
                Object.assign(payload, { permissions });
            }
            try {
                const response = yield fetch(url, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const responseData = yield response.json();
                if ("body" in responseData) {
                    const body = JSON.parse(responseData.body);
                    return body.encrypted_data;
                }
                else {
                    throw new Error("An error has occurred, please check your credentials and try again.");
                }
            }
            catch (error) {
                console.error("Sign and Encrypt error:", error);
                throw error;
            }
        });
    }
    decryptVerify(idToken, encryptedData, permissions) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.base_url}/decrypt-verify`;
            const headers = this.getHeaders(idToken);
            const payload = {
                encrypted_data: encryptedData,
            };
            if (permissions) {
                Object.assign(payload, { permissions });
            }
            try {
                const response = yield fetch(url, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const responseData = yield response.json();
                if ("body" in responseData) {
                    return JSON.parse(responseData.body);
                }
                else {
                    throw new Error("An error has occurred, please check your credentials and try again.");
                }
            }
            catch (error) {
                console.error("Decrypt and Verify error:", error);
                throw error;
            }
        });
    }
}
