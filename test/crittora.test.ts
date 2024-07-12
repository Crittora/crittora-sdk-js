import { Crittora } from "../src/crittora";

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

const handleAction = async (action: Function, params: any) => {
  try {
    const response = await action(params);
    const responseData = JSON.parse(response.body);
    return responseData;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};

describe("Crittora SDK", () => {
  jest.setTimeout(15000); // Extend timeout for async operations

  test("should encrypt data", async () => {
    const params = {
      data: "fake data",
      requested_actions: ["e"],
      permissions: [{ partner_id: "12345", permissions: ["d"] }],
    };

    const response = await handleAction(
      crittora.encrypt.bind(crittora),
      params
    );
    expect(response).toHaveProperty("encrypted_data");
  });

  test("should decrypt data", async () => {
    const params = {
      transactionId: "eb724aa1-2868-4a4f-936e-559036c661d0",
      encryptedData: "bc6G47v1lWZriVnT6T1duUBxiipW-4HtoOoAMjFbC6o=",
      requested_actions: ["d"],
    };

    const response = await handleAction(
      crittora.decrypt.bind(crittora),
      params
    );
    expect(response).toHaveProperty("decrypted_data");
  });

  test("should sign data", async () => {
    const params = {
      data: "fake data",
      requested_actions: ["s"],
      permissions: [{ partner_id: "12345", permissions: ["d"] }],
    };

    const response = await handleAction(crittora.sign.bind(crittora), params);
    expect(response).toHaveProperty("signature");
  });

  test("should verify data", async () => {
    const params = {
      signedData: "fake data",
      transactionId: "d6838cb6-89c4-459b-9919-68ab40f285c9",
      signature:
        "8e082a42335c71b64fe228de8842512c1881f7fabbb561b77de0ca97e5c273926099554d686806d9da42c48ae8ad631f914681f25c8595f1bb1264f5c7a18508",
      requested_actions: ["v"],
    };

    const response = await handleAction(crittora.verify.bind(crittora), params);
    expect(response).toHaveProperty("is_valid_signature");
  });

  test("should sign and encrypt data", async () => {
    const params = {
      data: "fake data",
      requested_actions: ["e", "s"],
      permissions: [{ partner_id: "12345", permissions: ["d"] }],
    };

    const response = await handleAction(
      crittora.signEncrypt.bind(crittora),
      params
    );
    expect(response).toHaveProperty("encryption");
    expect(response.encryption).toHaveProperty("transactionid");
    expect(response.encryption).toHaveProperty("encrypted_data");
    expect(response).toHaveProperty("signature");
    expect(response.signature).toHaveProperty("transactionid");
    expect(response.signature).toHaveProperty("signature");
  });
});
