import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import { AuthError, ValidationError } from "../errors";
import { AuthProvider } from "./types";
import { AuthTokens, CognitoAuthConfig } from "../types";

export class CognitoAuthProvider implements AuthProvider {
  private readonly userPool: CognitoUserPool;
  private tokens?: AuthTokens;

  constructor(private readonly config: CognitoAuthConfig) {
    this.userPool = new CognitoUserPool({
      UserPoolId: config.userPoolId,
      ClientId: config.clientId,
    });
  }

  async getAuthorizationHeader(): Promise<string | undefined> {
    return this.tokens?.idToken ? `Bearer ${this.tokens.idToken}` : undefined;
  }

  async login(credentials?: {
    username: string;
    password: string;
  }): Promise<AuthTokens> {
    const username = credentials?.username ?? this.config.username;
    const password = credentials?.password ?? this.config.password;

    if (!username || !password) {
      throw new ValidationError(
        "Username and password are required for Cognito login."
      );
    }

    const authDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (result) => {
          this.tokens = {
            idToken: result.getIdToken().getJwtToken(),
            accessToken: result.getAccessToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
          };
          resolve(this.tokens);
        },
        onFailure: (error) => {
          reject(new AuthError(error.message, undefined, error));
        },
      });
    });
  }
}

export function cognitoAuthProvider(
  config: CognitoAuthConfig
): CognitoAuthProvider {
  return new CognitoAuthProvider(config);
}
