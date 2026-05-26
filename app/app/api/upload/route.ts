import { NextRequest, NextResponse } from "next/server";
import { uploadToWalrus, uploadMetadataToWalrus, hashFile } from "@/lib/walrus";

const MAGIC_BYTES: Record<string, Uint8Array[]> = {
  "application/pdf": [new Uint8Array([0x25, 0x50, 0x44, 0x46])],
  "image/jpeg": [new Uint8Array([0xFF, 0xD8, 0xFF]), new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]), new Uint8Array([0xFF, 0xD8, 0xFF, 0xE1])],
  "image/png": [new Uint8Array([0x89, 0x50, 0x4E, 0x47])],
  "image/webp": [new Uint8Array([0x52, 0x49, 0x46, 0x46])],
};

function validateFileSignature(bytes: Uint8Array, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return true;
  return signatures.some((sig) => {
    if (bytes.length < sig.length) return false;
    return sig.every((b, i) => bytes[i] === b);
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("document") as File;
    const metadataStr = formData.get("metadata") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PDF, JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    if (!validateFileSignature(fileBytes, file.type)) {
      return NextResponse.json(
        { error: "File content does not match its declared type" },
        { status: 400 }
      );
    }

    const [docResult, metaResult, hash] = await Promise.all([
      uploadToWalrus(fileBytes, file.type),
      metadataStr
        ? uploadMetadataToWalrus(JSON.parse(metadataStr))
        : Promise.resolve(null),
      hashFile(fileBuffer),
    ]);

    return NextResponse.json({
      documentBlobId: docResult.blobId,
      metadataBlobId: metaResult?.blobId || "",
      documentHash: Array.from(hash),
      docEndEpoch: docResult.endEpoch,
      metaEndEpoch: metaResult?.endEpoch || 0,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed", details: String(err) },
      { status: 500 }
    );
  }
}
