"use client";

import { useEffect, useState } from "react";
import { getCredential, parseCredentialFields, CredentialFields, checkCredentialValidity } from "@/lib/contract";
import { VerifyResult } from "@/components/verify-result";

type VerifyStatus = "loading" | "valid" | "revoked" | "expired" | "not_found";

export function VerifyContent({ id }: { id: string }) {
  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [credential, setCredential] = useState<CredentialFields | null>(null);

  useEffect(() => {
    if (!id) { setStatus("not_found"); return; }
    let cancelled = false;
    getCredential(id)
      .then((obj) => {
        if (cancelled) return;
        const fields = parseCredentialFields(obj);
        if (!fields) { setStatus("not_found"); return; }
        setCredential(fields);
        setStatus(checkCredentialValidity(fields));
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("not_found");
      });
    return () => { cancelled = true; };
  }, [id]);

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="neo-section-label">01 // Verify</div>
      <h1 className="font-display font-800 text-3xl sm:text-4xl tracking-tight uppercase mb-2">
        Verify <span className="text-neo-green">Credential</span>
      </h1>
      <p className="font-mono text-xs text-neo-text3 mb-8 uppercase tracking-wider">
        ID: {id?.slice(0, 12)}...{id?.slice(-8)}
      </p>
      <VerifyResult status={status} credential={credential} objectId={id} />
    </section>
  );
}
