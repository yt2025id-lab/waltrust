"use client";

import { useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { buildRevokeCredentialTx, getCredential, parseCredentialFields } from "@/lib/contract";
import { ConnectButton } from "@mysten/dapp-kit";
import { isValidSuiAddress } from "@/lib/utils";
import { Shield, ShieldX, Loader2, Check, AlertCircle, Search, ArrowRight } from "lucide-react";

export function RevokeContent() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [credentialId, setCredentialId] = useState("");
  const [issuerCapId, setIssuerCapId] = useState("");
  const [step, setStep] = useState<"form" | "confirm" | "signing" | "success" | "error">("form");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ digest: string } | null>(null);
  const [credentialInfo, setCredentialInfo] = useState<string>("");
  const [lookupError, setLookupError] = useState("");

  const handleLookup = async () => {
    if (!credentialId) return;
    setLookupError("");
    try {
      const obj = await getCredential(credentialId);
      const fields = parseCredentialFields(obj);
      const title = fields?.title || "Unknown";
      setCredentialInfo(title);
      setStep("confirm");
    } catch {
      setCredentialInfo("Credential not found");
      setLookupError("Could not find credential at this address. Check the ID.");
      setStep("confirm");
    }
  };

  const handleRevoke = async () => {
    if (!account || !credentialId || !issuerCapId) return;
    try {
      setStep("signing");
      setError("");
      const tx = buildRevokeCredentialTx(issuerCapId, credentialId);
      const execResult = await signAndExecute({ transaction: tx });
      setResult({ digest: execResult.digest });
      setStep("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Revoke failed";
      setError(message);
      console.error("Revoke error:", err);
      setStep("error");
    }
  };

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="neo-card shadow-neo-pink inline-block p-12">
          <ShieldX className="w-16 h-16 text-neo-pink mx-auto mb-4" strokeWidth={3} />
          <h1 className="font-display font-800 text-3xl mb-3 uppercase">Revoke Credential</h1>
          <p className="font-mono text-sm text-neo-text2 mb-6">Connect wallet to revoke</p>
          <div className="[&_button]:!bg-neo-pink [&_button]:!border-[3px] [&_button]:!border-neo-border
            [&_button]:!rounded-neo [&_button]:!shadow-neo [&_button]:!font-mono [&_button]:!text-sm
            [&_button]:!font-bold [&_button]:!uppercase [&_button]:!tracking-wider">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  const isCredentialIdValid = credentialId === "" || isValidSuiAddress(credentialId);
  const isCapIdValid = issuerCapId === "" || isValidSuiAddress(issuerCapId);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="neo-section-label">04 // Revoke</div>
      <h1 className="font-display font-800 text-3xl sm:text-4xl tracking-tight uppercase mb-2">
        Revoke <span className="text-neo-pink">Credential</span>
      </h1>
      <p className="font-mono text-sm text-neo-text2 mb-8">
        One transaction. Instant. No admin needed.
      </p>

      {step === "form" && (
        <div className="space-y-6">
          <div className="neo-card shadow-neo-pink">
            <div className="space-y-5">
              <div>
                <label className="neo-label">Credential ID</label>
                <input type="text" placeholder="0x... credential object ID"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  className={`neo-input font-mono text-sm ${!isCredentialIdValid && credentialId ? "border-neo-pink" : ""}`} />
                {!isCredentialIdValid && credentialId && (
                  <p className="font-mono text-xs text-neo-pink mt-1">Invalid address format</p>
                )}
              </div>
              <div>
                <label className="neo-label">Your Issuer Cap ID</label>
                <input type="text" placeholder="0x... your IssuerCap object"
                  value={issuerCapId}
                  onChange={(e) => setIssuerCapId(e.target.value)}
                  className={`neo-input font-mono text-sm ${!isCapIdValid && issuerCapId ? "border-neo-pink" : ""}`} />
                {!isCapIdValid && issuerCapId && (
                  <p className="font-mono text-xs text-neo-pink mt-1">Invalid address format</p>
                )}
              </div>
              <button onClick={handleLookup}
                disabled={!credentialId || !issuerCapId || !isCredentialIdValid || !isCapIdValid}
                className="neo-btn-pink w-full flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Lookup & Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-6">
          <div className="neo-card shadow-neo-pink p-8 text-center">
            <ShieldX className="w-16 h-16 text-neo-pink mx-auto mb-4" strokeWidth={3} />
            <h3 className="font-display font-800 text-2xl text-neo-pink uppercase mb-2">
              Confirm Revocation
            </h3>
            <p className="font-mono text-sm text-neo-text2 mb-2">
              Credential: <span className="text-neo-text font-bold">{credentialInfo}</span>
            </p>
            <p className="font-mono text-xs text-neo-text3 mb-6 break-all">
              ID: {credentialId}
            </p>
            {lookupError && (
              <p className="font-mono text-xs text-neo-pink mb-4 bg-neo-pink/10 p-2 rounded-neo border border-neo-pink/25">
                ⚠ {lookupError}
              </p>
            )}
            <p className="font-mono text-sm text-neo-pink mb-6 font-bold uppercase">
              ⚠ This action cannot be undone
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setStep("form")}
                className="neo-btn-secondary">
                Cancel
              </button>
              <button onClick={handleRevoke}
                className="neo-btn-pink flex items-center gap-2">
                <ShieldX className="w-4 h-4" />
                Confirm Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "signing" && (
        <div className="neo-card shadow-neo-pink p-12 text-center">
          <Loader2 className="w-16 h-16 text-neo-pink mx-auto animate-spin mb-6" strokeWidth={3} />
          <h3 className="font-display font-800 text-2xl text-neo-pink uppercase mb-2">Sign Transaction</h3>
          <p className="font-mono text-sm text-neo-text2">Approve revocation in your wallet</p>
        </div>
      )}

      {step === "success" && result && (
        <div className="neo-card p-12 text-center border-t-[6px] border-t-neo-green">
          <div className="w-20 h-20 mx-auto mb-6 bg-neo-green border-[3px] border-neo-border rounded-neo
            flex items-center justify-center shadow-neo">
            <Check className="w-10 h-10 text-neo-text" strokeWidth={3} />
          </div>
          <h3 className="font-display font-800 text-3xl text-neo-green uppercase mb-2">Revoked!</h3>
          <p className="font-mono text-sm text-neo-text2 mb-6">Credential marked as revoked on-chain.</p>
          <div className="bg-neo-bg2 rounded-neo p-4 border-[2px] border-neo-border text-left mb-6">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-bold uppercase text-neo-text3">TX Digest</span>
              <span className="font-mono text-xs text-neo-green truncate max-w-[240px]">{result.digest}</span>
            </div>
          </div>
          <a href={`https://suiscan.xyz/mainnet/txblock/${result.digest}`}
            target="_blank" rel="noopener noreferrer"
            className="neo-btn-primary inline-flex items-center gap-2">
            View on SuiScan <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {step === "error" && (
        <div className="neo-card shadow-neo-pink p-12 text-center">
          <AlertCircle className="w-16 h-16 text-neo-pink mx-auto mb-4" strokeWidth={3} />
          <h3 className="font-display font-800 text-2xl text-neo-pink uppercase mb-2">Error</h3>
          <p className="font-mono text-sm text-neo-text2 mb-6">{error}</p>
          <button onClick={() => setStep("form")} className="neo-btn-pink">Try Again</button>
        </div>
      )}
    </div>
  );
}
