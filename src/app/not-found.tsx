"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Sparkles } from "lucide-react";
import WelurikLogo from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="neo-canvas-bg min-h-screen text-[#0C0E14] font-sans flex flex-col justify-between p-6 relative overflow-hidden selection:bg-[#15803D] selection:text-white">
      {/* Background ambient accents */}
      <div className="neo-grid-overlay absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-75" />
      <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-[#bbf7d0]/40 rounded-full blur-[110px] pointer-events-none -z-10" />

      {/* Top Brand Nav */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between z-10 py-4">
        <Link href="/" className="group hover:opacity-90 transition-opacity">
          <WelurikLogo className="h-8 sm:h-9" />
        </Link>
        <Link
          href="/"
          className="text-xs font-bold text-black hover:text-slate-700 flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-black bg-white shadow-[2px_2px_0px_#000000]"
        >
          <Home className="w-3.5 h-3.5" /> Back Home
        </Link>
      </header>

      {/* Main 404 Card */}
      <main className="max-w-md w-full mx-auto my-auto text-center space-y-6 z-10">
        <div className="bg-white border-[3px] border-black rounded-[32px] p-8 sm:p-10 shadow-[6px_6px_0px_#000000] space-y-4">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#dcfce7] border-2 border-black rounded-full text-xs font-black text-[#15803D] shadow-[2px_2px_0px_#000000]">
            <Sparkles className="w-3.5 h-3.5" /> Page Not Found
          </div>

          <h1 className="text-6xl sm:text-7xl font-black text-black tracking-tight">
            404
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Oops! The review page or dashboard route you're looking for doesn't exist or has been moved.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 bg-[#15803D] hover:bg-[#166534] text-white font-black rounded-full text-xs border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Homepage
            </Link>
            <Link
              href="/r/welurik-media"
              className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 text-black font-bold rounded-full text-xs border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              View Demo Funnel
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="max-w-5xl w-full mx-auto text-center text-xs text-slate-500 font-medium py-4 z-10">
        © 2026 Welurik Review. All rights reserved.
      </footer>
    </div>
  );
}
