import { Transaction } from "@mysten/sui/transactions";
import { suiClient, CONTRACT, CREDENTIAL_TYPE, ISSUER_CAP_TYPE } from "./sui-client";

export interface IssueCredentialParams {
  issuerCapId: string;
  walrusBlobId: string;
  walrusMetadataBlobId: string;
  documentHash: number[];
  credentialType: string;
  title: string;
  recipient: string;
  recipientName: string;
  expiresAt: number;
}

export function buildIssueCredentialTx(params: IssueCredentialParams): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT.packageId}::${CONTRACT.credentialModule}::issue_credential`,
    arguments: [
      tx.object(params.issuerCapId),
      tx.pure.string(params.walrusBlobId),
      tx.pure.string(params.walrusMetadataBlobId),
      tx.pure.vector("u8", params.documentHash),
      tx.pure.string(params.credentialType),
      tx.pure.string(params.title),
      tx.pure.address(params.recipient),
      tx.pure.string(params.recipientName),
      tx.pure.u64(params.expiresAt),
      tx.object("0x6"),
    ],
  });

  return tx;
}

export function buildRevokeCredentialTx(
  issuerCapId: string,
  credentialId: string
): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT.packageId}::${CONTRACT.credentialModule}::revoke_credential`,
    arguments: [
      tx.object(issuerCapId),
      tx.object(credentialId),
      tx.object("0x6"),
    ],
  });

  return tx;
}

export function buildApproveIssuerTx(
  adminCapId: string,
  issuerRegistryId: string,
  issuerAddress: string,
  issuerName: string
): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT.packageId}::${CONTRACT.credentialModule}::approve_issuer`,
    arguments: [
      tx.object(adminCapId),
      tx.object(issuerRegistryId),
      tx.pure.address(issuerAddress),
      tx.pure.string(issuerName),
    ],
  });

  return tx;
}

export function buildDeactivateIssuerTx(
  adminCapId: string,
  issuerRegistryId: string,
  issuerCapId: string
): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT.packageId}::${CONTRACT.credentialModule}::deactivate_issuer`,
    arguments: [
      tx.object(adminCapId),
      tx.object(issuerRegistryId),
      tx.object(issuerCapId),
    ],
  });

  return tx;
}

export function buildReactivateIssuerTx(
  adminCapId: string,
  issuerRegistryId: string,
  issuerCapId: string
): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT.packageId}::${CONTRACT.credentialModule}::reactivate_issuer`,
    arguments: [
      tx.object(adminCapId),
      tx.object(issuerRegistryId),
      tx.object(issuerCapId),
    ],
  });

  return tx;
}

export interface CredentialFields {
  walrus_blob_id: string;
  walrus_metadata_blob_id: string;
  document_hash: string;
  credential_type: string;
  title: string;
  issuer: string;
  issuer_name: string;
  recipient: string;
  recipient_name: string;
  issued_at: string;
  expires_at: string;
  is_valid: boolean;
  extra_fields: Record<string, string>;
}

export interface IssuerCapFields {
  issuer_address: string;
  issuer_name: string;
  is_active: boolean;
}

export async function getCredential(credentialObjectId: string) {
  return suiClient.getObject({
    id: credentialObjectId,
    options: {
      showContent: true,
      showOwner: true,
      showType: true,
    },
  });
}

export async function getIssuerCap(issuerCapId: string): Promise<IssuerCapFields | null> {
  try {
    const obj = await suiClient.getObject({
      id: issuerCapId,
      options: { showContent: true },
    });
    const fields = (obj.data?.content as any)?.fields;
    if (!fields) return null;
    return {
      issuer_address: fields.issuer_address,
      issuer_name: fields.issuer_name,
      is_active: fields.is_active,
    };
  } catch {
    return null;
  }
}

export function parseIssuerCapFields(obj: any): IssuerCapFields | null {
  try {
    const fields = obj.data?.content?.fields;
    if (!fields) return null;
    return {
      issuer_address: fields.issuer_address,
      issuer_name: fields.issuer_name,
      is_active: fields.is_active,
    };
  } catch {
    return null;
  }
}

export async function getWalletCredentials(walletAddress: string) {
  const objects = await suiClient.getOwnedObjects({
    owner: walletAddress,
    filter: {
      StructType: CREDENTIAL_TYPE,
    },
    options: { showContent: true, showType: true },
  });
  return objects.data;
}

export async function getIssuerCaps(walletAddress: string) {
  const objects = await suiClient.getOwnedObjects({
    owner: walletAddress,
    filter: {
      StructType: ISSUER_CAP_TYPE,
    },
    options: { showContent: true, showType: true },
  });
  return objects.data;
}

export function parseCredentialFields(obj: any): CredentialFields | null {
  try {
    const fields = obj.data?.content?.fields;
    if (!fields) return null;

    const extraFields: Record<string, string> = {};
    if (fields.extra_fields?.fields?.contents) {
      for (const entry of fields.extra_fields.fields.contents) {
        if (entry.fields?.key && entry.fields?.value) {
          extraFields[entry.fields.key] = entry.fields.value;
        }
      }
    }

    return {
      walrus_blob_id: fields.walrus_blob_id,
      walrus_metadata_blob_id: fields.walrus_metadata_blob_id,
      document_hash: fields.document_hash,
      credential_type: fields.credential_type,
      title: fields.title,
      issuer: fields.issuer,
      issuer_name: fields.issuer_name,
      recipient: fields.recipient,
      recipient_name: fields.recipient_name,
      issued_at: fields.issued_at,
      expires_at: fields.expires_at,
      is_valid: fields.is_valid,
      extra_fields: extraFields,
    };
  } catch {
    return null;
  }
}

export function checkCredentialValidity(fields: CredentialFields): "valid" | "revoked" | "expired" {
  if (!fields.is_valid) return "revoked";
  const now = Date.now();
  const expiresAt = Number(fields.expires_at);
  if (expiresAt > 0 && now > expiresAt) return "expired";
  return "valid";
}

export function buildVerifyCredentialTx(credentialId: string): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${CONTRACT.packageId}::${CONTRACT.credentialModule}::verify_credential`,
    arguments: [
      tx.object(credentialId),
      tx.object("0x6"),
    ],
  });
  return tx;
}
