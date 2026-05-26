"use client";

import { CredentialFields } from "@/lib/contract";
import { formatDate, getCredentialTypeLabel, truncateAddress } from "@/lib/utils";
import { getWalrusDocUrl, fetchFromWalrus } from "@/lib/walrus";
import { ShieldCheck, ShieldX, Clock, Search, ExternalLink, FileText, Download } from "lucide-react";
import { useState, useEffect, useRef } from "react";

type VerifyStatus = "loading" | "valid" | "revoked" | "expired" | "not_found";

interface VerifyResultProps {
  status: VerifyStatus;
  credential: CredentialFields | null;
  objectId: string;
}

const STATUS_STYLES = {
  valid: {
    icon: <ShieldCheck className="w-16 h-16" />,
    label: "VERIFIED",
    desc: "This credential is valid and has not been revoked.",
    cardClass: "neo-card shadow-neo-green p-10 text-center border-t-[6px] border-t-neo-green",
    iconClass: "text-neo-green",
    labelClass: "text-neo-green",
    tag: "neo-tag-green",
    badgeClass: "bg-neo-green/10 border-neo-green/25",
  },
  revoked: {
    icon: <ShieldX className="w-16 h-16" />,
    label: "REVOKED",
    desc: "This credential has been revoked by the issuer.",
    cardClass: "neo-card shadow-neo-pink p-10 text-center border-t-[6px] border-t-neo-pink",
    iconClass: "text-neo-pink",
    labelClass: "text-neo-pink",
    tag: "neo-tag-pink",
    badgeClass: "bg-neo-pink/10 border-neo-pink/25",
  },
  expired: {
    icon: <Clock className="w-16 h-16" />,
    label: "EXPIRED",
    desc: "This credential has passed its expiration date.",
    cardClass: "neo-card shadow-neo p-10 text-center border-t-[6px] border-t-neo-yellow",
    iconClass: "text-neo-yellow",
    labelClass: "text-neo-yellow",
    tag: "neo-tag-yellow",
    badgeClass: "bg-neo-yellow/10 border-neo-yellow/25",
  },
} as const;

export function VerifyResult({ status, credential, objectId }: VerifyResultProps) {
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const docUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const prevUrl = docUrlRef.current;
    if (credential && status === "valid") {
      setLoading(true);
      fetchFromWalrus(credential.walrus_blob_id)
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          docUrlRef.current = url;
          setDocUrl(url);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    return () => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
        docUrlRef.current = null;
      }
    };
  }, [credential, status]);

  if (status === "loading") {
    return (
      <div className="neo-card p-12 text-center shadow-neo">
        <div className="w-20 h-20 mx-auto mb-6 bg-neo-bg2 border-[3px] border-neo-border rounded-neo
          flex items-center justify-center animate-pulse">
          <Search className="w-10 h-10 text-neo-text3" />
        </div>
        <p className="font-mono text-sm font-bold uppercase tracking-wider text-neo-text2">
          Scanning Blockchain...
        </p>
        <p className="font-mono text-xs text-neo-text3 mt-2">via Tatum RPC</p>
        <div className="mt-6 h-2 bg-neo-bg2 rounded-neo border-[2px] border-neo-border overflow-hidden">
          <div className="h-full bg-neo-green rounded-neo animate-[loading_1.5s_ease-in-out_infinite]"
            style={{ width: "60%" }} />
        </div>
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <div className="neo-card shadow-neo-pink p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-neo-pink/10 border-[3px] border-neo-pink rounded-neo
          flex items-center justify-center">
          <Search className="w-10 h-10 text-neo-pink" />
        </div>
        <h3 className="font-display font-800 text-2xl mb-2 text-neo-pink uppercase">Not Found</h3>
        <p className="font-mono text-sm text-neo-text2">
          No credential at this address. Double-check the ID.
        </p>
      </div>
    );
  }

  if (!credential) return null;

  const config = STATUS_STYLES[status as "valid" | "revoked" | "expired"];

  return (
    <div className="space-y-4">
      <div className={config.cardClass}>
        <div className={config.iconClass}>{config.icon}</div>
        <h3 className={`font-display font-800 text-3xl mt-4 tracking-wider ${config.labelClass}`}>
          {config.label}
        </h3>
        <p className="font-mono text-sm text-neo-text2 mt-3">{config.desc}</p>
      </div>

      <div className="neo-card shadow-neo">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b-[3px] border-neo-border">
          <span className="neo-tag-green">ON-CHAIN</span>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-neo-text3">
            Credential Data
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow label="Title" value={credential.title} highlight />
          <DetailRow label="Type" value={getCredentialTypeLabel(credential.credential_type)} />
          <DetailRow label="Issuer" value={credential.issuer_name} highlight />
          <DetailRow label="Issuer Addr" value={truncateAddress(credential.issuer)} mono />
          <DetailRow label="Recipient" value={credential.recipient_name} />
          <DetailRow label="Recipient Addr" value={truncateAddress(credential.recipient)} mono />
          <DetailRow label="Issued" value={formatDate(credential.issued_at)} />
          <DetailRow label="Expires" value={formatDate(credential.expires_at)} />
          <DetailRow
            label="Walrus Doc"
            value={truncateAddress(credential.walrus_blob_id)}
            mono
            link={getWalrusDocUrl(credential.walrus_blob_id)}
          />
          <DetailRow
            label="Walrus Meta"
            value={truncateAddress(credential.walrus_metadata_blob_id)}
            mono
            link={getWalrusDocUrl(credential.walrus_metadata_blob_id)}
          />
        </div>
      </div>

      {status === "valid" && (
        <div className="neo-card shadow-neo-green">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b-[3px] border-neo-border">
            <span className="neo-tag-lime">WALRUS</span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-neo-text3">
              Original Document
            </span>
          </div>
          <p className="font-mono text-xs text-neo-text3 mb-4">
            Retrieved from Walrus decentralized storage — tamper-proof, always available.
          </p>
          {loading ? (
            <div className="h-48 bg-neo-bg2 rounded-neo border-[3px] border-neo-border flex items-center justify-center animate-pulse">
              <FileText className="w-10 h-10 text-neo-text3" />
            </div>
          ) : docUrl ? (
            <div className="space-y-3">
              <iframe
                src={docUrl}
                className="w-full h-96 rounded-neo border-[3px] border-neo-border"
                title="Credential Document"
                sandbox="allow-scripts allow-same-origin"
              />
              <a
                href={docUrl}
                download
                className="neo-btn-primary text-xs flex items-center gap-2 w-fit"
                onError={() => {}}
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          ) : (
            <div className="h-48 bg-neo-bg2 rounded-neo border-[3px] border-neo-border flex items-center justify-center">
              <a
                href={getWalrusDocUrl(credential.walrus_blob_id)}
                target="_blank"
                rel="noopener noreferrer"
                className="neo-btn-primary text-xs flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open from Walrus
              </a>
            </div>
          )}
        </div>
      )}

      <div className="neo-card !p-3 flex items-center justify-between shadow-neo-sm">
        <span className="font-mono text-[10px] text-neo-text3 uppercase tracking-wider">
          Object: {truncateAddress(objectId)}
        </span>
        <a
          href={`https://suiscan.xyz/mainnet/object/${objectId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="neo-btn-primary text-[10px] !px-3 !py-1.5 flex items-center gap-1.5"
        >
          SuiScan <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

function DetailRow({ label, value, highlight, mono, link }: {
  label: string; value: string; highlight?: boolean; mono?: boolean; link?: string;
}) {
  return (
    <div className="p-2 bg-neo-bg2 rounded-neo border-[2px] border-neo-border-light">
      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-neo-text3">{label}</span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer"
          className={`block font-mono text-xs text-neo-green hover:underline mt-0.5 ${mono ? "font-mono" : ""}`}>
          {value} →
        </a>
      ) : (
        <p className={`text-sm mt-0.5 ${highlight ? "font-bold text-neo-text" : "text-neo-text2"} ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      )}
    </div>
  );
}
