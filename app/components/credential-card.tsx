"use client";

import { CredentialFields, checkCredentialValidity } from "@/lib/contract";
import { formatDate, getCredentialTypeLabel, truncateAddress } from "@/lib/utils";
import { getWalrusDocUrl } from "@/lib/walrus";
import { ShieldCheck, ShieldX, Clock, ExternalLink, Copy, FileText } from "lucide-react";
import Link from "next/link";
import { useState, useCallback } from "react";

interface CredentialCardProps {
  credential: CredentialFields;
  objectId: string;
  showActions?: boolean;
}

const STATUS_CARD = {
  valid: {
    icon: <ShieldCheck className="w-5 h-5" />,
    label: "VERIFIED",
    tag: "neo-tag-green",
    shadowClass: "shadow-neo-green",
  },
  revoked: {
    icon: <ShieldX className="w-5 h-5" />,
    label: "REVOKED",
    tag: "neo-tag-pink",
    shadowClass: "shadow-neo-pink",
  },
  expired: {
    icon: <Clock className="w-5 h-5" />,
    label: "EXPIRED",
    tag: "neo-tag-yellow",
    shadowClass: "shadow-neo",
  },
};

export function CredentialCard({ credential, objectId, showActions = true }: CredentialCardProps) {
  const status = checkCredentialValidity(credential);
  const [copied, setCopied] = useState(false);

  const config = STATUS_CARD[status as "valid" | "revoked" | "expired"];

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(objectId);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = objectId;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [objectId]);

  return (
    <div className={`neo-card ${config.shadowClass}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-neo border-[3px] border-neo-border flex items-center justify-center
            bg-neo-bg2 text-neo-text2">
            {config.icon}
          </div>
          <div>
            <span className={config.tag}>{config.label}</span>
            <h3 className="font-display font-700 text-lg mt-1 leading-tight">{credential.title}</h3>
          </div>
        </div>
        <span className="neo-tag-lime text-[9px]">
          {getCredentialTypeLabel(credential.credential_type)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 bg-neo-bg2 p-3 rounded-neo border-[2px] border-neo-border-light mb-4">
        <Detail label="Issuer" value={credential.issuer_name} />
        <Detail label="Recipient" value={credential.recipient_name} />
        <Detail label="Issued" value={formatDate(credential.issued_at)} />
        <Detail label="Expires" value={formatDate(credential.expires_at)} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {showActions && (
          <>
            <Link
              href={`/verify/${objectId}`}
              className="neo-btn-primary text-[10px] !px-3 !py-1.5 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Verify
            </Link>
            <a
              href={getWalrusDocUrl(credential.walrus_blob_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="neo-btn-secondary text-[10px] !px-3 !py-1.5 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Doc
            </a>
          </>
        )}
        <button
          onClick={handleCopy}
          className="neo-btn-secondary text-[10px] !px-3 !py-1.5 flex items-center gap-1.5 ml-auto"
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? "Copied!" : "ID"}
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-neo-text3">{label}</span>
      <p className="font-mono text-xs text-neo-text2 truncate">{value}</p>
    </div>
  );
}
