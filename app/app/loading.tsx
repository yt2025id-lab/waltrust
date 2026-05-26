import { Shield } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neo-bg">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-neo-green border-[3px] border-neo-border rounded-neo
          flex items-center justify-center shadow-neo-sm animate-pulse">
          <Shield className="w-8 h-8 text-neo-text" strokeWidth={3} />
        </div>
        <p className="font-mono text-sm font-bold uppercase tracking-wider text-neo-text2">
          Loading...
        </p>
      </div>
    </div>
  );
}
