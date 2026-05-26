import { NextRequest, NextResponse } from "next/server";
import { getCredential, parseCredentialFields, checkCredentialValidity } from "@/lib/contract";
import { fetchMetadataFromWalrus, fetchFromWalrus } from "@/lib/walrus";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const objectId = searchParams.get("id");

  if (!objectId) {
    return NextResponse.json({ error: "Missing credential ID" }, { status: 400 });
  }

  try {
    const obj = await getCredential(objectId);
    const fields = parseCredentialFields(obj);

    if (!fields) {
      return NextResponse.json({ valid: false, status: "not_found" }, { status: 404 });
    }

    const status = checkCredentialValidity(fields);

    let metadata = null;
    try {
      metadata = await fetchMetadataFromWalrus(fields.walrus_metadata_blob_id);
    } catch {}

    return NextResponse.json({
      valid: status === "valid",
      status,
      credential: fields,
      metadata,
      walrusDocUrl: `https://aggregator.walrus-mainnet.walrus.space/v1/blobs/${fields.walrus_blob_id}`,
      suiscanUrl: `https://suiscan.xyz/mainnet/object/${objectId}`,
    });
  } catch (err) {
    console.error("Verify API error:", err);
    return NextResponse.json({ valid: false, status: "error", error: String(err) }, { status: 500 });
  }
}
