"use client";

import { useCurrentAccount, useConnectWallet, useDisconnectWallet, useWallets } from "@mysten/dapp-kit";
import { useState, useCallback } from "react";
import { Wallet, LogOut, ChevronDown, Copy, Check } from "lucide-react";

function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export function ConnectWallet() {
  const account = useCurrentAccount();
  const wallets = useWallets();
  const { mutateAsync: connectWallet } = useConnectWallet();
  const { mutateAsync: disconnectWallet } = useDisconnectWallet();
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = useCallback(async (walletName: string) => {
    setConnecting(true);
    try {
      const wallet = wallets.find((w) => w.name === walletName);
      if (wallet) {
        await connectWallet({ wallet });
      }
    } catch {
      console.error("Failed to connect wallet");
    }
    setConnecting(false);
    setOpen(false);
  }, [wallets, connectWallet]);

  const copyAddress = useCallback(async (addr: string) => {
    try {
      await navigator.clipboard.writeText(addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, []);

  if (account) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="neo-btn-primary !py-1.5 !px-3 !shadow-neo-sm flex items-center gap-2 text-xs"
        >
          <span className="w-2 h-2 bg-neo-green rounded-full animate-pulse shrink-0" />
          <span className="font-mono font-bold">{truncateAddress(account.address)}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={3} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="neo-card !p-3 absolute right-0 top-full mt-2 z-50 min-w-[260px] shadow-neo !translate-x-0 !translate-y-0">
              <div className="space-y-1">
                <div className="px-2 py-1.5">
                  <p className="font-mono text-[10px] text-neo-text3 uppercase tracking-widest mb-0.5">Connected</p>
                  <p className="font-mono text-xs text-neo-text break-all">{account.address}</p>
                </div>
                <hr className="border-t-[2px] border-neo-border-light my-1" />
                <button
                  onClick={() => copyAddress(account.address)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-neo
                    font-mono text-xs font-bold
                    border-[2px] border-transparent
                    hover:border-neo-border hover:bg-neo-surface hover:shadow-neo-sm
                    transition-all duration-200"
                >
                  {copied ? <Check className="w-4 h-4 text-neo-green" strokeWidth={3} /> : <Copy className="w-4 h-4" strokeWidth={3} />}
                  {copied ? "Copied!" : "Copy Address"}
                </button>
                <button
                  onClick={async () => {
                    try {
                      await disconnectWallet();
                    } catch (e) {
                      console.error("Disconnect error:", e);
                    }
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-neo
                    font-mono text-xs font-bold text-neo-pink
                    border-[2px] border-transparent
                    hover:border-neo-pink hover:bg-neo-pink/5 hover:shadow-neo-sm
                    transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" strokeWidth={3} />
                  Disconnect
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="neo-btn-primary !py-1.5 !px-4 !text-xs !shadow-neo-sm flex items-center gap-2"
      >
        <Wallet className="w-3.5 h-3.5" strokeWidth={3} />
        Connect Wallet
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={3} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="neo-card !p-2 absolute right-0 top-full mt-2 z-50 min-w-[220px] shadow-neo !translate-x-0 !translate-y-0">
            {wallets.length === 0 ? (
              <div className="p-4 text-center">
                <p className="font-mono text-xs text-neo-text3 mb-2">No wallet detected</p>
                <a
                  href="https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhajoajbofdmfggbo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] text-neo-green hover:underline"
                >
                  Install Sui Wallet →
                </a>
              </div>
            ) : (
              <div className="space-y-1">
                {wallets.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => handleConnect(wallet.name)}
                    disabled={connecting}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-neo
                      font-mono text-xs font-bold uppercase tracking-wider
                      border-[2px] border-transparent
                      hover:border-neo-border hover:bg-neo-surface hover:shadow-neo-sm
                      transition-all duration-200 disabled:opacity-50"
                  >
                    {wallet.icon && (
                      <img src={wallet.icon} alt={wallet.name} className="w-5 h-5 rounded" />
                    )}
                    <span className="flex-1 text-left">{wallet.name}</span>
                    {connecting && (
                      <span className="w-2 h-2 bg-neo-green rounded-full animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
