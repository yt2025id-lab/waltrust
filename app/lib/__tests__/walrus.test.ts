import { describe, it, expect } from "vitest";
import { getWalrusDocUrl, hashFile } from "@/lib/walrus";

describe("getWalrusDocUrl", () => {
  it("returns correct aggregator URL", () => {
    const url = getWalrusDocUrl("abc123");
    expect(url).toContain("abc123");
    expect(url).toMatch(/^https:\/\/.*\/v1\/blobs\//);
  });
});

describe("hashFile", () => {
  it("returns 32-byte SHA-256 hash", async () => {
    const data = new TextEncoder().encode("test data").buffer;
    const hash = await hashFile(data);
    expect(hash).toBeInstanceOf(Uint8Array);
    expect(hash.length).toBe(32);
  });

  it("produces deterministic output", async () => {
    const data = new TextEncoder().encode("hello world").buffer;
    const hash1 = await hashFile(data);
    const hash2 = await hashFile(data);
    expect(hash1).toEqual(hash2);
  });

  it("produces different hashes for different inputs", async () => {
    const data1 = new TextEncoder().encode("input a").buffer;
    const data2 = new TextEncoder().encode("input b").buffer;
    const hash1 = await hashFile(data1);
    const hash2 = await hashFile(data2);
    expect(hash1).not.toEqual(hash2);
  });
});
