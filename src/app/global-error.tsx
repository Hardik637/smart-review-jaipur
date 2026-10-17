"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Fatal root layout error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#FAF9F5] min-h-screen text-[#0C0E14] font-sans flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border-[3px] border-black rounded-[32px] p-8 text-center space-y-4 shadow-[6px_6px_0px_#000000]">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border-2 border-black flex items-center justify-center mx-auto text-rose-600 shadow-[2px_2px_0px_#000000]">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-black text-black tracking-tight">
            System Level Error
          </h1>

          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            A critical system error occurred. Please refresh the application or return shortly.
          </p>

          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="px-6 py-3 bg-[#15803D] hover:bg-[#166534] text-white font-black rounded-full text-xs border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
