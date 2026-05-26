"use client";

import { useRef } from "react";
import { useState } from "react";
import { Shield, Search, ArrowRight, FileCheck, Database, Zap, Star, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Marquee, MarqueeItem } from "@/components/marquee";

export function HomeContent() {
  const [verifyId, setVerifyId] = useState("");

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden border-b-[3px] border-neo-border">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neo-green border-[3px] border-neo-border rounded-neo
          -translate-y-1/2 translate-x-1/2 rotate-12 opacity-20" />
        <div className="absolute bottom-12 left-8 w-6 h-6 bg-neo-pink border-[2px] border-neo-border rounded-full opacity-30" />
        <div className="absolute top-32 right-[30%] w-4 h-4 bg-neo-yellow border-[2px] border-neo-border rotate-45 opacity-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative">
          <div className="neo-tag-green inline-flex mb-6">
            <Star className="w-3 h-3 mr-1.5" />
            Tatum × Walrus Hackathon 2026
          </div>

          <h1 className="font-display font-800 text-5xl sm:text-7xl lg:text-[6rem]
            leading-[0.95] tracking-tight mb-5 max-w-4xl">
            Verify Trust,
            <br />
            <span className="text-neo-green inline-block"
              style={{ textShadow: "3px 3px 0px #00B86E" }}>
              Not Promises
            </span>
          </h1>

          <p className="font-mono text-base sm:text-lg text-neo-text2 max-w-xl mb-10 leading-relaxed">
            Credentials stored on <span className="text-neo-green font-bold">Walrus</span>,
            verified on-chain via <span className="text-neo-green font-bold">SUI</span>,
            powered by <span className="text-neo-green font-bold">Tatum RPC</span>.
            <br />Instant. Trustless. Unforgeable.
          </p>

          <div className="max-w-xl">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neo-text3" />
                <input
                  type="text"
                  placeholder="Paste credential ID here..."
                  value={verifyId}
                  onChange={(e) => setVerifyId(e.target.value)}
                  className="neo-input pl-11 text-sm"
                />
              </div>
              <Link
                href={verifyId ? `/verify/${verifyId}` : "#"}
                className={`neo-btn-primary flex items-center gap-2 whitespace-nowrap ${
                  !verifyId ? "opacity-40 pointer-events-none" : ""
                }`}
              >
                Verify
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="flex gap-6 sm:gap-10 mt-12 flex-wrap">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-800 text-3xl sm:text-4xl text-neo-green">&lt;</span>
                <span className="font-display font-800 text-3xl sm:text-4xl text-neo-green">3s</span>
              </div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-neo-text3">Verify Time</span>
            </div>
            <div>
              <div className="flex items-baseline gap-0.5">
                <span className="font-display font-800 text-3xl sm:text-4xl text-neo-green">$</span>
                <span className="font-display font-800 text-3xl sm:text-4xl text-neo-green">0.01</span>
              </div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-neo-text3">Per Verify</span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-800 text-3xl sm:text-4xl text-neo-green">365</span>
                <span className="font-display font-800 text-3xl sm:text-4xl text-neo-green">d</span>
              </div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-neo-text3">Walrus Storage</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MARQUEE 1 ===== */}
      <div className="border-b-[3px] border-neo-border bg-neo-text py-3 overflow-hidden">
        <Marquee speed={50}>
          <MarqueeItem separator="→" separatorClassName="text-neo-green">
            <span className="font-mono text-sm font-bold text-neo-green uppercase tracking-wider">Walrus Storage</span>
          </MarqueeItem>
          <MarqueeItem separator="◆" separatorClassName="text-neo-lime">
            <span className="font-mono text-sm font-bold text-neo-lime uppercase tracking-wider">SUI Mainnet</span>
          </MarqueeItem>
          <MarqueeItem separator="→" separatorClassName="text-neo-pink">
            <span className="font-mono text-sm font-bold text-neo-pink uppercase tracking-wider">Tatum RPC</span>
          </MarqueeItem>
          <MarqueeItem separator="◆" separatorClassName="text-neo-yellow">
            <span className="font-mono text-sm font-bold text-neo-yellow uppercase tracking-wider">Move Contract</span>
          </MarqueeItem>
          <MarqueeItem separator="→" separatorClassName="text-neo-green">
            <span className="font-mono text-sm font-bold text-neo-green uppercase tracking-wider">Credential NFT</span>
          </MarqueeItem>
          <MarqueeItem separator="◆" separatorClassName="text-neo-lime">
            <span className="font-mono text-sm font-bold text-neo-lime uppercase tracking-wider">Instant Verify</span>
          </MarqueeItem>
        </Marquee>
      </div>

      {/* ===== HOW IT WORKS ===== */}
      <section className="border-b-[3px] border-neo-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="neo-section-label">How It Works</div>
          <h2 className="font-display font-800 text-3xl sm:text-4xl tracking-tight mb-12">
            Three roles.{" "}
            <span className="text-neo-green">One trust layer.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <RoleCard
              tag="01"
              icon={<FileCheck className="w-6 h-6" />}
              title="ISSUER"
              titleHighlight="Issue"
              desc="Universities & certification bodies issue credentials. Documents uploaded to Walrus, attested on SUI."
              steps={["Upload document to Walrus", "Sign & issue on-chain", "Revoke if needed (1 tx)"]}
              accent="green"
            />
            <RoleCard
              tag="02"
              icon={<Shield className="w-6 h-6" />}
              title="HOLDER"
              titleHighlight="Own"
              desc="Professionals own their credentials in their wallet. Share a link — employer verifies in seconds."
              steps={["Receive credential in wallet", "Copy verification link", "Control who sees what"]}
              accent="pink"
            />
            <RoleCard
              tag="03"
              icon={<Search className="w-6 h-6" />}
              title="VERIFIER"
              titleHighlight="Verify"
              desc="Employers & HR paste a credential ID. Instant on-chain check + document preview from Walrus."
              steps={["Paste credential ID", "Instant on-chain check", "View document from Walrus"]}
              accent="yellow"
            />
          </div>
        </div>
      </section>

      {/* ===== MARQUEE 2 ===== */}
      <div className="border-b-[3px] border-neo-border bg-neo-green py-3 overflow-hidden">
        <Marquee speed={60} direction="right">
          <MarqueeItem separator="★" separatorClassName="text-neo-text">
            <span className="font-mono text-sm font-bold text-neo-text uppercase tracking-wider">Decentralized</span>
          </MarqueeItem>
          <MarqueeItem separator="★" separatorClassName="text-neo-text">
            <span className="font-mono text-sm font-bold text-neo-text uppercase tracking-wider">Tamper-Proof</span>
          </MarqueeItem>
          <MarqueeItem separator="★" separatorClassName="text-neo-text">
            <span className="font-mono text-sm font-bold text-neo-text uppercase tracking-wider">Instant Verify</span>
          </MarqueeItem>
          <MarqueeItem separator="★" separatorClassName="text-neo-text">
            <span className="font-mono text-sm font-bold text-neo-text uppercase tracking-wider">On-Chain</span>
          </MarqueeItem>
        </Marquee>
      </div>

      {/* ===== TECH STACK ===== */}
      <section className="border-b-[3px] border-neo-border dot-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="neo-section-label">Tech Stack</div>
          <h2 className="font-display font-800 text-3xl sm:text-4xl tracking-tight mb-12">
            Built for the{" "}
            <span className="glitch-text" data-text="real world">real world</span>.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StackCard
              icon={<Database className="w-6 h-6" />}
              name="Walrus Storage"
              desc="Documents & metadata stored as blobs. Content-addressed, tamper-proof, 365-day epochs."
              accent="green"
              items={["2 Blobs per credential", "PDF + JSON metadata", "Blob IDs on-chain"]}
            />
            <StackCard
              icon={<Zap className="w-6 h-6" />}
              name="SUI + Tatum RPC"
              desc="On-chain attestations via Move smart contracts. ALL queries via Tatum enterprise RPC."
              accent="pink"
              items={["Move smart contract", "sui-mainnet.gateway.tatum.io", "x-api-key auth"]}
            />
            <StackCard
              icon={<FileCheck className="w-6 h-6" />}
              name="Move Contracts"
              desc="Issue, verify, revoke — all on mainnet. Admin-controlled issuer registry with capability pattern."
              accent="yellow"
              items={["AdminCap → IssuerCap", "CredentialIssued events", "1-tx revocation"]}
            />
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="border-b-[3px] border-neo-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="neo-card-green inline-block mb-8 p-8 sm:p-12">
            <h2 className="font-display font-800 text-3xl sm:text-5xl mb-3 tracking-tight">
              Start Verifying
            </h2>
            <p className="font-mono text-sm text-neo-text2 max-w-md mx-auto mb-8">
              Deployed on SUI Mainnet. Documents on Walrus. RPC by Tatum.
              <br />Built for the Tatum × Walrus Hackathon 2026.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/issue" className="neo-btn-primary flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Issue Credential
              </Link>
              <Link href="/wallet" className="neo-btn-secondary flex items-center gap-2">
                <Shield className="w-4 h-4" />
                My Wallet
              </Link>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6 flex-wrap">
            <a
              href="https://tatum.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-bold text-neo-text3 hover:text-neo-green
                uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              Powered by Tatum <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://docs.wal.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-bold text-neo-text3 hover:text-neo-green
                uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              Walrus Docs <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://sui.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-bold text-neo-text3 hover:text-neo-green
                uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              SUI Network <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-neo-text py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-mono text-xs text-neo-green/60 uppercase tracking-widest">
            WalTrust · 2026 · SUI Move · Walrus · Tatum RPC · Next.js
          </p>
        </div>
      </footer>
    </>
  );
}

/* ===== SUB-COMPONENTS ===== */

function RoleCard({ tag, icon, title, titleHighlight, desc, steps, accent }: {
  tag: string; icon: React.ReactNode; title: string; titleHighlight: string;
  desc: string; steps: string[]; accent: string;
}) {
  const borderColor = accent === "green" ? "border-t-neo-green" : accent === "pink" ? "border-t-neo-pink" : "border-t-neo-yellow";
  const shadowColor = accent === "green" ? "shadow-neo-green" : accent === "pink" ? "shadow-neo-pink" : "shadow-neo";
  const accentBg = accent === "green" ? "bg-neo-green" : accent === "pink" ? "bg-neo-pink" : "bg-neo-yellow";
  const accentText = accent === "pink" ? "text-white" : "text-neo-text";

  return (
    <div className={`neo-card ${shadowColor} border-t-[6px] ${borderColor}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className={`font-mono text-[10px] font-bold ${accentBg} ${accentText} px-2 py-0.5 border-[2px] border-neo-border rounded-neo`}>
          {tag}
        </span>
        <div className={`${accent === "green" ? "text-neo-green" : accent === "pink" ? "text-neo-pink" : "text-neo-yellow"}`}>
          {icon}
        </div>
      </div>
      <h3 className="font-display font-800 text-2xl mb-1 uppercase tracking-tight">
        <span className="text-neo-text3 font-700">{title.slice(0, title.indexOf(titleHighlight))}</span>
        <span className={accent === "green" ? "text-neo-green" : accent === "pink" ? "text-neo-pink" : "text-neo-yellow"}>
          {titleHighlight}
        </span>
      </h3>
      <p className="font-mono text-xs text-neo-text2 mb-4 leading-relaxed">{desc}</p>
      <ul className="space-y-2">
        {steps.map((step, i) => (
          <li key={i} className="font-mono text-xs text-neo-text flex items-start gap-2">
            <span className="bg-neo-green text-neo-text w-5 h-5 flex items-center justify-center
              border-[2px] border-neo-border rounded-neo text-[9px] font-bold shrink-0 mt-0.5">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StackCard({ icon, name, desc, accent, items }: {
  icon: React.ReactNode; name: string; desc: string; accent: string; items: string[];
}) {
  const shadowColor = accent === "green" ? "shadow-neo-green" : accent === "pink" ? "shadow-neo-pink" : "shadow-neo";
  const accentColor = accent === "green" ? "text-neo-green" : accent === "pink" ? "text-neo-pink" : "text-neo-yellow";
  const accentBg = accent === "green" ? "bg-neo-green" : accent === "pink" ? "bg-neo-pink" : "bg-neo-yellow";

  return (
    <div className={`neo-card ${shadowColor}`}>
      <div className={`w-12 h-12 ${accentBg} border-[3px] border-neo-border rounded-neo
        flex items-center justify-center mb-4 shadow-neo-sm
        ${accent === "pink" ? "text-white" : "text-neo-text"}`}>
        {icon}
      </div>
      <h3 className="font-display font-700 text-xl mb-2">{name}</h3>
      <p className="font-mono text-xs text-neo-text2 mb-4 leading-relaxed">{desc}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className={`font-mono text-xs ${accentColor} flex items-center gap-2`}>
            <span className="w-1.5 h-1.5 bg-current rounded-full shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
