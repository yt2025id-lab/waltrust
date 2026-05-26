export const WALTRUST_CONSTANTS = {
  APP_NAME: "WalTrust",
  APP_DESCRIPTION: "Decentralized Credential Verification on SUI",
  HACKATHON: "Tatum × Walrus Hackathon 2026",
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_FILE_TYPES: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
  CREDENTIAL_TYPES: [
    { value: "degree", label: "Degree / Ijazah" },
    { value: "certificate", label: "Certificate / Sertifikasi" },
    { value: "work_experience", label: "Work Experience" },
    { value: "license", label: "Professional License" },
    { value: "achievement", label: "Achievement / Award" },
  ],
} as const;

export function formatDate(timestamp: string | number): string {
  const ts = typeof timestamp === "string" ? Number(timestamp) : timestamp;
  if (ts === 0) return "No Expiry";
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getCredentialTypeLabel(type: string): string {
  const found = WALTRUST_CONSTANTS.CREDENTIAL_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
}

export function isValidSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}
