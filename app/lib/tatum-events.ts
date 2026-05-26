import { suiClient, CONTRACT } from "./sui-client";

export interface CredentialEvent {
  id: {
    txDigest: string;
    eventSeq: string;
  };
  parsedJson: {
    credential_id: string;
    issuer: string;
    recipient: string;
    walrus_blob_id: string;
    credential_type: string;
    issued_at: string;
  };
  timestampMs?: string;
}

export interface RevokeEvent {
  id: {
    txDigest: string;
    eventSeq: string;
  };
  parsedJson: {
    credential_id: string;
    revoked_by: string;
    revoked_at: string;
  };
}

export async function queryIssuedEvents(
  limit: number = 50,
  cursor?: string
): Promise<{ events: CredentialEvent[]; hasNextPage: boolean; nextCursor: string | null }> {
  const eventType = `${CONTRACT.packageId}::${CONTRACT.credentialModule}::CredentialIssued`;

  const result = await suiClient.queryEvents({
    query: { MoveEventType: eventType },
    limit,
    cursor: cursor ? { txDigest: cursor, eventSeq: "0" } : undefined,
    order: "descending",
  });

  return {
    events: result.data as unknown as CredentialEvent[],
    hasNextPage: result.hasNextPage,
    nextCursor: result.nextCursor
      ? (result.nextCursor as any)?.txDigest || null
      : null,
  };
}

export async function queryRevokedEvents(
  limit: number = 50
): Promise<RevokeEvent[]> {
  const eventType = `${CONTRACT.packageId}::${CONTRACT.credentialModule}::CredentialRevoked`;

  const result = await suiClient.queryEvents({
    query: { MoveEventType: eventType },
    limit,
    order: "descending",
  });

  return result.data as unknown as RevokeEvent[];
}

export async function queryIssuerEvents(
  issuerAddress: string,
  limit: number = 20
): Promise<CredentialEvent[]> {
  const eventType = `${CONTRACT.packageId}::${CONTRACT.credentialModule}::CredentialIssued`;

  const result = await suiClient.queryEvents({
    query: { MoveEventType: eventType },
    limit,
    order: "descending",
  });

  const filtered = result.data.filter((e: any) => {
    const parsed = e.parsedJson as CredentialEvent["parsedJson"];
    return parsed?.issuer === issuerAddress;
  });

  return filtered as unknown as CredentialEvent[];
}
