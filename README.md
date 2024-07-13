# Crittora SDK

Crittora SDK provides secure methods for encrypting, decrypting, signing, verifying, and combining these operations on data. It uses AWS Cognito for authentication and Axios for HTTP requests.

## Table of Contents

- [Crittora SDK](#crittora-sdk)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Usage](#usage)
    - [Encrypt](#encrypt)
    - [Decrypt](#decrypt)
    - [Sign](#sign)
    - [Verify](#verify)
    - [SignEncrypt](#signencrypt)
    - [VerifyDecrypt](#verifydecrypt)
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

Before using the SDK, you need to configure it with your credentials:

```typescript
import { Crittora } from "@wutif/crittora";

const config = {
  credentialsUsername: "testuser5",
  credentialsPassword: "jn]{`:s6&T6-qqHd",
  cognitoPoolClientId: "a46804b8-20a1-708d-f5d0-13fe0ae1bfa7",
  clientId: "5g9pp889dcru8php2p5ihvoosr",
  clientSecret: "1ln5m524mjvi7ah9v0060498nhlhkdf06k5avthuu7dgqht7biqf",
  api_key: "ma,{fKV!mLTVBEY)U#Bi(@Y-r;RJ.684*SF:dB!.H}R.c|>{[!y't]6bm{K=Cl}c",
  secret_key:
    "*q4@?D</qmrhfF9I_[_Rt_?(wV2CE:n'!beg<{#|A;2%:ETDgk}.ZseGPrz.td`A",
  access_key: "6QNm1zR5.V:(X=Z~W(2SBO|7,Gw@jz4!",
  fetchTokenOnEveryRequest: true,
};

const crittora = new Crittora(config);
```

## Usage

### Encrypt

```typescript
const params = {
  data: "fake data",
  requested_actions: ["e"],
  permissions: [{ partner_id: "12345", permissions: ["d"] }],
};

crittora
  .encrypt(params)
  .then((response) => {
    console.log("Encrypted data:", response.encrypted_data);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

### Decrypt

```typescript
const params = {
  transactionId: "eb724aa1-2868-4a4f-936e-559036c661d0",
  encryptedData: "bc6G47v1lWZriVnT6T1duUBxiipW-4HtoOoAMjFbC6o=",
  requested_actions: ["d"],
};

crittora
  .decrypt(params)
  .then((response) => {
    console.log("Decrypted data:", response.decrypted_data);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

### Sign

```typescript
const params = {
  data: "fake data",
  requested_actions: ["s"],
  permissions: [{ partner_id: "12345", permissions: ["d"] }],
};

crittora
  .sign(params)
  .then((response) => {
    console.log("Signature:", response.signature);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

### Verify

```typescript
const params = {
  signedData: "fake data",
  transactionId: "d6838cb6-89c4-459b-9919-68ab40f285c9",
  signature:
    "8e082a42335c71b64fe228de8842512c1881f7fabbb561b77de0ca97e5c273926099554d686806d9da42c48ae8ad631f914681f25c8595f1bb1264f5c7a18508",
  requested_actions: ["v"],
};

crittora
  .verify(params)
  .then((response) => {
    console.log("Is valid signature:", response.is_valid_signature);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

### SignEncrypt

```typescript
const params = {
  data: "fake data",
  requested_actions: ["e", "s"],
  permissions: [{ partner_id: "12345", permissions: ["d"] }],
};

crittora
  .signEncrypt(params)
  .then((response) => {
    console.log("Encryption:", response.encryption);
    console.log("Signature:", response.signature);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

### VerifyDecrypt

```typescript
const params = {
  encryption: {
    transactionId: "fdfb353c-086d-48d6-bde7-ce308ffedbf3",
    encryptedData: "Z5CGrDnrmf8vRjXrr5WfZuWGAC8NJ5hbwr2aE30DX30=",
  },
  signing: {
    transactionId: "07192add-3109-4603-aff2-d68817c77f89",
    signature:
      "c1884a1e939b553582c97f5af38a379e136dadb8a333256896486cf44a77b20a7e21c8aec59d5f8f93b331c198da26c8fba9616991591b8141f0ad8dccf7450d",
  },
  requested_actions: ["v", "d"],
};

crittora
  .verifyDecrypt(params)
  .then((response) => {
    console.log("Decrypted data:", response.decrypted_data);
    console.log("Is valid signature:", response.is_valid_signature);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

## Types

Here are the types used in the SDK:

```typescript
export interface Permission {
  partner_id: string;
  permissions: string[];
}

export interface BaseParams {
  data: string;
  requested_actions: string[];
  permissions: Permission[];
}

export interface BaseResponse {
  encryptedData?: string;
  decrypted_data?: string;
  transactionId?: string;
}

export interface EncryptParams extends BaseParams {}

export interface DecryptParams {
  encryptedData: string;
  transactionId: string;
  requested_actions: string[];
}

export interface SignParams {
  signedData: string;
  transactionId: string;
  requested_actions: string[];
  signature: string;
}

export interface VerifyParams extends BaseParams {}

export interface SignEncryptParams extends BaseParams {}

export interface EncryptResponse extends BaseResponse {
  encryptedData: string;
}

export interface DecryptResponse extends BaseResponse {
  decrypted_data: string;
}

export interface SignResponse extends BaseResponse {
  transactionId: string;
  signature: string;
}

export interface VerifyResponse {
  is_valid_signature: boolean;
}

export interface SignEncryptResponse {
  encryption: {
    transactionId: string;
    encrypted_data: string;
  };
  signature: {
    transactionId: string;
    signature: string;
  };
}

export interface VerifyDecryptResponse {
  is_valid_signature: boolean;
}

export interface Config {
  credentialsUsername: string;
  credentialsPassword: string;
  cognitoPoolClientId: string;
  clientId: string;
  clientSecret: string;
  api_key: string;
  secret_key: string;
  access_key: string;
  fetchTokenOnEveryRequest: boolean;
  currentAccessToken?: string;
  accessTokenExpiry?: number;
}
```

## Running Tests

To run tests, ensure you have Jest installed and set up in your project:

```bash
npm install --save-dev jest ts-jest @types/jest
```

Create a Jest configuration file (`jest.config.js`):

```javascript
/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
};
```

Add the following scripts to your `package.json`:

```json
"scripts": {
  "test": "jest"
}
```

Run tests with:

```bash
npm test
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any bugs or features.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

```

```

```

```
