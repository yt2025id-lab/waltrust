import type { Metadata } from "next";
import { WalletContent } from "@/components/wallet-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Credentials — WalTrust",
  description: "View all credentials owned by your SUI wallet.",
};

export default function WalletPage() {
  return <WalletContent />;
}
