const BASE_API_URL =
  "https://2h6f1172ud.execute-api.us-east-1.amazonaws.com/stage";

export const POST_ENCRYPT_URL = `${BASE_API_URL}/encrypt`;
export const POST_DECRYPT_URL = `${BASE_API_URL}/decrypt`;
export const POST_SIGN_URL = `${BASE_API_URL}/sign`;
export const POST_VERIFY_URL = `${BASE_API_URL}/verify`;
export const POST_SIGN_ENCRYPT_URL = `${BASE_API_URL}/sign-encrypt`;
export const POST_VERIFY_DECRYPT_URL = `${BASE_API_URL}/verify-decrypt`;

export const COGNITO_API_URL = "https://cognito-idp.us-east-1.amazonaws.com/";
