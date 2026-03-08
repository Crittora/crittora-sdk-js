# API Reference

This document describes the public SDK surface exposed by `@crittora/sdk-js`.

The public API is intentionally limited to two workflows:

- `encrypt(...)` -> `decrypt(...)`
- `signEncrypt(...)` -> `decryptVerify(...)`

## Exports

Primary exports:

- `CrittoraClient`
- `Crittora` (legacy compatibility shim)
- `bearerToken`
- `cognitoAuthProvider`
- `CrittoraError`
- `ValidationError`
- `AuthError`
- `RequestError`
- `RateLimitError`
- `EncryptError`
- `DecryptError`

## CrittoraClient

### Constructor

```ts
new CrittoraClient(options?: CrittoraClientOptions)
```

### Options

```ts
type CrittoraClientOptions = {
  baseUrl?: string;
  credentials?: ApiCredentials;
  auth?: BearerAuthConfig | AuthProvider;
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
  retry?: RetryOptions;
  headers?: Record<string, string>;
  userAgent?: string;
};
```

### Methods

#### `encrypt(input)`

```ts
encrypt(input: EncryptInput): Promise<EncryptResult>
```

Input:

```ts
type EncryptInput = {
  data: string;
  permissions?: Permission[];
};
```

Result:

```ts
type EncryptResult = {
  encryptedData: string;
};
```

Behavior notes:

- The SDK sends `requested_actions: ["e"]` on the wire.
- The API returns a single org-encrypted envelope as `encrypted_data`.
- The intended follow-up operation is `decrypt(...)`.

#### `decrypt(input)`

```ts
decrypt(input: DecryptInput): Promise<DecryptResult>
```

Input:

```ts
type DecryptInput = {
  encryptedData: string;
  permissions?: Permission[];
};
```

Result:

```ts
type DecryptResult = {
  decryptedData: string;
};
```

Behavior notes:

- Pass the exact `encryptedData` string returned by `encrypt(...)`.
- The router unwraps the org-encrypted envelope before the Lambda performs decrypt.
- Successful responses return plaintext only.

#### `signEncrypt(input)`

```ts
signEncrypt(input: SignEncryptInput): Promise<SignEncryptResult>
```

Input:

```ts
type SignEncryptInput = {
  data: string;
  permissions?: Permission[];
};
```

Result:

```ts
type SignEncryptResult = {
  encryptedData: string;
};
```

Behavior notes:

- The SDK sends `requested_actions: ["e", "s"]` on the wire.
- The API returns a single org-encrypted envelope as `encrypted_data`.
- The intended follow-up operation is `decryptVerify(...)`.

#### `decryptVerify(input)`

```ts
decryptVerify(input: DecryptVerifyInput): Promise<DecryptVerifyResult>
```

Input:

```ts
type DecryptVerifyInput = {
  encryptedData: string;
  permissions?: Permission[];
};
```

Result:

```ts
type DecryptVerifyResult = {
  decryptedData: string;
  isValidSignature: boolean;
  signedBy?: string;
  signedTimestamp?: string;
  repudiator?: string;
};
```

Behavior notes:

- Pass the exact `encryptedData` string returned by `signEncrypt(...)`.
- The router unwraps the org-encrypted envelope before the Lambda performs decrypt and verify.
- Successful verification may include `signedBy` and `signedTimestamp`.
- Failed verification may still return `decryptedData`, with `isValidSignature: false` and `repudiator`.

#### `withAuth(auth)`

```ts
withAuth(auth: AuthProvider | BearerAuthConfig): CrittoraClient
```

Creates a new client instance with the same transport and credential configuration, but with a different auth source.

#### `auth`

```ts
get auth(): AuthProvider | undefined
```

Exposes the resolved auth provider associated with the client instance.

## Auth

### `bearerToken(token)`

```ts
bearerToken(token: string): AuthProvider
```

Creates an auth provider that always returns `Authorization: Bearer <token>`.

### `cognitoAuthProvider(config)`

```ts
cognitoAuthProvider(config: CognitoAuthConfig): CognitoAuthProvider
```

Configuration:

```ts
type CognitoAuthConfig = {
  userPoolId: string;
  clientId: string;
  username?: string;
  password?: string;
};
```

Methods:

```ts
getAuthorizationHeader(): Promise<string | undefined>
login(credentials?: { username: string; password: string }): Promise<AuthTokens>
```

Result:

```ts
type AuthTokens = {
  idToken: string;
  accessToken: string;
  refreshToken: string;
};
```

## Legacy API

### `Crittora`

The `Crittora` class is preserved for compatibility with existing consumers.

Methods:

```ts
authenticate(username: string, password: string): Promise<LegacyAuthResponse>
encrypt(idToken: string, data: string, permissions?: string[]): Promise<string>
signEncrypt(
  idToken: string,
  data: string,
  permissions?: string[]
): Promise<string>
decrypt(idToken: string, encryptedData: string, permissions?: string[]): Promise<string>
decryptVerify(
  idToken: string,
  encryptedData: string,
  permissions?: string[]
): Promise<{
  decrypted_data: string;
  is_valid_signature: boolean;
  signed_by?: string;
  signed_timestamp?: string;
  repudiator?: string;
}>
```

This interface is transitional. New integrations should use `CrittoraClient`.

## Errors

### `CrittoraError`

Base SDK error with:

```ts
type CrittoraError = Error & {
  code: string;
  status?: number;
  requestId?: string;
  details?: unknown;
  cause?: unknown;
}
```

### Specializations

- `ValidationError`
- `AuthError`
- `RequestError`
- `RateLimitError`
- `EncryptError`
- `DecryptError`

Use these types for programmatic handling rather than parsing error messages.
