"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { ConnectButton } from "@mysten/dapp-kit";
import { useEffect, useState, useRef } from "react";
import { getWalletCredentials, parseCredentialFields, CredentialFields } from "@/lib/contract";
import { CredentialCard } from "@/components/credential-card";
import { Shield, Wallet } from "lucide-react";

export function WalletContent() {
  const account = useCurrentAccount();
  const [credentials, setCredentials] = useState<{ id: string; fields: CredentialFields }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account?.address) {
      setLoading(true);
      getWalletCredentials(account.address)
        .then((objects) => {
          const parsed = objects
            .map((obj: any) => {
              const fields = parseCredentialFields(obj);
              return fields ? { id: obj.data?.objectId || "", fields } : null;
            })
            .filter((x: any): x is { id: string; fields: CredentialFields } => x !== null);
          setCredentials(parsed);
        })
        .catch((err) => {
          console.error("Failed to load credentials:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [account?.address]);

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="neo-card shadow-neo-pink inline-block p-12">
          <Wallet className="w-16 h-16 text-neo-pink mx-auto mb-4" strokeWidth={3} />
          <h1 className="font-display font-800 text-3xl mb-3 uppercase">My Credentials</h1>
          <p className="font-mono text-sm text-neo-text2 mb-6">Connect wallet to view credentials</p>
          <div className="[&_button]:!bg-neo-green [&_button]:!border-[3px] [&_button]:!border-neo-border
            [&_button]:!rounded-neo [&_button]:!shadow-neo [&_button]:!font-mono [&_button]:!text-sm
            [&_button]:!font-bold [&_button]:!uppercase [&_button]:!tracking-wider">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="neo-section-label">03 // Wallet</div>
      <h1 className="font-display font-800 text-3xl sm:text-4xl tracking-tight uppercase mb-2">
        My <span className="text-neo-green">Credentials</span>
      </h1>
      <p className="font-mono text-sm text-neo-text2 mb-8">
        All credentials owned by your wallet. Share links with employers.
      </p>

      {loading && (
        <div className="neo-card p-12 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-neo-green rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-neo-green rounded-full animate-bounce [animation-delay:0.1s]" />
            <div className="w-3 h-3 bg-neo-green rounded-full animate-bounce [animation-delay:0.2s]" />
          </div>
          <p className="font-mono text-xs text-neo-text3 mt-4 uppercase tracking-wider">Loading via Tatum RPC...</p>
        </div>
      )}

      {!loading && credentials.length === 0 && (
        <div className="neo-card shadow-neo-pink p-12 text-center">
          <Shield className="w-16 h-16 text-neo-text3 mx-auto mb-4" strokeWidth={3} />
          <h3 className="font-display font-800 text-2xl mb-2 uppercase">No Credentials</h3>
          <p className="font-mono text-sm text-neo-text2">
            Ask an issuer to send a credential to your address.
          </p>
        </div>
      )}

      {!loading && credentials.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {credentials.map((cred) => (
            <CredentialCard key={cred.id} credential={cred.fields} objectId={cred.id} />
          ))}
        </div>
      )}
    </section>
  );
}
