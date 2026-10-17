"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle2, ChevronLeft, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import WelurikLogo from "@/components/Logo";
import { sendFirebasePasswordReset } from "@/lib/firebase-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Handle resend countdown cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await sendFirebasePasswordReset(email.trim());
      if (result.success) {
        setSubmitted(true);
        setCooldown(60); // 60-second anti-abuse cooldown
      } else {
        setError(result.error || "Unable to send password reset email. Please try again.");
      }
    } catch {
      setError("Something went wrong while sending the reset email. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setError("");
    try {
      await sendFirebasePasswordReset(email.trim());
      setCooldown(60);
    } catch {
      setError("Something went wrong while sending the reset email. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECFDF5] neo-canvas-bg text-black font-sans selection:bg-black selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto px-6 sm:px-8 py-6 flex items-center justify-between z-10">
        <Link href="/" className="group hover:opacity-80 transition-opacity flex items-center">
          <WelurikLogo className="h-9 sm:h-[48px]" />
        </Link>
        <Link
          href="/login"
          className="text-xs font-black text-black px-4 py-2 rounded-full border-2 border-black bg-white hover:bg-slate-50 shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition-all flex items-center gap-1.5"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
      </header>

      {/* Centered Recovery Container */}
      <main className="max-w-[440px] w-full mx-auto px-4 sm:px-6 py-6 my-auto z-10 space-y-5 text-center">
        {/* Title Header */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Forgot your password?
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-600 font-medium">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border-2 border-black rounded-[28px] p-6 sm:p-8 space-y-5 text-left shadow-[5px_5px_0px_#000000]">
          {error && (
            <div className="p-3.5 bg-rose-50 border-2 border-rose-400 text-rose-800 text-xs font-bold rounded-2xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-black mb-1.5">
                  Business Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@yourbusiness.com"
                    className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 bg-slate-50 border-2 border-black rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D] font-bold text-black shadow-[2px_2px_0px_#000000] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3.5 sm:py-4 bg-[#15803D] hover:bg-[#166534] disabled:bg-slate-300 text-white rounded-full text-xs sm:text-sm font-black border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </div>
                ) : (
                  <>
                    <span>Send Password Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 bg-emerald-50 text-[#15803D] rounded-full flex items-center justify-center mx-auto border-2 border-black shadow-[2px_2px_0px_#000000]">
                <CheckCircle2 className="w-6 h-6 text-[#15803D]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-black text-black">Reset Link Dispatched</h3>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  If an account exists for <span className="font-bold text-black">{email}</span>, we've sent you a password reset link. Please check your inbox and spam folder.
                </p>
              </div>

              {/* Cooldown & Resend Action */}
              <div className="pt-2 border-t-2 border-black/10 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || loading}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-black rounded-xl text-xs font-bold border-2 border-black transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>{cooldown > 0 ? `Resend email in ${cooldown}s` : "Resend password reset email"}</span>
                </button>

                <Link
                  href="/login"
                  className="text-xs font-black text-[#15803D] hover:underline pt-1"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Back Link */}
        <p className="text-xs text-slate-500 font-medium">
          Remember your password?{" "}
          <Link href="/login" className="font-bold text-black underline decoration-2 hover:text-[#15803D]">
            Sign in here
          </Link>
        </p>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-6 text-center text-xs text-slate-500 font-medium z-10 border-t-2 border-black/10">
        © 2026 Welurik Review. All rights reserved.
      </footer>
    </div>
  );
}
