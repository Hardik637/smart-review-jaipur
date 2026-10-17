"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
import WelurikLogo from "@/components/Logo";
import { verifyFirebaseResetCode, confirmFirebasePasswordReset } from "@/lib/firebase-client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Firebase Auth typically provides oobCode (out of band code), or token
  const oobCode = searchParams.get("oobCode") || searchParams.get("token") || searchParams.get("code") || "";

  const [verifying, setVerifying] = useState(true);
  const [codeValid, setCodeValid] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Validate reset code on initial mount
  useEffect(() => {
    async function checkCode() {
      if (!oobCode) {
        setVerifying(false);
        setCodeValid(false);
        return;
      }

      const res = await verifyFirebaseResetCode(oobCode);
      if (res.valid) {
        setCodeValid(true);
        if (res.email) setUserEmail(res.email);
      } else {
        setCodeValid(false);
      }
      setVerifying(false);
    }

    checkCode();
  }, [oobCode]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await confirmFirebasePasswordReset(oobCode, newPassword);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "This password reset link is invalid or has expired.");
      }
    } catch {
      setError("Something went wrong while updating your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 1. Initial verification loading state
  if (verifying) {
    return (
      <div className="bg-white border-2 border-black rounded-[28px] p-8 text-center space-y-3 shadow-[5px_5px_0px_#000000]">
        <Loader2 className="w-8 h-8 animate-spin text-[#15803D] mx-auto" />
        <p className="text-xs font-bold text-slate-700">Verifying secure password reset link...</p>
      </div>
    );
  }

  // 2. Invalid or Expired link state
  if (!codeValid) {
    return (
      <div className="bg-white border-2 border-black rounded-[28px] p-6 sm:p-8 space-y-5 text-center shadow-[5px_5px_0px_#000000]">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border-2 border-black shadow-[2px_2px_0px_#000000]">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-black text-black">Link Invalid or Expired</h2>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            This password reset link is invalid or has expired. Please request a new link to reset your password.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <Link
            href="/forgot-password"
            className="w-full py-3.5 bg-[#15803D] hover:bg-[#166534] text-white rounded-full text-xs sm:text-sm font-black border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Request a new reset link</span>
          </Link>
          <Link
            href="/login"
            className="w-full py-3 bg-white hover:bg-slate-50 text-black rounded-full text-xs sm:text-sm font-black border-2 border-black shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition-all flex items-center justify-center gap-2"
          >
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Successful password reset state
  if (success) {
    return (
      <div className="bg-white border-2 border-black rounded-[28px] p-6 sm:p-8 space-y-5 text-center shadow-[5px_5px_0px_#000000] animate-in fade-in">
        <div className="w-12 h-12 bg-emerald-50 text-[#15803D] rounded-full flex items-center justify-center mx-auto border-2 border-black shadow-[2px_2px_0px_#000000]">
          <CheckCircle2 className="w-6 h-6 text-[#15803D]" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-black">Password updated successfully</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Your password has been changed. You can now sign in with your new password.
          </p>
        </div>

        <Link
          href="/login"
          className="w-full py-3.5 sm:py-4 bg-[#15803D] hover:bg-[#166534] text-white rounded-full text-xs sm:text-sm font-black border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] transition-all flex items-center justify-center gap-2"
        >
          <span>Continue to login</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // 4. Set new password form
  return (
    <div className="bg-white border-2 border-black rounded-[28px] p-6 sm:p-8 space-y-5 text-left shadow-[5px_5px_0px_#000000]">
      {userEmail && (
        <div className="p-3 bg-slate-50 border-2 border-black/10 rounded-2xl text-xs font-bold text-slate-700">
          Resetting password for: <span className="text-black font-black">{userEmail}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border-2 border-rose-400 text-rose-800 text-xs font-bold rounded-2xl flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="block text-xs font-black text-black mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

        <div>
          <label className="block text-xs font-black text-black mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="w-full text-xs sm:text-sm pl-10 pr-10 py-3 bg-slate-50 border-2 border-black rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D] font-bold text-black shadow-[2px_2px_0px_#000000] transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword}
          className="w-full py-3.5 sm:py-4 bg-[#15803D] hover:bg-[#166534] disabled:bg-slate-300 text-white rounded-full text-xs sm:text-sm font-black border-2 border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating Password...</span>
            </div>
          ) : (
            <>
              <span>Update Password</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#ECFDF5] neo-canvas-bg text-black font-sans selection:bg-black selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto px-6 sm:px-8 py-6 flex items-center justify-between z-10">
        <Link href="/" className="group hover:opacity-80 transition-opacity flex items-center">
          <WelurikLogo className="h-9 sm:h-[48px]" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-[440px] w-full mx-auto px-4 sm:px-6 py-6 my-auto z-10 space-y-5 text-center">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Create New Password
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-600 font-medium">
            Enter your new password below to secure your business account.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white border-2 border-black rounded-[28px] p-8 text-center space-y-3 shadow-[5px_5px_0px_#000000]">
              <Loader2 className="w-8 h-8 animate-spin text-[#15803D] mx-auto" />
              <p className="text-xs font-bold text-slate-700">Loading...</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-6 text-center text-xs text-slate-500 font-medium z-10 border-t-2 border-black/10">
        © 2026 Welurik Review. All rights reserved.
      </footer>
    </div>
  );
}
