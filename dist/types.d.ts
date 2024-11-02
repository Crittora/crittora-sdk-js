export interface AuthResponse {
    IdToken: string;
    AccessToken: string;
    RefreshToken: string;
}
export interface Permission {
    partner_id: string;
    permissions: string[];
}
export interface BaseParams {
    data: string;
    requested_actions: string[];
    permissions?: Permission[];
}
export interface BaseResponse {
    encrypted_data?: string;
    decrypted_data?: string;
    transactionId?: string;
}
export interface EncryptParams extends BaseParams {
}
export interface EncryptResponse extends BaseResponse {
    encrypted_data: string;
}
export interface DecryptParams {
    encrypted_data: string;
    transactionId?: string;
    requested_actions?: string[];
}
export interface DecryptResponse extends BaseResponse {
    decrypted_data: string;
}
export interface SignEncryptParams extends BaseParams {
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
export interface DecryptVerifyParams {
    encrypted_data: string;
    transactionId?: string;
    requested_actions?: string[];
    permissions?: string[];
}
export interface DecryptVerifyResponse {
    decrypted_data: string;
    is_valid_signature: boolean;
}
export interface CrittoraConfig {
    cognito_endpoint?: string;
    base_url?: string;
    user_pool_id?: string;
    client_id?: string;
}
export interface Headers {
    Authorization: string;
    api_key: string;
    access_key: string;
    secret_key: string;
    "Content-Type": string;
}
