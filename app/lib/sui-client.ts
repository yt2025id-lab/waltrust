import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { JsonRpcHTTPTransport } from "@mysten/sui/jsonRpc";

const TATUM_API_KEY = process.env.TATUM_API_KEY || process.env.NEXT_PUBLIC_TATUM_API_KEY || "";

export const TATUM_ENDPOINTS: Record<string, { url: string; network: "mainnet" | "testnet" | "devnet" }> = {
  mainnet: { url: "https://sui-mainnet.gateway.tatum.io", network: "mainnet" },
  testnet: { url: "https://sui-testnet.gateway.tatum.io", network: "testnet" },
  devnet: { url: "https://sui-devnet.gateway.tatum.io", network: "devnet" },
};

export type SuiNetwork = "mainnet" | "testnet" | "devnet";

export function createTatumSuiClient(
  network: SuiNetwork = "mainnet"
): SuiJsonRpcClient {
  const url = TATUM_ENDPOINTS[network].url;
  const transport = new JsonRpcHTTPTransport({
    url,
    rpc: {
      headers: {
        "x-api-key": TATUM_API_KEY,
      },
    },
  });
  return new SuiJsonRpcClient({ transport, network: network as any });
}

export const network = (process.env.NEXT_PUBLIC_NETWORK || "mainnet") as SuiNetwork;

let _suiClient: SuiJsonRpcClient | null = null;
export function getSuiClient(): SuiJsonRpcClient {
  if (!_suiClient) {
    _suiClient = createTatumSuiClient(network);
  }
  return _suiClient;
}

export const suiClient = getSuiClient();

const rawPackageId = process.env.NEXT_PUBLIC_PACKAGE_ID || "";

export const CONTRACT = {
  packageId: rawPackageId,
  credentialModule: "credential",
  issuerModule: "issuer",
};

export const CREDENTIAL_TYPE = `${CONTRACT.packageId}::${CONTRACT.credentialModule}::Credential`;
export const ISSUER_CAP_TYPE = `${CONTRACT.packageId}::${CONTRACT.credentialModule}::IssuerCap`;
export const ADMIN_CAP_TYPE = `${CONTRACT.packageId}::${CONTRACT.credentialModule}::AdminCap`;
export const ISSUER_REGISTRY_TYPE = `${CONTRACT.packageId}::${CONTRACT.credentialModule}::IssuerRegistry`;

export function validateConfig(): string | null {
  if (!rawPackageId) return "NEXT_PUBLIC_PACKAGE_ID is not configured";
  if (!TATUM_API_KEY) return "TATUM_API_KEY is not configured";
  return null;
}
