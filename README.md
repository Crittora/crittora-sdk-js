# Crittora JavaScript SDK

The Crittora JavaScript SDK is a typed secure-message client for the Crittora API.

It supports exactly two application workflows:

- confidentiality only: `encrypt()` -> `decrypt()`
- confidentiality plus authenticity: `signEncrypt()` -> `decryptVerify()`

This package now exposes a v2-style, instance-based client designed for predictable integration in production systems:

- explicit client construction
- explicit credentials and auth wiring
- transport-level timeout and retry controls
- typed request and response objects
- stable SDK error classes

The legacy `Crittora` class is still exported as a compatibility shim for existing consumers, but new integrations should use `CrittoraClient`.

## Table of Contents

- [Runtime Support](#runtime-support)
- [Installation](#installation)
- [Design Principles](#design-principles)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Client Configuration](#client-configuration)
- [Operations](#operations)
- [Errors](#errors)
- [Migration from v1](#migration-from-v1)
- [Additional Documentation](#additional-documentation)

## Runtime Support

- Node.js 18 or later
- Any runtime that provides a compatible `fetch` implementation, or where one is passed explicitly via the client options

## Installation

```bash
npm install @crittora/sdk-js
```

## Design Principles

The v2 client is built around a few constraints that matter for SDK consumers:

- No hidden process-global configuration is required for the primary API.
- Client instances are isolated, so one process can talk to multiple environments safely.
- Public JavaScript and TypeScript types use camelCase, while wire-format translation stays internal.
- Auth is composable rather than hard-coded into every request path.
- Errors preserve transport and backend context so callers can make policy decisions.

## Quick Start

### Bearer token auth

```ts
import { CrittoraClient } from "@crittora/sdk-js";

const client = new CrittoraClient({
  baseUrl: "https://api.crittoraapis.com",
  credentials: {
    apiKey: process.env.CRITTORA_API_KEY!,
    accessKey: process.env.CRITTORA_ACCESS_KEY!,
    secretKey: process.env.CRITTORA_SECRET_KEY!,
  },
  auth: {
    type: "bearer",
    token: process.env.CRITTORA_ID_TOKEN!,
  },
  timeoutMs: 10_000,
  retry: {
    maxAttempts: 2,
  },
});

const result = await client.encrypt({
  data: "sensitive data",
  permissions: [
    {
      partnerId: "partner-123",
      actions: ["read"],
    },
  ],
});

console.log(result.encryptedData);
```

### Scoped auth

If the same client configuration is reused across identities, create a base client and scope auth per request flow:

```ts
import { CrittoraClient } from "@crittora/sdk-js";

const baseClient = new CrittoraClient({
  credentials: {
    apiKey: process.env.CRITTORA_API_KEY!,
  },
});

const userClient = baseClient.withAuth({
  type: "bearer",
  token: userIdToken,
});

const decrypted = await userClient.decrypt({
  encryptedData,
});
```

## Authentication

The SDK supports two primary auth patterns:

### 1. Static bearer token

Use this when your application already manages a token lifecycle:

```ts
const client = new CrittoraClient({
  credentials: { apiKey: "..." },
  auth: {
    type: "bearer",
    token: idToken,
  },
});
```

### 2. Cognito auth provider

Use the built-in Cognito provider when the SDK should perform login and hold the returned tokens:

```ts
import { CrittoraClient, cognitoAuthProvider } from "@crittora/sdk-js";

const auth = cognitoAuthProvider({
  userPoolId: "us-east-1_Tmljk4Uiw",
  clientId: "5cvaao4qgphfp38g433vi5e82u",
});

await auth.login({
  username: process.env.CRITTORA_USERNAME!,
  password: process.env.CRITTORA_PASSWORD!,
});

const client = new CrittoraClient({
  credentials: {
    apiKey: process.env.CRITTORA_API_KEY!,
  },
  auth,
});
```

### Security note

If `accessKey` and `secretKey` represent privileged backend credentials, do not expose them in untrusted browser code. In that model, use this SDK server-side and front it with your own backend boundary.

## Client Configuration

`CrittoraClient` accepts the following options:

```ts
type CrittoraClientOptions = {
  baseUrl?: string;
  credentials?: {
    apiKey: string;
    accessKey?: string;
    secretKey?: string;
  };
  auth?: BearerAuthConfig | AuthProvider;
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
  retry?: {
    maxAttempts?: number;
    backoffMs?: number;
    retryOn?: number[];
  };
  headers?: Record<string, string>;
  userAgent?: string;
};
```

Operational guidance:

- Set `baseUrl` explicitly in non-production environments.
- Use `fetch` injection in runtimes where global `fetch` is absent or wrapped.
- Keep retry counts conservative unless the backend contract explicitly supports aggressive retries.
- Prefer a custom `userAgent` in services where request attribution matters.

## Supported Workflows

### Confidentiality only

Use `encrypt()` when the recipient only needs to recover the plaintext later:

```ts
const encrypted = await client.encrypt({
  data: "hello",
});

const decrypted = await client.decrypt({
  encryptedData: encrypted.encryptedData,
});
```

### Confidentiality plus authenticity

Use `signEncrypt()` when the recipient must recover the plaintext and validate who signed it:

```ts
const envelope = await client.signEncrypt({
  data: "hello",
});

const verified = await client.decryptVerify({
  encryptedData: envelope.encryptedData,
});
```

## Operations

### Encrypt

```ts
const result = await client.encrypt({
  data: "hello",
  permissions: [
    {
      partnerId: "partner-123",
      actions: ["read", "write"],
    },
  ],
});

console.log(result.encryptedData);
```

`encrypt()` returns a single org-protected `encryptedData` envelope. The intended follow-up operation is `decrypt()`, which unwraps and decrypts that envelope through the API.

### Sign and encrypt

```ts
const result = await client.signEncrypt({
  data: "hello",
  permissions: [
    {
      partnerId: "partner-123",
      actions: ["read", "write"],
    },
  ],
});

console.log(result.encryptedData);
```

`signEncrypt()` returns a single org-protected `encryptedData` envelope. The intended follow-up operation is `decryptVerify()`, which decrypts the envelope and validates the stored signature.

### Decrypt

```ts
const result = await client.decrypt({
  encryptedData,
});

console.log(result.decryptedData);
```

`decrypt()` is the intended follow-up to `encrypt()`. Pass it the exact `encryptedData` envelope returned by `encrypt()`, not the inner ciphertext payload.

### Decrypt and verify

```ts
const result = await client.decryptVerify({
  encryptedData,
});

console.log(result.decryptedData);
console.log(result.isValidSignature);
console.log(result.signedBy);
console.log(result.signedTimestamp);
```

`decryptVerify()` is the intended follow-up to `signEncrypt()`. Pass it the exact `encryptedData` envelope returned by `signEncrypt()`, not any inner payload.

Public request and response types:

```ts
type Permission = {
  partnerId: string;
  actions: string[];
};

type EncryptInput = {
  data: string;
  permissions?: Permission[];
};

type EncryptResult = {
  encryptedData: string;
};

type SignEncryptInput = {
  data: string;
  permissions?: Permission[];
};

type SignEncryptResult = {
  encryptedData: string;
};

type DecryptInput = {
  encryptedData: string;
  permissions?: Permission[];
};

type DecryptResult = {
  decryptedData: string;
};

type DecryptVerifyResult = {
  decryptedData: string;
  isValidSignature: boolean;
  signedBy?: string;
  signedTimestamp?: string;
  repudiator?: string;
};
```

## Errors

The SDK exports a stable error hierarchy:

- `CrittoraError`
- `ValidationError`
- `AuthError`
- `RequestError`
- `RateLimitError`
- `EncryptError`
- `DecryptError`

All errors may carry the following diagnostic fields:

- `code`
- `status`
- `requestId`
- `details`
- `cause`

Example:

```ts
import {
  CrittoraClient,
  DecryptError,
  RateLimitError,
  RequestError,
} from "@crittora/sdk-js";

try {
  await client.decrypt({ encryptedData });
} catch (error) {
  if (error instanceof RateLimitError) {
    // retry later or trigger backpressure
  } else if (error instanceof DecryptError) {
    // operation-specific failure
  } else if (error instanceof RequestError) {
    // non-2xx or transport-level issue
  } else {
    throw error;
  }
}
```

## Migration from v1

The package still exports the legacy `Crittora` class:

```ts
import { Crittora } from "@crittora/sdk-js";
```

That class exists to reduce migration friction, but it should be treated as transitional.

Key differences in v2:

- `new CrittoraClient({...})` replaces implicit singleton construction
- object-shaped inputs replace positional method arguments
- camelCase public types replace wire-format snake_case
- explicit auth providers replace hard-coded request token arguments
- stable typed errors replace broad wrapping

Simple mapping:

```ts
// v1
await sdk.encrypt(idToken, data, ["read"]);

// v2
await client.withAuth({ type: "bearer", token: idToken }).encrypt({
  data,
  permissions: [
    {
      partnerId: "default",
      actions: ["read"],
    },
  ],
});
```

## Additional Documentation

- [API Reference](./docs/API.md)
- [Migration Guide](./docs/MIGRATION.md)
- [Architecture Notes](./docs/ARCHITECTURE.md)
- [Release Process](./docs/RELEASING.md)
