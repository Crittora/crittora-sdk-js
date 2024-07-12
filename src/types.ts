export interface Permission {
  partner_id: string;
  permissions: string[];
}

export interface EncryptParams {
  data: string;
  requested_actions: string[];
  permissions: Permission[];
}

export interface DecryptParams {
  encryptedData: string;
  transactionId: string;
  requested_actions: string[];
}

export interface EncryptResponse {
  encryptedData: string;
}

export interface DecryptResponse {
  decrypted_data: string;
}

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
