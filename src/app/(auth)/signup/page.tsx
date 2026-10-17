"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail, CheckCircle2, ShieldCheck, Zap, Loader2, Eye, EyeOff, Building2, AlertCircle } from "lucide-react";
import WelurikLogo from "@/components/Logo";
import GoogleAuthButton from "@/components/GoogleAuthButton";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("Please accept the Terms of Service to continue.");
      return;
    }

    setLoading(true);
    setError("");
    setLoadingStep("Creating your business account...");

    try {
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const signupData = await signupRes.json();
      if (!signupData.success) {
        throw new Error(signupData.error || "Failed to create account");
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("welurik_remembered_email", email.trim());
        } catch {}
      }

      router.push("/onboarding");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong during registration");
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
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Already registered?</span>
          <Link
            href="/login"
            className="text-xs font-black text-black px-4 py-2 rounded-full border-2 border-black bg-white hover:bg-slate-50 shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition-all"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Signup Form Container */}
      <main className="max-w-[480px] w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 my-auto z-10 space-y-5 text-center">
        {/* Title Header */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-widest bg-[#dcfce7] text-[#15803D] border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_#000000] inline-block">
            ★ Lifetime License Deal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Claim Your Business License
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-600 font-medium">
            One-time ₹1,999 only • Lifetime Access • Zero Monthly Fees
          </p>
        </div>

        {/* Neo-brutalist Main Card */}
        <div className="bg-white border-2 border-black rounded-[28px] p-6 sm:p-8 space-y-5 text-left shadow-[5px_5px_0px_#000000]">
          {/* Included Features Box */}
          <div className="bg-gradient-to-br from-emerald-50 to-amber-50 rounded-2xl p-4 border-2 border-black/10 space-y-2">
            <span className="text-xs font-black text-black flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#15803D]" /> Included with your license:
            </span>
            <ul className="space-y-1.5 text-xs text-slate-700 font-bold">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                <span>Custom QR Standee & 4" x 6" Frame Studio</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                <span>AI-Powered 30-Second Google Review Assistant</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                <span>Live Analytics Dashboard & Grievance Inbox</span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border-2 border-rose-400 text-rose-800 text-xs font-bold rounded-2xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Google Sign-Up */}
          <div className="space-y-3">
            <GoogleAuthButton
              text="Sign up with Google"
              onError={(err) => setError(err)}
              onSuccess={() => setError("")}
            />

            {/* Clean Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="border-t-2 border-black/10 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                or register with email
              </span>
              <div className="border-t-2 border-black/10 w-full" />
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-black mb-1.5">
                Business / Owner Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. The Coffee House / John Doe"
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 bg-slate-50 border-2 border-black rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D] font-bold text-black shadow-[2px_2px_0px_#000000] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1.5">
                Business Email
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

            <div>
              <label className="block text-xs font-black text-black mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full text-xs sm:text-sm pl-10 pr-10 py-3 bg-slate-50 border-2 border-black rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D] font-bold text-black shadow-[2px_2px_0px_#000000] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-2 pt-1 text-[11.5px] text-slate-600 font-medium">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-2 border-black text-[#15803D] focus:ring-[#15803D]"
              />
              <label htmlFor="terms" className="cursor-pointer leading-tight">
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="font-bold text-black underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="font-bold text-black underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#15803D] hover:bg-[#166534] disabled:bg-slate-300 text-white rounded-full text-xs sm:text-sm font-black border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{loadingStep || "Processing..."}</span>
                </div>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white text-white" />
                  <span>Create Account & Continue →</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-bold pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
              <span>Step 1 of 3: Setup your business funnel</span>
            </div>
          </form>
        </div>

        {/* Bottom Sign-In Link */}
        <p className="text-xs text-slate-500 font-medium">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-black underline decoration-2 hover:text-[#15803D]">
            Sign in here
          </Link>
        </p>
      </main>

      {/* Modern Minimal Footer */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-6 text-center text-xs text-slate-500 font-medium z-10 flex flex-wrap items-center justify-center gap-4 border-t-2 border-black/10">
        <span>© 2026 Welurik Review. All rights reserved.</span>
        <div className="flex items-center gap-3">
          <Link href="/privacy" className="hover:text-black">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-black">Terms of Service</Link>
          <span>•</span>
          <Link href="/refund" className="hover:text-black">Refund Policy</Link>
        </div>
      </footer>
    </div>
  );
}
