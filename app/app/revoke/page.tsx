import type { Metadata } from "next";
import { RevokeContent } from "@/components/revoke-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Revoke Credential — WalTrust",
  description: "Revoke a credential on SUI mainnet. One transaction.",
};

export default function RevokePage() {
  return <RevokeContent />;
}
