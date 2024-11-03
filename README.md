# Crittora SDK

Crittora SDK provides secure methods for encrypting, decrypting, signing, verifying, and combining these operations on data. It uses AWS Cognito for authentication and the Fetch API for HTTP requests.

## Table of Contents

- [Crittora SDK](#crittora-sdk)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Configuration](#configuration)
    - [Environment Variables](#environment-variables)
    - [Environment Configuration](#environment-configuration)
  - [Usage](#usage)
    - [Authentication](#authentication)
    - [Encryption](#encryption)
    - [Decryption](#decryption)
    - [Decrypt-Verify](#decrypt-verify)
  - [Demo Project](#demo-project)
  - [Error Handling](#error-handling)
  - [Types](#types)
  - [Contributing](#contributing)
  - [License](#license)

## Installation

To install the Crittora SDK, run:

```bash
npm install @wutif/crittora
```

## Configuration

### Environment Variables

```dotenv
# Required API keys
API_KEY=your_api_key
ACCESS_KEY=your_access_key
SECRET_KEY=your_secret_key
```

### Environment Configuration

The SDK currently uses the following configuration:

- Cognito Endpoint: https://cognito-idp.us-east-1.amazonaws.com/
- Base URL: https://api.crittoraapis.com
- User Pool ID: us-east-1_Tmljk4Uiw
- Client ID: 5cvaao4qgphfp38g433vi5e82u

To use different configuration values, you can set them via environment variables (coming soon).

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

## Demo Project

For a complete implementation example, check out our [demo project](https://github.com/Crittora/crittora-demo). This project demonstrates:

- Authentication with AWS Cognito
- Environment variable management
- Integration with Crittora's encryption services
- Basic API endpoints for encryption/decryption
- Frontend implementation examples

The demo includes a full web application structure:

```
crittora-demo/
├── public/
│   ├── css/
│   ├── js/
│   └── index.html
├── test.js
├── server.js
├── .env
└── package.json
```

To get started with the demo:

```bash
git clone https://github.com/Crittora/crittora-demo.git
cd crittora-demo
npm install
```

Configure your environment variables and run:

```bash
npm start
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

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any bugs or features.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
