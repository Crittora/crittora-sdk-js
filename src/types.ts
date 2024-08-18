// types.ts

export interface AuthTokens {
  IdToken: string;
  AccessToken: string;
  RefreshToken: string;
  ExpiresIn: number;
}

export interface SignEncryptPayload {
  data: string;
  requested_actions: string[];
  permissions?: string[];
}

export interface DecryptVerifyPayload {
  encrypted_data: string;
  permissions?: string[];
}

export interface EncryptPayload {
  data: string;
  requested_actions: string[];
  permissions?: string[];
}

export interface DecryptPayload {
  encrypted_data: string;
  permissions?: string[];
}

export interface Headers {
  [key: string]: string;
}
