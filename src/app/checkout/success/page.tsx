"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, ShieldCheck, Download, Sparkles, Star } from "lucide-react";
import confetti from "canvas-confetti";
import WelurikLogo from "@/components/Logo";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || `ord_${Date.now().toString().slice(-6)}`;
  const paymentId = searchParams.get("payment_id") || `pay_${Date.now().toString().slice(-6)}`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("welurik_dashboard_cache");
      } catch {}
    }

    // Fire celebratory confetti bursts
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#16A34A", "#22C55E", "#EAB308", "#3B82F6"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#16A34A", "#22C55E", "#EAB308", "#3B82F6"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-green-900/5 border border-zinc-200/80 space-y-6"
    >
      {/* Success Badge */}
      <div className="relative inline-flex">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 380, damping: 18 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto shadow-inner"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute -top-1 -right-1 bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5 shadow-sm"
        >
          <Star className="w-2.5 h-2.5 fill-black" />
          Pro Active
        </motion.div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
          Payment Successful! 🎉
        </h1>
        <p className="text-zinc-600 text-sm sm:text-base">
          Welcome to <span className="font-semibold text-zinc-900">Welurik Review Pro</span>. Your Lifetime License is now permanently activated.
        </p>
      </div>

      {/* Receipt Card */}
      <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200/60 text-left space-y-3 text-sm">
        <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60">
          <span className="text-zinc-500 font-medium">Plan</span>
          <span className="font-bold text-zinc-900">Lifetime License (₹1,999 only)</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60">
          <span className="text-zinc-500 font-medium">Order ID</span>
          <span className="font-mono text-xs text-zinc-700">{orderId}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60">
          <span className="text-zinc-500 font-medium">Payment ID</span>
          <span className="font-mono text-xs text-zinc-700">{paymentId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-500 font-medium">Status</span>
          <span className="inline-flex items-center gap-1 text-green-700 bg-green-100/80 px-2 py-0.5 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified & Paid
          </span>
        </div>
      </div>

      {/* Feature Unlocks List */}
      <div className="bg-green-50/60 rounded-2xl p-4 border border-green-200/60 text-left space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-green-800 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-green-600" />
          Your Unlocked Pro Privileges:
        </h4>
        <ul className="text-xs text-green-900/80 space-y-1 pl-5 list-disc">
          <li>Unlimited high-resolution QR Standees & Table Tents</li>
          <li>10,000 AI review generations per month</li>
          <li>Private negative grievance channel to protect ratings</li>
          <li>Real-time customer sentiment analytics & keyword tracking</li>
        </ul>
      </div>

      {/* Action CTAs */}
      <div className="space-y-3 pt-2">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/dashboard"
            className="w-full py-4 px-6 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-base rounded-2xl shadow-lg shadow-green-600/25 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Go to Your Pro Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/qr-studio"
            className="w-full py-3.5 px-6 bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-sm rounded-2xl border border-zinc-300 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-zinc-500" />
            <span>Generate & Print QR Standees Now</span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#ECFDF5] neo-canvas-bg flex flex-col justify-between text-zinc-900 font-sans">
      {/* Header */}
      <header className="py-6 px-6 sm:px-12 flex items-center justify-between border-b border-zinc-200/60 bg-white/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <WelurikLogo />
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          Go to Dashboard
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 py-12 w-full text-center">
        <Suspense
          fallback={
            <div className="bg-white rounded-3xl p-10 border border-zinc-200 shadow-sm text-center">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-zinc-400">
        © 2026 Welurik Media. All rights reserved.
      </footer>
    </div>
  );
}
