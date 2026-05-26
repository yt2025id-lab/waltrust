const WALRUS_PUBLISHER =
  process.env.NEXT_PUBLIC_WALRUS_PUBLISHER ||
  "https://publisher.walrus-mainnet.walrus.space";
const WALRUS_AGGREGATOR =
  process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR ||
  "https://aggregator.walrus-mainnet.walrus.space";
const STORAGE_EPOCHS = 365;

export interface WalrusUploadResult {
  blobId: string;
  suiObjectId: string;
  endEpoch: number;
  isNewlyCreated: boolean;
}

export interface CredentialMetadata {
  title: string;
  credentialType: string;
  issuerName: string;
  recipientName: string;
  issuedAt: string;
  expiresAt: string | null;
  additionalInfo: Record<string, string>;
}

async function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number } = {}): Promise<Response> {
  const { timeout = 15000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...rest, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function uploadToWalrus(
  fileData: Uint8Array | Blob,
  contentType: string = "application/octet-stream"
): Promise<WalrusUploadResult> {
  const body = fileData instanceof Blob ? fileData : new Blob([new Uint8Array(fileData)], { type: contentType });
  const response = await fetchWithTimeout(
    `${WALRUS_PUBLISHER}/v1/blobs?epochs=${STORAGE_EPOCHS}`,
    {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body,
      timeout: 30000,
    }
  );

  if (!response.ok) {
    throw new Error(`Walrus upload failed: ${response.status}`);
  }

  const result = await response.json();

  if (result.newlyCreated) {
    return {
      blobId: result.newlyCreated.blobObject.blobId,
      suiObjectId: result.newlyCreated.blobObject.id,
      endEpoch: result.newlyCreated.blobObject.storage.endEpoch,
      isNewlyCreated: true,
    };
  } else if (result.alreadyCertified) {
    return {
      blobId: result.alreadyCertified.blobId,
      suiObjectId: result.alreadyCertified.id || "",
      endEpoch: result.alreadyCertified.endEpoch,
      isNewlyCreated: false,
    };
  }

  throw new Error("Unexpected Walrus response format");
}

export async function uploadMetadataToWalrus(
  metadata: CredentialMetadata
): Promise<WalrusUploadResult> {
  const jsonBytes = new TextEncoder().encode(JSON.stringify(metadata));
  return uploadToWalrus(jsonBytes, "application/json");
}

export async function fetchFromWalrus(blobId: string): Promise<Blob> {
  const response = await fetchWithTimeout(`${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`, { timeout: 10000 });

  if (!response.ok) {
    throw new Error(`Walrus fetch failed for blob: ${blobId}`);
  }

  return response.blob();
}

export async function fetchMetadataFromWalrus(
  metadataBlobId: string
): Promise<CredentialMetadata> {
  const blob = await fetchFromWalrus(metadataBlobId);
  const text = await blob.text();
  return JSON.parse(text) as CredentialMetadata;
}

export async function hashFile(fileData: ArrayBuffer): Promise<Uint8Array> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", fileData);
  return new Uint8Array(hashBuffer);
}

export function getWalrusDocUrl(blobId: string): string {
  return `${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`;
}
