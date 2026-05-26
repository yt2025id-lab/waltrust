import type { Metadata } from "next";
import { VerifyContent } from "@/components/verify-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Verify ${params.id.slice(0, 8)}... — WalTrust`,
    description: "Verify a credential on-chain via Tatum RPC. Instant result.",
  };
}

export default function VerifyPage({ params }: { params: { id: string } }) {
  return <VerifyContent id={params.id} />;
}
