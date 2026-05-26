import type { Metadata } from "next";
import { IssueContent } from "@/components/issue-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Issue Credential — WalTrust",
  description: "Issue a new credential. Upload document to Walrus, sign on SUI mainnet.",
};

export default function IssuePage() {
  return <IssueContent />;
}
