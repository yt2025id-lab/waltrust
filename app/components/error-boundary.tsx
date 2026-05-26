"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Shield, AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("WalTrust ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="neo-card shadow-neo-pink p-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-neo-pink/10 border-[3px] border-neo-pink rounded-neo
              flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-neo-pink" strokeWidth={3} />
            </div>
            <h2 className="font-display font-800 text-2xl text-neo-pink uppercase mb-2">Something Broke</h2>
            <p className="font-mono text-sm text-neo-text2 mb-6">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="neo-btn-pink"
            >
              <Shield className="w-4 h-4 mr-2" />
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
