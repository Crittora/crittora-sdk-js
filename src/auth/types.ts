import { AuthTokens } from "../types";

export interface AuthProvider {
  getAuthorizationHeader(): Promise<string | undefined>;
  login?(credentials: { username: string; password: string }): Promise<AuthTokens>;
  refresh?(): Promise<void>;
}
