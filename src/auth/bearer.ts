import { AuthProvider } from "./types";

export function bearerToken(token: string): AuthProvider {
  return {
    async getAuthorizationHeader(): Promise<string> {
      return `Bearer ${token}`;
    },
  };
}
