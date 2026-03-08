import { CognitoUser } from "amazon-cognito-identity-js";
import {
  bearerToken,
  CognitoAuthProvider,
  Crittora,
  CrittoraClient,
  DecryptError,
  EncryptError,
} from "../src";

describe("CrittoraClient", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("encrypts with normalized input and output", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ encrypted_data: "org-envelope" }),
      headers: new Headers(),
    });

    const client = new CrittoraClient({
      fetch: fetchMock as typeof globalThis.fetch,
      credentials: { apiKey: "api-key" },
      auth: bearerToken("id-token"),
    });

    const result = await client.encrypt({
      data: "hello",
      permissions: [{ partnerId: "partner-1", actions: ["read"] }],
    });

    expect(result).toEqual({
      encryptedData: "org-envelope",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.crittoraapis.com/encrypt",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer id-token",
          api_key: "api-key",
        }),
      })
    );
  });

  it("unwraps legacy lambda-style responses", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
      body: JSON.stringify({
        decrypted_data: "plaintext",
        is_valid_signature: true,
        signed_by: "Partner A",
        signed_timestamp: "2026-03-08T01:00:00Z",
      }),
    }),
      headers: new Headers(),
    });

    const client = new CrittoraClient({
      fetch: fetchMock as typeof globalThis.fetch,
    });

    const result = await client.decryptVerify({
      encryptedData: "ciphertext",
    });

    expect(result).toEqual({
      decryptedData: "plaintext",
      isValidSignature: true,
      signedBy: "Partner A",
      signedTimestamp: "2026-03-08T01:00:00Z",
      repudiator: undefined,
    });
  });

  it("preserves failed signature verification metadata", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          decrypted_data: "plaintext",
          is_valid_signature: false,
          repudiator: "Partner B",
        }),
      headers: new Headers(),
    });

    const client = new CrittoraClient({
      fetch: fetchMock as typeof globalThis.fetch,
    });

    const result = await client.decryptVerify({
      encryptedData: "ciphertext",
    });

    expect(result).toEqual({
      decryptedData: "plaintext",
      isValidSignature: false,
      signedBy: undefined,
      signedTimestamp: undefined,
      repudiator: "Partner B",
    });
  });

  it("sign-encrypts with normalized input and output", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ encrypted_data: "org-envelope" }),
      headers: new Headers(),
    });

    const client = new CrittoraClient({
      fetch: fetchMock as typeof globalThis.fetch,
      auth: bearerToken("id-token"),
    });

    const result = await client.signEncrypt({
      data: "hello",
      permissions: [{ partnerId: "partner-1", actions: ["read"] }],
    });

    expect(result).toEqual({
      encryptedData: "org-envelope",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.crittoraapis.com/sign-encrypt",
      expect.objectContaining({
        body: JSON.stringify({
          data: "hello",
          requested_actions: ["e", "s"],
          permissions: [
            {
              partner_id: "partner-1",
              permissions: ["read"],
            },
          ],
        }),
      })
    );
  });

  it("maps transport failures into resource-specific errors", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      text: async () => JSON.stringify({ message: "boom" }),
      headers: new Headers(),
      status: 500,
    });

    const client = new CrittoraClient({
      fetch: fetchMock as typeof globalThis.fetch,
    });

    await expect(
      client.encrypt({
        data: "hello",
      })
    ).rejects.toBeInstanceOf(EncryptError);

    await expect(
      client.decrypt({
        encryptedData: "ciphertext",
      })
    ).rejects.toBeInstanceOf(DecryptError);
  });

  it("creates auth-scoped clients with withAuth", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ decrypted_data: "plaintext" }),
      headers: new Headers(),
    });

    const client = new CrittoraClient({
      fetch: fetchMock as typeof globalThis.fetch,
    }).withAuth({ type: "bearer", token: "scoped-token" });

    await client.decrypt({ encryptedData: "ciphertext" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.crittoraapis.com/decrypt",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer scoped-token",
        }),
      })
    );
  });
});

describe("CognitoAuthProvider", () => {
  it("authenticates and stores bearer tokens", async () => {
    jest
      .spyOn(CognitoUser.prototype, "authenticateUser")
      .mockImplementation((authDetails, callbacks) => {
        callbacks.onSuccess({
          getIdToken: () => ({
            getJwtToken: () => "id-token",
          }),
          getAccessToken: () => ({
            getJwtToken: () => "access-token",
          }),
          getRefreshToken: () => ({
            getToken: () => "refresh-token",
          }),
        } as never);
      });

    const auth = new CognitoAuthProvider({
      userPoolId: "us-east-1_ABCdef123",
      clientId: "1234567890abcdefghijklmnopqr",
    });

    const tokens = await auth.login({
      username: "user",
      password: "pass",
    });

    expect(tokens).toEqual({
      idToken: "id-token",
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
    await expect(auth.getAuthorizationHeader()).resolves.toBe("Bearer id-token");
  });
});

describe("Crittora v1 shim", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    process.env.API_KEY = "api-key";
    process.env.ACCESS_KEY = "access-key";
    process.env.SECRET_KEY = "secret-key";
  });

  it("preserves the legacy positional encrypt API", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ encrypted_data: "ciphertext" }),
      headers: new Headers(),
    });

    const sdk = new Crittora({
      fetch: fetchMock as typeof globalThis.fetch,
    });

    const result = await sdk.encrypt("id-token", "hello", ["read", "write"]);
    expect(result).toBe("ciphertext");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.crittoraapis.com/encrypt",
      expect.objectContaining({
        body: JSON.stringify({
          data: "hello",
          requested_actions: ["e"],
          permissions: [
            {
              partner_id: "default",
              permissions: ["read", "write"],
            },
          ],
        }),
      })
    );
  });

  it("preserves the legacy positional signEncrypt API", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ encrypted_data: "org-envelope" }),
      headers: new Headers(),
    });

    const sdk = new Crittora({
      fetch: fetchMock as typeof globalThis.fetch,
    });

    const result = await sdk.signEncrypt("id-token", "hello", ["read"]);
    expect(result).toBe("org-envelope");
  });
});
