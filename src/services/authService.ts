import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { ConfigManager } from "../config/config";
import { AuthenticationError } from "../errors/crittoraErrors";
import { AuthResponse } from "../types";

export class AuthService {
  private static instance: AuthService;
  private userPool: CognitoUserPool;

  private constructor() {
    const config = ConfigManager.getInstance().getConfig();
    this.userPool = new CognitoUserPool({
      UserPoolId: config.userPoolId,
      ClientId: config.clientId,
    });
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async authenticate(
    username: string,
    password: string
  ): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      const authDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (result) => {
          resolve({
            IdToken: result.getIdToken().getJwtToken(),
            AccessToken: result.getAccessToken().getJwtToken(),
            RefreshToken: result.getRefreshToken().getToken(),
          });
        },
        onFailure: (err) => {
          reject(new AuthenticationError(err.message));
        },
      });
    });
  }
}
