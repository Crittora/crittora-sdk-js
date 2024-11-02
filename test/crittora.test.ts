import { Crittora } from "../src/crittora";
import { CognitoUser } from "amazon-cognito-identity-js";

jest.mock("amazon-cognito-identity-js");

describe("Crittora", () => {
  let crittora: Crittora;
  let originalFetch: typeof fetch;
  const mockIdToken = "mock-id-token";
  const mockData = "test-data";
  const mockEncryptedData = "encrypted-test-data";

  beforeAll(() => {
    originalFetch = globalThis.fetch;
  });

  beforeEach(() => {
    crittora = new Crittora();
    process.env.API_KEY = "test-api-key";
    process.env.ACCESS_KEY = "test-access-key";
    process.env.SECRET_KEY = "test-secret-key";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.clearAllMocks();
  });

  describe("authenticate", () => {
    const mockUsername = "testuser";
    const mockPassword = "testpassword";
    const mockTokens = {
      getIdToken: () => ({ getJwtToken: () => "mock-id-token" }),
      getAccessToken: () => ({ getJwtToken: () => "mock-access-token" }),
      getRefreshToken: () => ({ getToken: () => "mock-refresh-token" }),
    };

    it("should successfully authenticate user", async () => {
      // Mock the authenticateUser method
      (CognitoUser as jest.Mock).mockImplementation(() => ({
        authenticateUser: (authDetails: any, callbacks: any) => {
          callbacks.onSuccess(mockTokens);
        },
      }));

      const result = await crittora.authenticate(mockUsername, mockPassword);

      expect(result).toEqual({
        IdToken: "mock-id-token",
        AccessToken: "mock-access-token",
        RefreshToken: "mock-refresh-token",
      });
    });

    it("should handle authentication failure", async () => {
      const mockError = new Error("Invalid credentials");

      (CognitoUser as jest.Mock).mockImplementation(() => ({
        authenticateUser: (authDetails: any, callbacks: any) => {
          callbacks.onFailure(mockError);
        },
      }));

      await expect(
        crittora.authenticate(mockUsername, mockPassword)
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("encrypt", () => {
    beforeEach(() => {
      jest.spyOn(console, "log").mockImplementation(() => {});
      jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should successfully encrypt data", async () => {
      // Mock fetch
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          body: JSON.stringify({
            encrypted_data: mockEncryptedData,
          }),
        }),
      });

      const result = await crittora.encrypt(mockIdToken, mockData);

      expect(result).toBe(mockEncryptedData);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://dev-api.crittoraapi.com/encrypt",
        {
          method: "POST",
          headers: expect.any(Headers),
          body: JSON.stringify({
            data: mockData,
            requested_actions: ["e"],
          }),
        }
      );
    });
  });

  describe("decrypt", () => {
    it("should successfully decrypt data", async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          body: JSON.stringify({
            decrypted_data: mockData,
          }),
        }),
      });

      const result = await crittora.decrypt(mockIdToken, mockEncryptedData);

      expect(result).toBe(mockData);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://dev-api.crittoraapi.com/decrypt",
        {
          method: "POST",
          headers: expect.any(Headers),
          body: JSON.stringify({
            encrypted_data: mockEncryptedData,
          }),
        }
      );
    });

    it("should include permissions in decrypt request when provided", async () => {
      const mockPermissions = ["permission1", "permission2"];

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          body: JSON.stringify({
            decrypted_data: mockData,
          }),
        }),
      });

      await crittora.decrypt(mockIdToken, mockEncryptedData, mockPermissions);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            encrypted_data: mockEncryptedData,
            permissions: mockPermissions,
          }),
        })
      );
    });

    it("should handle decryption errors", async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(
        crittora.decrypt(mockIdToken, mockEncryptedData)
      ).rejects.toThrow("HTTP error! status: 400");
    });
  });

  describe("signEncrypt", () => {
    beforeEach(() => {
      jest.spyOn(console, "log").mockImplementation(() => {});
      jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should successfully sign and encrypt data", async () => {
      const mockEncryptedData = "encrypted-and-signed-data";

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          body: JSON.stringify({
            encrypted_data: mockEncryptedData,
          }),
        }),
      });

      const result = await crittora.signEncrypt(mockIdToken, mockData);

      expect(result).toBe(mockEncryptedData);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://dev-api.crittoraapi.com/sign-encrypt",
        {
          method: "POST",
          headers: expect.any(Headers),
          body: JSON.stringify({
            data: mockData,
            requested_actions: ["e", "s"],
          }),
        }
      );
    });

    it("should include permissions in signEncrypt request when provided", async () => {
      const mockPermissions = ["permission1", "permission2"];
      const mockEncryptedData = "encrypted-and-signed-data";

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          body: JSON.stringify({
            encrypted_data: mockEncryptedData,
          }),
        }),
      });

      await crittora.signEncrypt(mockIdToken, mockData, mockPermissions);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            data: mockData,
            requested_actions: ["e", "s"],
            permissions: mockPermissions,
          }),
        })
      );
    });

    it("should handle signEncrypt errors", async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(crittora.signEncrypt(mockIdToken, mockData)).rejects.toThrow(
        "HTTP error! status: 400"
      );
    });
  });

  describe("decryptVerify", () => {
    it("should successfully decrypt and verify data", async () => {
      const mockDecryptedData = "decrypted-data";
      const mockIsValid = true;

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          body: JSON.stringify({
            decrypted_data: mockDecryptedData,
            is_valid_signature: mockIsValid,
          }),
        }),
      });

      const result = await crittora.decryptVerify(
        mockIdToken,
        mockEncryptedData
      );

      expect(result).toEqual({
        decrypted_data: mockDecryptedData,
        is_valid_signature: mockIsValid,
      });
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://dev-api.crittoraapi.com/decrypt-verify",
        {
          method: "POST",
          headers: expect.any(Headers),
          body: JSON.stringify({
            encrypted_data: mockEncryptedData,
          }),
        }
      );
    });

    it("should include permissions in decryptVerify request when provided", async () => {
      const mockPermissions = ["permission1", "permission2"];
      const mockDecryptedData = "decrypted-data";
      const mockIsValid = true;

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          body: JSON.stringify({
            decrypted_data: mockDecryptedData,
            is_valid_signature: mockIsValid,
          }),
        }),
      });

      await crittora.decryptVerify(
        mockIdToken,
        mockEncryptedData,
        mockPermissions
      );

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            encrypted_data: mockEncryptedData,
            permissions: mockPermissions,
          }),
        })
      );
    });

    it("should handle decryptVerify errors", async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(
        crittora.decryptVerify(mockIdToken, mockEncryptedData)
      ).rejects.toThrow("HTTP error! status: 400");
    });
  });
});
