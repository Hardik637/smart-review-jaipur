"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";
import WelurikLogo from "@/components/Logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="neo-canvas-bg min-h-screen text-[#0C0E14] font-sans flex flex-col justify-between p-6 relative overflow-hidden selection:bg-[#15803D] selection:text-white">
      {/* Background Grid */}
      <div className="neo-grid-overlay absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-75" />

      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between z-10 py-4">
        <Link href="/" className="group hover:opacity-90 transition-opacity">
          <WelurikLogo className="h-8 sm:h-9" />
        </Link>
      </header>

      {/* Main Error Box */}
      <main className="max-w-md w-full mx-auto my-auto text-center space-y-6 z-10">
        <div className="bg-white border-[3px] border-black rounded-[32px] p-8 sm:p-10 shadow-[6px_6px_0px_#000000] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border-2 border-black flex items-center justify-center mx-auto text-rose-600 shadow-[2px_2px_0px_#000000]">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Something Went Wrong
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            An unexpected error occurred while processing your request. Please try reloading the page.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto px-6 py-3 bg-[#15803D] hover:bg-[#166534] text-white font-black rounded-full text-xs border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 text-black font-bold rounded-full text-xs border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" /> Go Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center text-xs text-slate-500 font-medium py-4 z-10">
        © 2026 Welurik Review. All rights reserved.
      </footer>
    </div>
  );
}
