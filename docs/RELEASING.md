# Release Process

This document outlines the release process for `@crittora/sdk-js`.

## Release posture

The package ships a v2-style client architecture and a temporary legacy compatibility shim. Versioning should reflect that reality:

- use `major` for breaking API changes, removal of the legacy `Crittora` shim, or runtime contract changes
- use `minor` for additive API surface such as new methods, auth providers, or response fields
- use `patch` for bug fixes, packaging fixes, and documentation corrections

## Prerequisites

1. Ensure you have NPM access to the `@crittora` organization.
2. Make sure you are logged in with `npm login`.
3. Confirm local verification passes.
4. Confirm README and docs match the shipped API.

## Runtime and packaging assumptions

The published package currently targets:

- Node.js 18 or later
- CommonJS output with TypeScript declarations
- explicit client configuration rather than package-managed `.env` loading

Published package contents:

- `dist/`
- `docs/`
- `README.md`
- `CHANGELOG.md`
- `LICENSE`

## Standard release commands

```bash
npm run verify
npm run release:patch
npm run release:minor
npm run release:major
```

Each release command performs:

1. clean build artifacts
2. TypeScript build
3. test execution
4. semantic version bump
5. `npm publish`

## Recommended release flow

1. Verify locally:

   ```bash
   npm run verify
   ```

2. Inspect the package payload:

   ```bash
   npm pack --dry-run
   ```

3. Choose the correct semantic version bump:

   ```bash
   npm run release:patch
   npm run release:minor
   npm run release:major
   ```

4. Verify the published package:

   ```bash
   npm view @crittora/sdk-js versions
   npm install @crittora/sdk-js@latest
   ```

## Pre-release checklist

- README examples match the current code
- `docs/API.md` matches the exported surface
- `docs/MIGRATION.md` matches any deprecation and breaking-change policy
- Node engine requirement is accurate
- tests pass without warnings indicating broken configuration

## Troubleshooting

If a release fails:

1. run `npm run build`
2. run `npm test`
3. inspect `npm pack --dry-run`
4. confirm NPM auth with `npm whoami`
5. confirm package metadata in `package.json`
