# Release Process

This document outlines the steps to publish the @wutif/crittora package to NPM.

## Prerequisites

1. Ensure you have NPM access to the @wutif organization
2. Make sure you're logged into NPM (`npm login`)
3. Verify you have the required environment variables set up

## Release Scripts

The package includes several pre-configured release scripts:

```bash
npm run release        # Run verification and publish with patch version bump
npm run release:patch  # Same as above
npm run release:minor  # Run verification and publish with minor version bump
npm run release:major  # Run verification and publish with major version bump
```

Each release script will:

1. Clean the dist directory
2. Run the build process
3. Execute all tests
4. Bump the version according to semantic versioning
5. Publish to NPM

## Manual Release Steps

If you need to release manually:

1. Run verification:

   ```bash
   npm run verify
   ```

2. Update version in `package.json`:

   ```bash
   npm version patch   # For bug fixes
   npm version minor   # For new features
   npm version major   # For breaking changes
   ```

3. Publish to NPM:
   ```bash
   npm publish
   ```

## Publishing Configuration

The package is configured with:

- Public access (`publishConfig.access: "public"`)
- Required Node.js version: >=14.0.0
- Files included in the package:
  - `/dist` directory
  - `LICENSE`
  - `README.md`

## Post-Release Verification

1. Verify the package is available on NPM:

   ```bash
   npm view @wutif/crittora versions
   ```

2. Test installation in a new project:
   ```bash
   npm install @wutif/crittora@latest
   ```

## Troubleshooting

If you encounter issues:

1. Ensure all tests pass: `npm test`
2. Verify build output: `npm run build`
3. Check that all required files are present in the `dist` directory
4. Confirm you have the correct NPM permissions
5. Verify your authentication: `npm whoami`
