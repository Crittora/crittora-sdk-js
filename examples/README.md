# Crittora SDK JS - React Example

A React application demonstrating how to use the Crittora SDK for JavaScript with various authentication methods and encryption workflows.

## Features

This example application showcases:

- **Basic Encryption** - Encrypt and decrypt data using the Crittora SDK
- **Sign & Verify** - Sign messages before encrypting, then decrypt and verify signatures
- **Authentication** - Multiple authentication methods (API Key, Bearer Token, Cognito)

## Prerequisites

- Node.js 18 or later
- A Crittora API account with valid credentials

## Installation

1. Navigate to this directory:

   ```bash
   cd examples
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

   This uses the published npm package (`@crittora/sdk-js`). To test local SDK changes, you can use `npm link` or update the dependency to `"file:.."`.

3. Copy the environment configuration file:

   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and configure your credentials:

   ### Option 1: API Key Authentication

   ```env
   VITE_CRITTORA_API_KEY=your_api_key_here
   VITE_CRITTORA_ACCESS_KEY=your_access_key_here
   VITE_CRITTORA_SECRET_KEY=your_secret_key_here
   ```

   ### Option 2: Cognito Authentication

   ```env
   VITE_CRITTORA_USERNAME=your_username_here
   VITE_CRITTORA_PASSWORD=your_password_here
   ```

   ### Option 3: Base URL (for local development)

   ```env
   VITE_CRITTORA_BASE_URL=/api
   ```

## Running the Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

## Building for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
examples/
├── src/
│   ├── components/
│   │   ├── AuthDemo.tsx        # Authentication demo component
│   │   ├── EncryptDecrypt.tsx  # Basic encryption demo
│   │   └── SignEncryptVerify.tsx # Sign & verify demo
│   ├── lib/
│   │   └── crittora.ts         # SDK helper functions
│   ├── App.tsx                 # Main application
│   ├── main.tsx                # Entry point
│   └── index.css               # Styles
├── .env.example                 # Environment configuration template
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
└── vite.config.ts               # Vite configuration
```

## Key Files

- `src/lib/crittora.ts` - Contains helper functions for creating Crittora clients with different authentication methods
- `src/components/` - React components demonstrating different SDK features
- `.env.example` - Template for environment variables

## Documentation

For more information about the Crittora SDK, see:

- [Crittora SDK JS Documentation](../README.md)
- [API Reference](../docs/API.md)
- [Migration Guide](../docs/MIGRATION.md)
