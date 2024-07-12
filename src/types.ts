// Base interfaces for common properties
export interface BaseParams {
  data: string;
  requested_actions: string[];
  permissions: Permission[];
}

export interface BaseResponse {
  encryptedData?: string;
  decrypted_data?: string;
  transactionId?: string;
}

export interface Permission {
  partner_id: string;
  permissions: string[];
}

// Extended interfaces using the base interfaces
export interface EncryptParams extends BaseParams {}

export interface DecryptParams {
  encryptedData: string;
  transactionId: string;
  requested_actions: string[];
}

export interface SignParams {
  signedData: string;
  transactionId: string;
  requested_actions: string[];
  signature: string;
}

export interface VerifyParams extends BaseParams {}

export interface SignEncryptParams extends BaseParams {}

export interface EncryptResponse extends BaseResponse {
  encryptedData: string;
}

export interface DecryptResponse extends BaseResponse {
  decrypted_data: string;
}

export interface SignResponse extends BaseResponse {
  transactionId: string;
  signature: string;
}

export interface VerifyResponse {
  is_valid_signature: boolean;
}

export interface SignEncryptResponse {
  encryption: {
    transactionId: string;
    encrypted_data: string;
  };
  signature: {
    transactionId: string;
    signature: string;
  };
}

// Configuration interface
export interface Config {
  credentialsUsername: string;
  credentialsPassword: string;
  cognitoPoolClientId: string;
  clientId: string;
  clientSecret: string;
  api_key: string;
  secret_key: string;
  access_key: string;
  fetchTokenOnEveryRequest: boolean;
  currentAccessToken?: string;
  accessTokenExpiry?: number;
}
