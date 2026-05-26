import { NextRequest, NextResponse } from "next/server";
import { getCredential, parseCredentialFields, getWalletCredentials, getIssuerCaps } from "@/lib/contract";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const objectId = searchParams.get("id");
  const owner = searchParams.get("owner");
  const type = searchParams.get("type");

  try {
    if (objectId) {
      const obj = await getCredential(objectId);
      const fields = parseCredentialFields(obj);
      if (!fields) {
        return NextResponse.json({ error: "Credential not found" }, { status: 404 });
      }
      const content = obj.data?.content as { fields?: Record<string, unknown>; type?: string } | undefined;
      const ownerInfo = obj.data?.owner;
      return NextResponse.json({
        objectId,
        fields,
        type: obj.data?.type,
        owner: ownerInfo,
      });
    }

    if (owner && type === "credentials") {
      const objects = await getWalletCredentials(owner);
      const parsed = objects
        .map((obj) => {
          const fields = parseCredentialFields(obj);
          return fields ? { id: obj.data?.objectId, fields } : null;
        })
        .filter(Boolean);
      return NextResponse.json({ credentials: parsed });
    }

    if (owner && type === "issuer_caps") {
      const objects = await getIssuerCaps(owner);
      return NextResponse.json({ caps: objects });
    }

    return NextResponse.json({ error: "Missing query params: id | owner+type" }, { status: 400 });
  } catch (err) {
    console.error("Credential API error:", err);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
}
