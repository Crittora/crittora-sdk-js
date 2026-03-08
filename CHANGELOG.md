# Changelog

All notable changes to this package will be documented in this file.

## 2.0.0 - 2026-03-08

This release introduces the new primary SDK architecture for `@crittora/sdk-js`.

### Added

- Added `CrittoraClient` as the new primary instance-based SDK client.
- Added pluggable auth providers, including `bearerToken(...)` and `cognitoAuthProvider(...)`.
- Added a transport layer with timeout handling, retry support, and response normalization.
- Added a structured SDK error hierarchy for validation, auth, request, rate limit, encrypt, and decrypt failures.
- Added principal-level documentation in `README.md`, `docs/API.md`, `docs/MIGRATION.md`, and `docs/ARCHITECTURE.md`.

### Changed

- Changed the primary public API from positional method arguments to typed object-based inputs.
- Changed public JavaScript and TypeScript models to camelCase while keeping wire-format translation internal.
- Changed runtime support to Node.js 18+.
- Changed package verification so publish flows run full build and test verification.

### Deprecated

- Deprecated the legacy `Crittora` class as the preferred integration surface. It remains available as a compatibility shim for staged migrations.

### Removed

- Removed singleton-based internal services and hidden package-managed configuration loading.
- Removed the package dependency on `dotenv`.

### Migration notes

- Existing integrations can continue using `Crittora` temporarily.
- New integrations should use `CrittoraClient`.
- See `docs/MIGRATION.md` for the v1 to v2 migration path.
