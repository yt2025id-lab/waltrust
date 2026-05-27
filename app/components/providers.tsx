"use client";

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TATUM_ENDPOINTS, network, validateConfig } from "@/lib/sui-client";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { JsonRpcHTTPTransport } from "@mysten/sui/jsonRpc";
import { useMemo, useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 2 },
    },
  }));

  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const err = validateConfig();
    if (err) {
      console.warn("WalTrust config warning:", err);
      setConfigError(err);
    }
  }, []);

  const createClient = useMemo(() => {
    return (_name: string, config: { url: string }) => {
      const tatumApiKey = process.env.NEXT_PUBLIC_TATUM_API_KEY || "";
      const transport = new JsonRpcHTTPTransport({
        url: config.url,
        rpc: { headers: { "x-api-key": tatumApiKey } },
      });
      return new SuiJsonRpcClient({ transport, network: _name as any });
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {configError && (
        <div className="bg-neo-pink/10 border-b-[3px] border-neo-pink px-4 py-2 text-center">
          <p className="font-mono text-xs text-neo-pink flex items-center justify-center gap-2">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {configError} — <span className="text-neo-text3">Copy .env.example → .env.local and fill values</span>
          </p>
        </div>
      )}
      <SuiClientProvider
        networks={TATUM_ENDPOINTS}
        defaultNetwork={network}
        createClient={createClient}
      >
        <WalletProvider autoConnect enableUnsafeBurner>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
