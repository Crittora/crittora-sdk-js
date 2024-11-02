import { Crittora } from "../src/crittora";
import {
  CrittoraError,
  AuthenticationError,
} from "../src/errors/crittoraErrors";
import { CognitoUser } from "amazon-cognito-identity-js";

describe("Crittora", () => {
  let crittora: Crittora;
  const mockIdToken = "mock-id-token";
  const mockEncryptedData = "encrypted-data";

  beforeEach(() => {
    crittora = new Crittora();
    jest.clearAllMocks();
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
    });

    it("should handle errors appropriately", async () => {
      globalThis.fetch = jest
        .fn()
        .mockRejectedValue(new Error("Network error"));

      await expect(
        crittora.decryptVerify(mockIdToken, mockEncryptedData)
      ).rejects.toThrow(CrittoraError);
    });

    it("should include permissions when provided", async () => {
      const mockPermissions = ["read", "write"];
      const mockDecryptedData = "decrypted-data";
      const mockIsValid = true;

      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          body: JSON.stringify({
            decrypted_data: mockDecryptedData,
            is_valid_signature: mockIsValid,
          }),
        }),
      });
      globalThis.fetch = fetchMock;

      await crittora.decryptVerify(
        mockIdToken,
        mockEncryptedData,
        mockPermissions
      );

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining(JSON.stringify(mockPermissions)),
        })
      );
    });

    it("should handle invalid response format", async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          body: "invalid-json",
        }),
      });

      await expect(
        crittora.decryptVerify(mockIdToken, mockEncryptedData)
      ).rejects.toThrow(CrittoraError);
    });
  });

  describe("authenticate", () => {
    it("should successfully authenticate user", async () => {
      const mockUsername = "testuser";
      const mockPassword = "testpass";
      const mockAuthResponse = {
        IdToken: "mock-id-token",
        AccessToken: "mock-access-token",
        RefreshToken: "mock-refresh-token",
      };

      // Mock the CognitoUser.authenticateUser method
      jest
        .spyOn(CognitoUser.prototype, "authenticateUser")
        .mockImplementation((authDetails, callbacks) => {
          callbacks.onSuccess({
            getIdToken: () => ({
              getJwtToken: () => mockAuthResponse.IdToken,
              payload: {},
              getExpiration: () => 0,
              getIssuedAt: () => 0,
              decodePayload: () => ({}),
            }),
            getAccessToken: () => ({
              getJwtToken: () => mockAuthResponse.AccessToken,
              payload: {},
              getExpiration: () => 0,
              getIssuedAt: () => 0,
              decodePayload: () => ({}),
            }),
            getRefreshToken: () => ({
              getToken: () => mockAuthResponse.RefreshToken,
            }),
            isValid: () => true,
          });
        });

      const result = await crittora.authenticate(mockUsername, mockPassword);
      expect(result).toEqual(mockAuthResponse);
    });

    it("should handle authentication failure", async () => {
      const mockUsername = "testuser";
      const mockPassword = "wrongpass";

      jest
        .spyOn(CognitoUser.prototype, "authenticateUser")
        .mockImplementation((authDetails, callbacks) => {
          callbacks.onFailure(new Error("Invalid credentials"));
        });

      await expect(
        crittora.authenticate(mockUsername, mockPassword)
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe("encrypt", () => {
    it("should successfully encrypt data", async () => {
      const mockData = "sensitive-data";
      const mockEncryptedResult = "encrypted-result";

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          body: JSON.stringify({
            encrypted_data: mockEncryptedResult,
          }),
        }),
      });

      const result = await crittora.encrypt(mockIdToken, mockData);
      expect(result).toBe(mockEncryptedResult);
    });

    it("should handle encryption errors", async () => {
      const mockData = "sensitive-data";

      globalThis.fetch = jest
        .fn()
        .mockRejectedValue(new Error("Encryption failed"));

      await expect(crittora.encrypt(mockIdToken, mockData)).rejects.toThrow(
        CrittoraError
      );
    });

    it("should include permissions when provided", async () => {
      const mockData = "sensitive-data";
      const mockPermissions = ["read", "write"];
      const mockEncryptedResult = "encrypted-result";

      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          body: JSON.stringify({
            encrypted_data: mockEncryptedResult,
          }),
        }),
      });
      globalThis.fetch = fetchMock;

      await crittora.encrypt(mockIdToken, mockData, mockPermissions);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining(JSON.stringify(mockPermissions)),
        })
      );
    });
  });

  describe("decrypt", () => {
    it("should successfully decrypt data", async () => {
      const mockDecryptedResult = "decrypted-result";

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          body: JSON.stringify({
            decrypted_data: mockDecryptedResult,
          }),
        }),
      });

      const result = await crittora.decrypt(mockIdToken, mockEncryptedData);
      expect(result).toBe(mockDecryptedResult);
    });

    it("should handle decryption errors", async () => {
      globalThis.fetch = jest
        .fn()
        .mockRejectedValue(new Error("Decryption failed"));

      await expect(
        crittora.decrypt(mockIdToken, mockEncryptedData)
      ).rejects.toThrow(CrittoraError);
    });
  });
});
