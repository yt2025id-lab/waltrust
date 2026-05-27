import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/sui-client", () => ({
  suiClient: {},
  CONTRACT: { packageId: "0x0", credentialModule: "credential" },
  CREDENTIAL_TYPE: "0x0::credential::Credential",
  ISSUER_CAP_TYPE: "0x0::credential::IssuerCap",
}));

const { parseCredentialFields, checkCredentialValidity, parseIssuerCapFields, buildVerifyCredentialTx, buildReactivateIssuerTx } = await import("@/lib/contract");

describe("parseCredentialFields", () => {
  it("parses valid credential object", () => {
    const obj = {
      data: {
        content: {
          fields: {
            walrus_blob_id: "blob123",
            walrus_metadata_blob_id: "meta456",
            document_hash: "0xabc",
            credential_type: "degree",
            title: "Computer Science",
            issuer: "0xissuer",
            issuer_name: "Test University",
            recipient: "0xrecipient",
            recipient_name: "Alice",
            issued_at: "1000",
            expires_at: "0",
            is_valid: true,
            extra_fields: {
              fields: {
                contents: [
                  { fields: { key: "student_id", value: "12345" } },
                ],
              },
            },
          },
        },
      },
    };
    const result = parseCredentialFields(obj);
    expect(result).not.toBeNull();
    expect(result!.title).toBe("Computer Science");
    expect(result!.credential_type).toBe("degree");
    expect(result!.is_valid).toBe(true);
    expect(result!.extra_fields.student_id).toBe("12345");
  });

  it("returns null for missing fields", () => {
    expect(parseCredentialFields({})).toBeNull();
    expect(parseCredentialFields({ data: {} })).toBeNull();
  });

  it("handles missing extra_fields gracefully", () => {
    const obj = {
      data: {
        content: {
          fields: {
            walrus_blob_id: "b",
            walrus_metadata_blob_id: "m",
            document_hash: "h",
            credential_type: "t",
            title: "T",
            issuer: "0x1",
            issuer_name: "N",
            recipient: "0x2",
            recipient_name: "R",
            issued_at: "0",
            expires_at: "0",
            is_valid: true,
          },
        },
      },
    };
    const result = parseCredentialFields(obj);
    expect(result).not.toBeNull();
    expect(result!.extra_fields).toEqual({});
  });
});

describe("checkCredentialValidity", () => {
  const baseFields = {
    walrus_blob_id: "b",
    walrus_metadata_blob_id: "m",
    document_hash: "h",
    credential_type: "degree",
    title: "T",
    issuer: "0x1",
    issuer_name: "N",
    recipient: "0x2",
    recipient_name: "R",
    issued_at: "0",
    expires_at: "0",
    is_valid: true,
    extra_fields: {},
  };

  it("returns 'valid' for valid credential", () => {
    expect(checkCredentialValidity(baseFields)).toBe("valid");
  });

  it("returns 'revoked' when is_valid is false", () => {
    expect(checkCredentialValidity({ ...baseFields, is_valid: false })).toBe("revoked");
  });

  it("returns 'expired' when past expiry", () => {
    const past = Date.now() - 10000;
    expect(checkCredentialValidity({ ...baseFields, expires_at: String(past) })).toBe("expired");
  });

  it("returns 'valid' when not yet expired", () => {
    const future = Date.now() + 86400000;
    expect(checkCredentialValidity({ ...baseFields, expires_at: String(future) })).toBe("valid");
  });

  it("returns 'valid' for expires_at=0 (no expiry)", () => {
    expect(checkCredentialValidity({ ...baseFields, expires_at: "0" })).toBe("valid");
  });
});

describe("parseIssuerCapFields", () => {
  it("parses valid IssuerCap object", () => {
    const obj = {
      data: {
        content: {
          fields: {
            issuer_address: "0xissuer",
            issuer_name: "Test University",
            is_active: true,
          },
        },
      },
    };
    const result = parseIssuerCapFields(obj);
    expect(result).not.toBeNull();
    expect(result!.issuer_address).toBe("0xissuer");
    expect(result!.issuer_name).toBe("Test University");
    expect(result!.is_active).toBe(true);
  });

  it("returns null for missing fields", () => {
    expect(parseIssuerCapFields({})).toBeNull();
    expect(parseIssuerCapFields({ data: {} })).toBeNull();
  });
});

describe("buildVerifyCredentialTx", () => {
  it("returns a Transaction", () => {
    const tx = buildVerifyCredentialTx("0xcredential");
    expect(tx).toBeDefined();
  });
});

describe("buildReactivateIssuerTx", () => {
  it("returns a Transaction", () => {
    const tx = buildReactivateIssuerTx("0xadmin", "0xregistry", "0xcap");
    expect(tx).toBeDefined();
  });
});
