import dotenv from "dotenv";
import Crittora from "../src/crittora";

// Load environment variables from .env file
dotenv.config();

// Mock the global fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        AuthenticationResult: { IdToken: "mock-id-token", ExpiresIn: 3600 },
      }),
  })
) as jest.Mock;

describe("Crittora Class", () => {
  const clientId = process.env.CLIENT_ID || "mock-client-id";
  const clientSecret = process.env.CLIENT_SECRET || "mock-client-secret";
  const userPoolId = process.env.USER_POOL_ID || "mock-user-pool-id";

  let crittora: Crittora;

  beforeEach(() => {
    crittora = new Crittora(clientId, clientSecret, userPoolId);
    jest.clearAllMocks();
  });

  const mockRequest = async (
    methodName: keyof Crittora,
    url: string,
    payload: object,
    idToken = process.env.ID_TOKEN || "mock-id-token"
  ) => {
    const apiKey = process.env.API_KEY || "mock-api-key";
    const accessKey = process.env.ACCESS_KEY || "mock-access-key";
    const secretKey = process.env.SECRET_KEY || "mock-secret-key";

    await (crittora[methodName] as Function)(
      idToken,
      apiKey,
      accessKey,
      secretKey,
      ...Object.values(payload)
    );

    expect(fetch).toHaveBeenCalledWith(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "x-api-key": apiKey,
        "x-access-key": accessKey,
        "x-secret-key": secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  };

  describe("authenticate", () => {
    it("should return a valid IdToken when authentication is successful", async () => {
      const username = process.env.USER_NAME || "mock-username";
      const password = process.env.PASSWORD || "mock-password";

      const idToken = await crittora.authenticate(username, password);

      expect(idToken).toBe("mock-id-token");
      expect(fetch).toHaveBeenCalledWith(
        "https://cognito-idp.us-east-1.amazonaws.com/",
        expect.any(Object)
      );
    });

    it("should throw an error when authentication fails", async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          statusText: "Bad Request",
        })
      );

      const username = process.env.USER_NAME || "mock-username";
      const password = process.env.PASSWORD || "mock-password";

      await expect(crittora.authenticate(username, password)).rejects.toThrow(
        "Authentication failed"
      );
    });

    it("should throw an error when username or password is missing", async () => {
      await expect(crittora.authenticate("", "password")).rejects.toThrow(
        "Username and password are required"
      );
      await expect(crittora.authenticate("username", "")).rejects.toThrow(
        "Username and password are required"
      );
    });
  });

  describe("signEncrypt", () => {
    it("should call fetch with the correct parameters", async () => {
      const idToken = "mock-id-token";
      const apiKey = "mock-api-key";
      const accessKey = "mock-access-key";
      const secretKey = "mock-secret-key";
      const data = "mock-data";
      const permissions = ["mock-permission"];
      const url = "SIGN_ENCRYPT_URL";

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
        })
      );

      await crittora.signEncrypt(
        idToken,
        apiKey,
        accessKey,
        secretKey,
        data,
        permissions,
        url
      );

      expect(fetch).toHaveBeenCalledWith(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "x-api-key": apiKey,
          "x-access-key": accessKey,
          "x-secret-key": secretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: data,
          requested_actions: ["e", "s"],
          permissions: permissions,
        }),
      });
    });

    it("should throw an error when the API call fails", async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        })
      );

      const idToken = "mock-id-token";
      const apiKey = "mock-api-key";
      const accessKey = "mock-access-key";
      const secretKey = "mock-secret-key";
      const data = "mock-data";

      await expect(
        crittora.signEncrypt(idToken, apiKey, accessKey, secretKey, data)
      ).rejects.toThrow("API call failed: 500 Internal Server Error");
    });
  });

  describe("decryptVerify", () => {
    it("should call fetch with the correct parameters", async () => {
      const encrypted_data =
        process.env.ENCRYPTED_DATA || "mock-encrypted-data";
      const permissions = ["mock-permission"];

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
        })
      );

      await mockRequest("decryptVerify", "DECRYPT_VERIFY_URL", {
        encrypted_data,
        permissions,
      });
    });

    it("should throw an error when the API call fails", async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          statusText: "Bad Request",
        })
      );

      const idToken = "mock-id-token";
      const apiKey = "mock-api-key";
      const accessKey = "mock-access-key";
      const secretKey = "mock-secret-key";
      const encrypted_data = "mock-encrypted-data";

      await expect(
        crittora.decryptVerify(
          idToken,
          apiKey,
          accessKey,
          secretKey,
          encrypted_data
        )
      ).rejects.toThrow("API call failed: 400 Bad Request");
    });
  });

  describe("encrypt", () => {
    it("should call fetch with the correct parameters", async () => {
      const idToken = "mock-id-token";
      const apiKey = "mock-api-key";
      const accessKey = "mock-access-key";
      const secretKey = "mock-secret-key";
      const data = "mock-data";
      const permissions = ["mock-permission"];
      const url = "ENCRYPT_URL";

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
        })
      );

      await crittora.encrypt(
        idToken,
        apiKey,
        accessKey,
        secretKey,
        data,
        permissions,
        url
      );

      expect(fetch).toHaveBeenCalledWith(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "x-api-key": apiKey,
          "x-access-key": accessKey,
          "x-secret-key": secretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: data,
          requested_actions: ["e"],
          permissions: permissions,
        }),
      });
    });

    it("should throw an error when the API call fails", async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 403,
          statusText: "Forbidden",
        })
      );

      const idToken = "mock-id-token";
      const apiKey = "mock-api-key";
      const accessKey = "mock-access-key";
      const secretKey = "mock-secret-key";
      const data = "mock-data";

      await expect(
        crittora.encrypt(idToken, apiKey, accessKey, secretKey, data)
      ).rejects.toThrow("API call failed: 403 Forbidden");
    });
  });

  describe("decrypt", () => {
    it("should call fetch with the correct parameters", async () => {
      const encrypted_data =
        process.env.ENCRYPTED_DATA || "mock-encrypted-data";
      const permissions = ["mock-permission"];

      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
        })
      );

      await mockRequest("decrypt", "DECRYPT_URL", {
        encrypted_data,
        permissions,
      });
    });

    it("should throw an error when the API call fails", async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          statusText: "Unauthorized",
        })
      );

      const idToken = "mock-id-token";
      const apiKey = "mock-api-key";
      const accessKey = "mock-access-key";
      const secretKey = "mock-secret-key";
      const encrypted_data = "mock-encrypted-data";

      await expect(
        crittora.decrypt(idToken, apiKey, accessKey, secretKey, encrypted_data)
      ).rejects.toThrow("API call failed: 401 Unauthorized");
    });
  });
});
