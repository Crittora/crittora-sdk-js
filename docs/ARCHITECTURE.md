# Architecture Notes

This document explains the SDK structure and the design decisions behind the current implementation.

## Goals

The SDK is designed to be:

- explicit in configuration
- safe to run in multi-tenant or multi-environment processes
- adaptable to different auth models
- operationally predictable under failure
- intentionally narrow in surface area

## Product scope

This package is not positioned as a general-purpose cryptography toolkit.

It supports exactly four high-level operations arranged into two workflows:

- confidentiality only: `encrypt()` and `decrypt()`
- confidentiality plus authenticity: `signEncrypt()` and `decryptVerify()`

That narrow surface is intentional. The SDK mirrors the backend product contract rather than exposing lower-level standalone sign or verify primitives.

## Layering

The package is split into a few clear layers:

### Client

[`src/client.ts`](../src/client.ts)

`CrittoraClient` owns client configuration and exposes the public resource methods. It does not own process-global state.

### Auth

[`src/auth/`](../src/auth)

Auth providers are responsible for supplying `Authorization` headers. The client accepts either a bearer config or a concrete `AuthProvider`.

Built-in options:

- `bearerToken(...)`
- `cognitoAuthProvider(...)`

### Transport

[`src/transport/httpTransport.ts`](../src/transport/httpTransport.ts)

The transport layer is responsible for:

- request construction
- timeout enforcement
- retries
- response parsing
- error normalization

It accepts both standard JSON responses and legacy API Gateway style payloads that wrap JSON in a `body` string.

### Resources

[`src/resources/crypto.ts`](../src/resources/crypto.ts)

Resource classes translate public SDK models into backend wire payloads and map transport failures into operation-specific SDK errors.

## Model translation

Public SDK models use camelCase because they are intended for direct application use in JavaScript and TypeScript.

Backend payloads still use snake_case. The SDK keeps that translation internal so wire-format concerns do not leak into consumer code.

Examples:

- `encryptedData` -> `encrypted_data`
- `partnerId` -> `partner_id`
- `isValidSignature` -> `is_valid_signature`

## Error strategy

The SDK exposes one base error and several specializations so callers can respond at the right layer:

- validation failures
- auth failures
- transport or HTTP failures
- rate limiting
- operation-level failures

Errors preserve status, details, and request identifiers where available.

## Compatibility strategy

The legacy `Crittora` class remains in the package as a migration bridge. It adapts older positional-call semantics to the new client internally.

This avoids a forced flag day while still moving the primary API toward a better SDK contract.
