"use client";

import { useState, useEffect } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { uploadToWalrus, uploadMetadataToWalrus, hashFile } from "@/lib/walrus";
import { buildIssueCredentialTx, getIssuerCap } from "@/lib/contract";
import { suiClient } from "@/lib/sui-client";
import { WALTRUST_CONSTANTS, isValidSuiAddress } from "@/lib/utils";
import { ConnectWallet } from "@/components/connect-wallet";
import { FileUp, Check, Loader2, AlertCircle, Shield, ArrowRight, ExternalLink } from "lucide-react";

type IssueStep = "form" | "uploading" | "signing" | "success" | "error";

export function IssueContent() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [step, setStep] = useState<IssueStep>("form");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ credentialId: string; digest: string } | null>(null);

  const [form, setForm] = useState({
    issuerCapId: "",
    credentialType: "degree",
    title: "",
    recipient: "",
    recipientName: "",
    expiresAt: "",
  });
  const [issuerName, setIssuerName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!form.issuerCapId || !isValidSuiAddress(form.issuerCapId)) {
      setIssuerName("");
      return;
    }
    getIssuerCap(form.issuerCapId).then((cap) => {
      if (cap) setIssuerName(cap.issuer_name);
    });
  }, [form.issuerCapId]);

  const handleIssue = async () => {
    if (!account || !file) return;
    try {
      setStep("uploading");
      setError("");
      const fileBuffer = await file.arrayBuffer();
      const fileBytes = new Uint8Array(fileBuffer);
      const metadata = {
        title: form.title,
        credentialType: form.credentialType,
        issuerName: issuerName || "Verified Issuer",
        recipientName: form.recipientName,
        issuedAt: new Date().toISOString(),
        expiresAt: form.expiresAt || null,
        additionalInfo: {},
      };
      const [docResult, metaResult, hash] = await Promise.all([
        uploadToWalrus(fileBytes, file.type),
        uploadMetadataToWalrus(metadata),
        hashFile(fileBuffer),
      ]);
      setStep("signing");
      const tx = buildIssueCredentialTx({
        issuerCapId: form.issuerCapId,
        walrusBlobId: docResult.blobId,
        walrusMetadataBlobId: metaResult.blobId,
        documentHash: Array.from(hash),
        credentialType: form.credentialType,
        title: form.title,
        recipient: form.recipient,
        recipientName: form.recipientName,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).getTime() : 0,
      });
      const execResult = await signAndExecute({ transaction: tx });
      const txDigest = execResult.digest;
      let credentialId = txDigest;
      try {
        const txDetails: any = await suiClient.getTransactionBlock({
          digest: txDigest,
          options: { showEffects: true, showInput: false },
        });
        const created = txDetails?.effects?.created;
        if (created && created.length > 0) {
          credentialId = created[0].reference.objectId;
        }
      } catch {
        // fallback: use tx digest as reference
      }
      setResult({ credentialId, digest: txDigest });
      setStep("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      setError(message);
      console.error("Issue error:", err);
      setStep("error");
    }
  };

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="neo-card shadow-neo-pink inline-block p-12">
          <Shield className="w-16 h-16 text-neo-pink mx-auto mb-4" strokeWidth={3} />
          <h1 className="font-display font-800 text-3xl mb-3 uppercase">Issuer Dashboard</h1>
          <p className="font-mono text-sm text-neo-text2 mb-6">Connect wallet to issue credentials</p>
          <ConnectWallet />
        </div>
      </div>
    );
  }

  const isAddressValid = form.recipient === "" || isValidSuiAddress(form.recipient);
  const isCapIdValid = form.issuerCapId === "" || isValidSuiAddress(form.issuerCapId);

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="neo-section-label">02 // Issuer</div>
      <h1 className="font-display font-800 text-3xl sm:text-4xl tracking-tight uppercase mb-2">
        Issue <span className="text-neo-green">Credential</span>
      </h1>
      <p className="font-mono text-sm text-neo-text2 mb-8">
        Upload doc → Walrus storage → sign on-chain → done.
      </p>

      {step === "form" && (
        <div className="space-y-6">
          <div className="neo-card shadow-neo-green">
            <span className="neo-tag-green mb-4 inline-block">Required</span>

            <div className="space-y-5">
              <div>
                <label className="neo-label">Issuer Capability ID</label>
                <input type="text" placeholder="0x... your IssuerCap object"
                  value={form.issuerCapId} onChange={(e) => setForm({ ...form, issuerCapId: e.target.value })}
                  className={`neo-input font-mono text-sm ${!isCapIdValid && form.issuerCapId ? "border-neo-pink" : ""}`} />
                {!isCapIdValid && form.issuerCapId && (
                  <p className="font-mono text-xs text-neo-pink mt-1">Invalid address format (must be 0x + 64 hex chars)</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="neo-label">Type</label>
                  <select value={form.credentialType}
                    onChange={(e) => setForm({ ...form, credentialType: e.target.value })}
                    className="neo-select">
                    {WALTRUST_CONSTANTS.CREDENTIAL_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="neo-label">Title</label>
                  <input type="text" placeholder="e.g., S1 Teknik Informatika"
                    value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="neo-input" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="neo-label">Recipient Address</label>
                  <input type="text" placeholder="0x..."
                    value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                    className={`neo-input font-mono text-sm ${!isAddressValid ? "border-neo-pink" : ""}`} />
                  {!isAddressValid && (
                    <p className="font-mono text-xs text-neo-pink mt-1">Invalid address format (must be 0x + 64 hex chars)</p>
                  )}
                </div>
                <div>
                  <label className="neo-label">Recipient Name</label>
                  <input type="text" placeholder="John Doe"
                    value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                    className="neo-input" />
                </div>
              </div>

              <div>
                <label className="neo-label">Expiry Date <span className="text-neo-text3 normal-case">(optional)</span></label>
                <input type="date" value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="neo-input" />
              </div>

              <div>
                <label className="neo-label">Document</label>
                <div className="mt-1 border-[3px] border-dashed border-neo-border rounded-neo p-10 text-center
                  hover:border-neo-green hover:bg-neo-green/5 transition-all cursor-pointer relative
                  group">
                  <input type="file"
                    accept={WALTRUST_CONSTANTS.ALLOWED_FILE_TYPES.join(",")}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <FileUp className="w-10 h-10 text-neo-text3 mx-auto mb-3
                    group-hover:text-neo-green group-hover:scale-110 transition-all" />
                  {file ? (
                    <p className="font-mono text-sm font-bold text-neo-green">{file.name} <span className="text-neo-text3">({(file.size / 1024).toFixed(1)} KB)</span></p>
                  ) : (
                    <>
                      <p className="font-mono text-sm font-bold text-neo-text">Drop file or click to browse</p>
                      <p className="font-mono text-xs text-neo-text3 mt-1">PDF, JPEG, PNG, WebP — max 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleIssue}
            disabled={!form.issuerCapId || !form.title || !form.recipient || !form.recipientName || !file || !isAddressValid || !isCapIdValid}
            className="neo-btn-primary w-full flex items-center justify-center gap-3 text-base !py-4"
          >
            <FileUp className="w-5 h-5" />
            Upload to Walrus & Issue On-Chain
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === "uploading" && (
        <div className="neo-card shadow-neo-green p-12 text-center">
          <Loader2 className="w-16 h-16 text-neo-green mx-auto animate-spin mb-6" strokeWidth={3} />
          <h3 className="font-display font-800 text-2xl uppercase mb-2">Uploading to Walrus</h3>
          <p className="font-mono text-sm text-neo-text2">Storing document & metadata on decentralized storage</p>
          <div className="mt-6 h-3 bg-neo-bg2 rounded-neo border-[2px] border-neo-border overflow-hidden">
            <div className="h-full bg-neo-green rounded-neo animate-pulse" style={{ width: "70%" }} />
          </div>
        </div>
      )}

      {step === "signing" && (
        <div className="neo-card shadow-neo-green p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-neo-green border-[3px] border-neo-border rounded-neo
            flex items-center justify-center animate-bounce shadow-neo">
            <Shield className="w-8 h-8 text-neo-text" strokeWidth={3} />
          </div>
          <h3 className="font-display font-800 text-2xl uppercase mb-2">Sign Transaction</h3>
          <p className="font-mono text-sm text-neo-text2">Approve in your wallet to issue on-chain</p>
        </div>
      )}

      {step === "success" && result && (
        <div className="neo-card-green p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-neo-green border-[3px] border-neo-border rounded-neo
            flex items-center justify-center shadow-neo">
            <Check className="w-10 h-10 text-neo-text" strokeWidth={3} />
          </div>
          <h3 className="font-display font-800 text-3xl text-neo-green uppercase mb-2">Credential Issued!</h3>
          <p className="font-mono text-sm text-neo-text2 mb-6">Stored on Walrus. Minted on SUI mainnet.</p>
          <div className="bg-neo-bg2 rounded-neo p-4 border-[2px] border-neo-border text-left mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-bold uppercase text-neo-text3">Credential ID</span>
              <span className="font-mono text-xs text-neo-green truncate max-w-[200px]">{result.credentialId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-bold uppercase text-neo-text3">TX Digest</span>
              <span className="font-mono text-xs text-neo-text2 truncate max-w-[200px]">{result.digest}</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <a href={`https://suiscan.xyz/mainnet/object/${result.credentialId}`}
              target="_blank" rel="noopener noreferrer"
              className="neo-btn-primary inline-flex items-center gap-2">
              View Credential <ExternalLink className="w-4 h-4" />
            </a>
            <a href={`http://localhost:3000/verify/${result.credentialId}`}
              target="_blank" rel="noopener noreferrer"
              className="neo-btn-secondary inline-flex items-center gap-2">
              Verify Link <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {step === "error" && (
        <div className="neo-card shadow-neo-pink p-12 text-center">
          <AlertCircle className="w-16 h-16 text-neo-pink mx-auto mb-4" strokeWidth={3} />
          <h3 className="font-display font-800 text-2xl text-neo-pink uppercase mb-2">Error</h3>
          <p className="font-mono text-sm text-neo-text2 mb-6">{error}</p>
          <button onClick={() => setStep("form")} className="neo-btn-pink">
            Try Again
          </button>
        </div>
      )}
    </section>
  );
}
