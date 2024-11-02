import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";

export class Crittora {
  private cognito_endpoint: string;
  private base_url: string;
  private user_pool_id: string;
  private client_id: string;
  private userPool: CognitoUserPool;

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

  private getHeaders(idToken: string): Headers {
    const headers = new Headers({
      Authorization: `Bearer ${idToken}`,
      api_key: process.env.API_KEY || "",
      access_key: process.env.ACCESS_KEY || "",
      secret_key: process.env.SECRET_KEY || "",
      "Content-Type": "application/json",
    });
    return headers;
  }

  async authenticate(
    username: string,
    password: string
  ): Promise<{
    IdToken: string;
    AccessToken: string;
    RefreshToken: string;
  }> {
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
  }

  async encrypt(
    idToken: string,
    data: string,
    permissions?: string[]
  ): Promise<string> {
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
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Response status:", response.status);
        console.error("Response body:", errorBody);
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorBody}`
        );
      }

      const responseData = await response.json();
      console.log("Response Data:", responseData);

      if ("body" in responseData) {
        const body = JSON.parse(responseData.body);
        return body.encrypted_data;
      } else {
        throw new Error(
          `An error has occurred, please check your credentials and try again. ${JSON.stringify(
            responseData
          )}`
        );
      }
    } catch (error) {
      console.error("Encryption error:", error);
      throw error;
    }
  }

  async decrypt(
    idToken: string,
    encryptedData: string,
    permissions?: string[]
  ): Promise<string> {
    const url = `${this.base_url}/decrypt`;
    const headers = this.getHeaders(idToken);

    const payload = {
      encrypted_data: encryptedData,
    };

    if (permissions) {
      Object.assign(payload, { permissions });
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if ("body" in responseData) {
        const body = JSON.parse(responseData.body);
        return body.decrypted_data;
      } else {
        throw new Error(
          "An error has occurred, please check your credentials and try again."
        );
      }
    } catch (error) {
      console.error("Decryption error:", error);
      throw error;
    }
  }

  async signEncrypt(
    idToken: string,
    data: string,
    permissions?: string[]
  ): Promise<string> {
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
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      if ("body" in responseData) {
        const body = JSON.parse(responseData.body);
        return body.encrypted_data;
      } else {
        throw new Error(
          "An error has occurred, please check your credentials and try again."
        );
      }
    } catch (error) {
      console.error("Sign and Encrypt error:", error);
      throw error;
    }
  }

  async decryptVerify(
    idToken: string,
    encryptedData: string,
    permissions?: string[]
  ): Promise<any> {
    const url = `${this.base_url}/decrypt-verify`;
    const headers = this.getHeaders(idToken);
    const payload = {
      encrypted_data: encryptedData,
    };

    if (permissions) {
      Object.assign(payload, { permissions });
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      if ("body" in responseData) {
        return JSON.parse(responseData.body);
      } else {
        throw new Error(
          "An error has occurred, please check your credentials and try again."
        );
      }
    } catch (error) {
      console.error("Decrypt and Verify error:", error);
      throw error;
    }
  }
}
