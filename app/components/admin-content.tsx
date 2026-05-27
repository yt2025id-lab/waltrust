"use client";

import { useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { buildApproveIssuerTx, buildDeactivateIssuerTx, buildReactivateIssuerTx } from "@/lib/contract";
import { isValidSuiAddress } from "@/lib/utils";
import { ConnectWallet } from "@/components/connect-wallet";
import { Shield, UserCheck, UserX, RotateCcw, Loader2, Check, AlertCircle, ArrowRight } from "lucide-react";

export function AdminContent() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [adminCapId, setAdminCapId] = useState("");
  const [issuerRegistryId, setIssuerRegistryId] = useState("");

  const [approveForm, setApproveForm] = useState({ address: "", name: "" });
  const [deactivateForm, setDeactivateForm] = useState({ issuerCapId: "" });
  const [reactivateForm, setReactivateForm] = useState({ issuerCapId: "" });
  const [step, setStep] = useState<"idle" | "signing" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ digest: string; action: string } | null>(null);

  const handleApproveIssuer = async () => {
    if (!account || !adminCapId || !issuerRegistryId || !approveForm.address) return;
    try {
      setStep("signing");
      setError("");
      const tx = buildApproveIssuerTx(adminCapId, issuerRegistryId, approveForm.address, approveForm.name);
      const execResult = await signAndExecute({ transaction: tx });
      setResult({ digest: execResult.digest, action: "approved" });
      setStep("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      setError(message);
      console.error("Approve error:", err);
      setStep("error");
    }
  };

  const handleDeactivateIssuer = async () => {
    if (!account || !adminCapId || !issuerRegistryId || !deactivateForm.issuerCapId) return;
    try {
      setStep("signing");
      setError("");
      const tx = buildDeactivateIssuerTx(adminCapId, issuerRegistryId, deactivateForm.issuerCapId);
      const execResult = await signAndExecute({ transaction: tx });
      setResult({ digest: execResult.digest, action: "deactivated" });
      setStep("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      setError(message);
      console.error("Deactivate error:", err);
      setStep("error");
    }
  };

  const handleReactivateIssuer = async () => {
    if (!account || !adminCapId || !issuerRegistryId || !reactivateForm.issuerCapId) return;
    try {
      setStep("signing");
      setError("");
      const tx = buildReactivateIssuerTx(adminCapId, issuerRegistryId, reactivateForm.issuerCapId);
      const execResult = await signAndExecute({ transaction: tx });
      setResult({ digest: execResult.digest, action: "reactivated" });
      setStep("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      setError(message);
      console.error("Reactivate error:", err);
      setStep("error");
    }
  };

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="neo-card shadow-neo inline-block p-12">
          <Shield className="w-16 h-16 text-neo-blue mx-auto mb-4" strokeWidth={3} />
          <h1 className="font-display font-800 text-3xl mb-3 uppercase">Admin Dashboard</h1>
          <p className="font-mono text-sm text-neo-text2 mb-6">Connect admin wallet</p>
          <ConnectWallet />
        </div>
      </div>
    );
  }

  const isAdminCapValid = adminCapId === "" || isValidSuiAddress(adminCapId);
  const isRegistryValid = issuerRegistryId === "" || isValidSuiAddress(issuerRegistryId);
  const isIssuerAddrValid = approveForm.address === "" || isValidSuiAddress(approveForm.address);
  const isDeactivateCapValid = deactivateForm.issuerCapId === "" || isValidSuiAddress(deactivateForm.issuerCapId);
  const isReactivateCapValid = reactivateForm.issuerCapId === "" || isValidSuiAddress(reactivateForm.issuerCapId);

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="neo-section-label">ADMIN</div>
      <h1 className="font-display font-800 text-3xl sm:text-4xl tracking-tight uppercase mb-2">
        Admin <span className="text-neo-blue">Dashboard</span>
      </h1>
      <p className="font-mono text-sm text-neo-text2 mb-8">
        Approve / deactivate issuers. AdminCap required.
      </p>

      <div className="neo-card shadow-neo mb-4">
        <span className="neo-tag-yellow mb-4 inline-block">Config</span>
        <div className="space-y-4">
          <div>
            <label className="neo-label">AdminCap ID</label>
            <input type="text" placeholder="0x..." value={adminCapId}
              onChange={(e) => setAdminCapId(e.target.value)}
              className={`neo-input font-mono text-sm ${!isAdminCapValid && adminCapId ? "border-neo-pink" : ""}`} />
            {!isAdminCapValid && adminCapId && (
              <p className="font-mono text-xs text-neo-pink mt-1">Invalid address format</p>
            )}
          </div>
          <div>
            <label className="neo-label">IssuerRegistry ID</label>
            <input type="text" placeholder="0x..." value={issuerRegistryId}
              onChange={(e) => setIssuerRegistryId(e.target.value)}
              className={`neo-input font-mono text-sm ${!isRegistryValid && issuerRegistryId ? "border-neo-pink" : ""}`} />
            {!isRegistryValid && issuerRegistryId && (
              <p className="font-mono text-xs text-neo-pink mt-1">Invalid address format</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="neo-card shadow-neo-green">
          <span className="neo-tag-green mb-4 inline-flex items-center gap-1">
            <UserCheck className="w-3 h-3" /> Approve
          </span>
          <div className="space-y-4">
            <div>
              <label className="neo-label">Issuer Address</label>
              <input type="text" placeholder="0x..." value={approveForm.address}
                onChange={(e) => setApproveForm({ ...approveForm, address: e.target.value })}
                className={`neo-input font-mono text-sm ${!isIssuerAddrValid && approveForm.address ? "border-neo-pink" : ""}`} />
              {!isIssuerAddrValid && approveForm.address && (
                <p className="font-mono text-xs text-neo-pink mt-1">Invalid address format</p>
              )}
            </div>
            <div>
              <label className="neo-label">Issuer Name</label>
              <input type="text" placeholder="University name" value={approveForm.name}
                onChange={(e) => setApproveForm({ ...approveForm, name: e.target.value })}
                className="neo-input" />
            </div>
            <button onClick={handleApproveIssuer}
              disabled={!adminCapId || !approveForm.address || !isAdminCapValid || !isIssuerAddrValid}
              className="neo-btn-primary w-full flex items-center justify-center gap-2 text-sm">
              <UserCheck className="w-4 h-4" />
              Approve Issuer
            </button>
          </div>
        </div>

        <div className="neo-card shadow-neo-pink">
          <span className="neo-tag-pink mb-4 inline-flex items-center gap-1">
            <UserX className="w-3 h-3" /> Deactivate
          </span>
          <div className="space-y-4">
            <div>
              <label className="neo-label">IssuerCap ID</label>
              <input type="text" placeholder="0x..." value={deactivateForm.issuerCapId}
                onChange={(e) => setDeactivateForm({ issuerCapId: e.target.value })}
                className={`neo-input font-mono text-sm ${!isDeactivateCapValid && deactivateForm.issuerCapId ? "border-neo-pink" : ""}`} />
              {!isDeactivateCapValid && deactivateForm.issuerCapId && (
                <p className="font-mono text-xs text-neo-pink mt-1">Invalid address format</p>
              )}
            </div>
            <button onClick={handleDeactivateIssuer}
              disabled={!adminCapId || !deactivateForm.issuerCapId || !isAdminCapValid || !isDeactivateCapValid}
              className="neo-btn-pink w-full flex items-center justify-center gap-2 text-sm">
              <UserX className="w-4 h-4" />
              Deactivate Issuer
            </button>
          </div>
        </div>

        <div className="neo-card shadow-neo">
          <span className="neo-tag-yellow mb-4 inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Reactivate
          </span>
          <div className="space-y-4">
            <div>
              <label className="neo-label">IssuerCap ID</label>
              <input type="text" placeholder="0x..." value={reactivateForm.issuerCapId}
                onChange={(e) => setReactivateForm({ issuerCapId: e.target.value })}
                className={`neo-input font-mono text-sm ${!isReactivateCapValid && reactivateForm.issuerCapId ? "border-neo-pink" : ""}`} />
              {!isReactivateCapValid && reactivateForm.issuerCapId && (
                <p className="font-mono text-xs text-neo-pink mt-1">Invalid address format</p>
              )}
            </div>
            <button onClick={handleReactivateIssuer}
              disabled={!adminCapId || !reactivateForm.issuerCapId || !isAdminCapValid || !isReactivateCapValid}
              className="neo-btn-secondary w-full flex items-center justify-center gap-2 text-sm">
              <RotateCcw className="w-4 h-4" />
              Reactivate Issuer
            </button>
          </div>
        </div>
      </div>

      {step === "signing" && (
        <div className="neo-card p-8 text-center mt-6 shadow-neo">
          <Loader2 className="w-12 h-12 text-neo-blue mx-auto animate-spin mb-4" strokeWidth={3} />
          <p className="font-mono text-sm text-neo-text2">Sign transaction in wallet...</p>
        </div>
      )}

      {step === "success" && result && (
        <div className="neo-card p-8 text-center mt-6 border-t-[6px] border-t-neo-green shadow-neo-green">
          <Check className="w-12 h-12 text-neo-green mx-auto mb-4" strokeWidth={3} />
          <h3 className="font-display font-800 text-xl text-neo-green uppercase mb-2">
            Issuer {result.action}!
          </h3>
          <p className="font-mono text-xs text-neo-text3 break-all mb-4">TX: {result.digest}</p>
          <button onClick={() => setStep("idle")} className="neo-btn-primary text-sm">
            Done
          </button>
        </div>
      )}

      {step === "error" && (
        <div className="neo-card p-8 text-center mt-6 shadow-neo-pink">
          <AlertCircle className="w-12 h-12 text-neo-pink mx-auto mb-4" strokeWidth={3} />
          <p className="font-mono text-sm text-neo-text2 mb-4">{error}</p>
          <button onClick={() => setStep("idle")} className="neo-btn-pink text-sm">Try Again</button>
        </div>
      )}
    </section>
  );
}
