# Migration Guide

This guide covers migration from the legacy `Crittora` API to `CrittoraClient`.

## Why migrate

The v2 client gives you:

- isolated client instances
- explicit environment and credential wiring
- typed object-based inputs
- cleaner auth composition
- structured error handling

## Before and after

### Construction

Before:

```ts
import { Crittora } from "@crittora/sdk-js";

const sdk = new Crittora();
```

After:

```ts
import { CrittoraClient } from "@crittora/sdk-js";

const client = new CrittoraClient({
  baseUrl: "https://api.crittoraapis.com",
  credentials: {
    apiKey: process.env.CRITTORA_API_KEY!,
    accessKey: process.env.CRITTORA_ACCESS_KEY!,
    secretKey: process.env.CRITTORA_SECRET_KEY!,
  },
});
```

### Authentication

Before:

```ts
const { IdToken } = await sdk.authenticate(username, password);
```

After:

```ts
import { cognitoAuthProvider } from "@crittora/sdk-js";

const auth = cognitoAuthProvider({
  userPoolId: "us-east-1_Tmljk4Uiw",
  clientId: "5cvaao4qgphfp38g433vi5e82u",
});

const { idToken } = await auth.login({ username, password });
```

### Encrypt

Before:

```ts
const encrypted = await sdk.encrypt(idToken, data, ["read"]);
```

After:

```ts
const encrypted = await client
  .withAuth({ type: "bearer", token: idToken })
  .encrypt({
    data,
    permissions: [
      {
        partnerId: "default",
        actions: ["read"],
      },
    ],
  });

console.log(encrypted.encryptedData);
```

### Sign and encrypt

Before:

```ts
const result = await sdk.signEncrypt(idToken, data, ["read"]);
console.log(result);
```

After:

```ts
const result = await client
  .withAuth({ type: "bearer", token: idToken })
  .signEncrypt({
    data,
    permissions: [
      {
        partnerId: "default",
        actions: ["read"],
      },
    ],
  });

console.log(result.encryptedData);
```

### Decrypt

Before:

```ts
const decrypted = await sdk.decrypt(idToken, encryptedData);
```

After:

```ts
const decrypted = await client
  .withAuth({ type: "bearer", token: idToken })
  .decrypt({
    encryptedData,
  });

console.log(decrypted.decryptedData);
```

### Decrypt and verify

Before:

```ts
const result = await sdk.decryptVerify(idToken, encryptedData);
console.log(
  result.decrypted_data,
  result.is_valid_signature,
  result.signed_by,
  result.signed_timestamp
);
```

After:

```ts
const result = await client
  .withAuth({ type: "bearer", token: idToken })
  .decryptVerify({
    encryptedData,
  });

console.log(result.decryptedData, result.isValidSignature);
console.log(result.signedBy, result.signedTimestamp);
```

## Type changes

Main public naming changes:

- `encrypted_data` -> `encryptedData`
- `decrypted_data` -> `decryptedData`
- `is_valid_signature` -> `isValidSignature`
- `signed_by` -> `signedBy`
- `signed_timestamp` -> `signedTimestamp`

Permission changes:

Before:

```ts
["read", "write"]
```

After:

```ts
[
  {
    partnerId: "default",
    actions: ["read", "write"],
  },
]
```

## Error handling changes

Before, callers often had to catch broad errors.

After, callers can branch on typed SDK errors:

```ts
import { DecryptError, RateLimitError, RequestError } from "@crittora/sdk-js";

try {
  await client.decrypt({ encryptedData });
} catch (error) {
  if (error instanceof RateLimitError) {
    // handle throttling
  } else if (error instanceof DecryptError) {
    // handle decrypt failure
  } else if (error instanceof RequestError) {
    // handle transport or non-2xx responses
  } else {
    throw error;
  }
}
```

## Transitional strategy

Recommended migration sequence:

1. Replace `new Crittora()` with `new CrittoraClient(...)`.
2. Move token acquisition into an auth provider or your own auth layer.
3. Convert positional method calls to object inputs.
4. Update call sites to camelCase response fields.
5. Replace generic error handling with typed error handling.

The legacy `Crittora` export remains available for staged migrations, but new code should not be added against it.
