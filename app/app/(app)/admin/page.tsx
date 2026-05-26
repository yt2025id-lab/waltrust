import type { Metadata } from "next";
import { AdminContent } from "@/components/admin-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard — WalTrust",
  description: "Approve and deactivate issuers. Manage the credential registry.",
};

export default function AdminPage() {
  return <AdminContent />;
}
