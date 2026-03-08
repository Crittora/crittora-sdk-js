export type FetchLike = typeof globalThis.fetch;

export interface ApiCredentials {
  apiKey: string;
  accessKey?: string;
  secretKey?: string;
}

export interface RetryOptions {
  maxAttempts?: number;
  backoffMs?: number;
  retryOn?: number[];
}

export interface BearerAuthConfig {
  type: "bearer";
  token: string;
}

export interface Permission {
  partnerId: string;
  actions: string[];
}

export interface EncryptInput {
  data: string;
  permissions?: Permission[];
}

export interface EncryptResult {
  encryptedData: string;
}

export interface SignEncryptInput {
  data: string;
  permissions?: Permission[];
}

export interface SignEncryptResult {
  encryptedData: string;
}

export interface DecryptInput {
  encryptedData: string;
  permissions?: Permission[];
}

export interface DecryptResult {
  decryptedData: string;
}

export interface DecryptVerifyInput {
  encryptedData: string;
  permissions?: Permission[];
}

export interface DecryptVerifyResult {
  decryptedData: string;
  isValidSignature: boolean;
  signedBy?: string;
  signedTimestamp?: string;
  repudiator?: string;
}

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

export interface CognitoAuthConfig {
  userPoolId: string;
  clientId: string;
  username?: string;
  password?: string;
}

export interface CrittoraClientOptions {
  baseUrl?: string;
  credentials?: ApiCredentials;
  auth?: BearerAuthConfig | import("./auth/types").AuthProvider;
  fetch?: FetchLike;
  timeoutMs?: number;
  retry?: RetryOptions;
  headers?: Record<string, string>;
  userAgent?: string;
}

export interface RequestOptions {
  path: string;
  method?: "POST";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface RequestContext {
  baseUrl: string;
  credentials?: ApiCredentials;
  headers?: Record<string, string>;
  timeoutMs: number;
  userAgent?: string;
}

export interface WirePermission {
  partner_id: string;
  permissions: string[];
}

export interface WireEncryptResult {
  encrypted_data: string;
}

export interface WireSignEncryptResult {
  encrypted_data: string;
}

export interface WireDecryptResult {
  decrypted_data: string;
}

export interface WireDecryptVerifyResult {
  decrypted_data: string;
  is_valid_signature: boolean;
  signed_by?: string;
  signed_timestamp?: string;
  repudiator?: string;
}

export interface LegacyAuthResponse {
  IdToken: string;
  AccessToken: string;
  RefreshToken: string;
}
