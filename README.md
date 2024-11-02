# Crittora SDK

Crittora SDK provides secure methods for encrypting, decrypting, signing, verifying, and combining these operations on data. It uses AWS Cognito for authentication and the Fetch API for HTTP requests.

## Table of Contents

- [Crittora SDK](#crittora-sdk)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Configuration](#configuration)
    - [Environment Variables](#environment-variables)
    - [Environment Selection](#environment-selection)
  - [Usage](#usage)
    - [Authentication](#authentication)
    - [Encryption](#encryption)
    - [Decryption](#decryption)
    - [Decrypt-Verify](#decrypt-verify)
  - [Error Handling](#error-handling)
  - [Types](#types)
  - [Running Tests](#running-tests)
  - [Contributing](#contributing)
  - [License](#license)

## Installation

To install the Crittora SDK, run:

```bash
npm install @wutif/crittora
```

## Configuration

### Environment Variables

Create a `.env` file in the root of your project:

```dotenv
# Optional: Defaults to development if not set
NODE_ENV=development

# Required API keys
API_KEY=your_api_key
ACCESS_KEY=your_access_key
SECRET_KEY=your_secret_key
```

### Environment Selection

The SDK supports two environments:

**Development** (default):

- Base URL: https://dev-api.crittoraapi.com
- Cognito Pool: us-east-1_Zl27AI2Vr

**Production**:

- Base URL: https://api.crittoraapis.com
- Cognito Pool: us-east-1_Tmljk4Uiw

To select an environment, set the `NODE_ENV` environment variable to either `development` or `production`.

## Usage

### Authentication

```typescript
import { Crittora } from "@wutif/crittora";

const crittora = new Crittora();

const username = "your_username";
const password = "your_password";

crittora
  .authenticate(username, password)
  .then((response) => {
    console.log("Authentication successful");
    // Store these tokens securely
    const { IdToken, AccessToken, RefreshToken } = response;
  })
  .catch((error) => {
    console.error("Authentication failed:", error);
  });
```

### Encryption

```typescript
const idToken = "your_id_token"; // from authentication
const data = "sensitive data";
const permissions = ["permission1", "permission2"]; // optional

crittora
  .encrypt(idToken, data, permissions)
  .then((encryptedData) => {
    console.log("Encrypted data:", encryptedData);
  })
  .catch((error) => {
    console.error("Encryption failed:", error);
  });
```

### Decryption

```typescript
const idToken = "your_id_token"; // from authentication
const encryptedData = "encrypted_string";
const permissions = ["permission1", "permission2"]; // optional

crittora
  .decrypt(idToken, encryptedData, permissions)
  .then((decryptedData) => {
    console.log("Decrypted data:", decryptedData);
  })
  .catch((error) => {
    console.error("Decryption failed:", error);
  });
```

### Decrypt-Verify

```typescript
const idToken = "your_id_token"; // from authentication
const encryptedData = "encrypted_string";
const permissions = ["permission1", "permission2"]; // optional

crittora
  .decryptVerify(idToken, encryptedData, permissions)
  .then((response) => {
    console.log("Decrypted data:", response.decrypted_data);
    console.log("Signature valid:", response.is_valid_signature);
  })
  .catch((error) => {
    console.error("Decrypt-verify failed:", error);
  });
```

## Error Handling

The SDK provides specific error types for different scenarios:

```typescript
// Base error type
CrittoraError: General SDK errors with code and status

// Specific error types
AuthenticationError: Authentication-related failures
EncryptionError: Encryption operation failures
DecryptionError: Decryption operation failures
```

Example error handling:

```typescript
try {
  await crittora.encrypt(idToken, data);
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Handle authentication issues
  } else if (error instanceof EncryptionError) {
    // Handle encryption failures
  } else {
    // Handle other errors
  }
}
```

## Types

The SDK exports the following TypeScript interfaces:

```typescript
// Authentication
interface AuthResponse {
  IdToken: string;
  AccessToken: string;
  RefreshToken: string;
}

// Configuration
interface CrittoraConfig {
  cognito_endpoint?: string;
  base_url?: string;
  user_pool_id?: string;
  client_id?: string;
}

// Operations
interface EncryptResponse {
  encrypted_data: string;
}

interface DecryptResponse {
  decrypted_data: string;
}

interface DecryptVerifyResponse {
  decrypted_data: string;
  is_valid_signature: boolean;
}

// Permissions
interface Permission {
  partner_id: string;
  permissions: string[];
}

// Parameters
interface BaseParams {
  data: string;
  requested_actions: string[];
  permissions?: Permission[];
}

interface DecryptParams {
  encrypted_data: string;
  transactionId?: string;
  requested_actions?: string[];
}
```

## Running Tests

To run tests:

```bash
npm install --save-dev jest ts-jest @types/jest
npm test
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any bugs or features.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
