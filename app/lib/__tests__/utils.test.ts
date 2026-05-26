import { describe, it, expect } from "vitest";
import {
  formatDate,
  truncateAddress,
  getCredentialTypeLabel,
  isValidSuiAddress,
} from "@/lib/utils";

describe("formatDate", () => {
  it("returns 'No Expiry' for 0", () => {
    expect(formatDate(0)).toBe("No Expiry");
    expect(formatDate("0")).toBe("No Expiry");
  });

  it("formats a valid number timestamp", () => {
    const result = formatDate(1710000000000);
    expect(result).toContain("2024");
    expect(result).toContain("March");
  });

  it("handles string timestamp", () => {
    const result = formatDate("1710000000000");
    expect(result).toContain("2024");
  });
});

describe("truncateAddress", () => {
  it("truncates a Sui address", () => {
    const addr = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    expect(truncateAddress(addr)).toBe("0x1234...cdef");
  });

  it("returns empty string for empty input", () => {
    expect(truncateAddress("")).toBe("");
  });

  it("handles short address gracefully", () => {
    expect(truncateAddress("0x1234")).toBe("0x1234...1234");
  });
});

describe("getCredentialTypeLabel", () => {
  it("returns label for known type", () => {
    expect(getCredentialTypeLabel("degree")).toBe("Degree / Ijazah");
    expect(getCredentialTypeLabel("certificate")).toBe("Certificate / Sertifikasi");
    expect(getCredentialTypeLabel("work_experience")).toBe("Work Experience");
  });

  it("returns input for unknown type", () => {
    expect(getCredentialTypeLabel("unknown")).toBe("unknown");
  });
});

describe("isValidSuiAddress", () => {
  it("returns true for valid 64-char hex address", () => {
    expect(isValidSuiAddress("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")).toBe(true);
  });

  it("returns false for short address", () => {
    expect(isValidSuiAddress("0x1234")).toBe(false);
  });

  it("returns false for invalid hex", () => {
    expect(isValidSuiAddress("0xzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidSuiAddress("")).toBe(false);
  });

  it("returns false for missing 0x prefix", () => {
    expect(isValidSuiAddress("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")).toBe(false);
  });
});
