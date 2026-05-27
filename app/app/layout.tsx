import type { Metadata } from "next";
import "./globals.css";
import { spaceGrotesk, spaceMono, syne } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "WalTrust — Decentralized Credential Verification",
  description:
    "Verify credentials trustlessly. Documents on Walrus, attestations on SUI, powered by Tatum RPC.",
  keywords: ["WalTrust", "SUI", "Walrus", "Tatum", "credential verification", "Web3"],
  icons: {
    icon: "/favicon.svg",
    apple: "/waltrust-logo.svg",
  },
  openGraph: {
    title: "WalTrust — Decentralized Credential Verification",
    description: "Verify credentials trustlessly on SUI + Walrus",
    type: "website",
    images: ["/waltrust-logo.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable} ${syne.variable}`}>
      <body className="font-body bg-neo-bg text-neo-text min-h-screen antialiased noise-overlay">
        {children}
      </body>
    </html>
  );
}
