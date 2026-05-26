"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neo-bg p-4">
      <div className="neo-card shadow-neo-pink p-8 max-w-md text-center">
        <AlertCircle className="w-16 h-16 text-neo-pink mx-auto mb-4" strokeWidth={3} />
        <h2 className="font-display font-800 text-2xl text-neo-pink uppercase mb-2">
          Something went wrong
        </h2>
        <p className="font-mono text-sm text-neo-text2 mb-6">
          {error.message || "An unexpected error occurred"}
        </p>
        <button onClick={reset} className="neo-btn-primary">
          Try Again
        </button>
      </div>
    </div>
  );
}
