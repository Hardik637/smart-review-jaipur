import React from "react";
import Link from "next/link";
import WelurikLogo from "@/components/Logo";
import { RefreshCcw, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Refund Policy | Welurik Review",
  description: "Refund and cancellation policy for Welurik Review SaaS.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#ECFDF5] neo-canvas-bg text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col justify-between">
      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto px-6 py-8 flex items-center justify-between border-b border-slate-100">
        <Link href="/" className="group hover:opacity-80 transition-opacity flex items-center">
          <WelurikLogo className="h-9 sm:h-[48px]" />
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl w-full mx-auto px-6 py-12 space-y-8 flex-1">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold">
            <RefreshCcw className="w-3.5 h-3.5 text-slate-600" /> Transparent Guarantee
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">Refund & Cancellation Policy</h1>
          <p className="text-xs text-slate-500">Last updated: August 31, 2026</p>
        </div>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-950">1. 7-Day Money-Back Guarantee</h2>
            <p>
              We want you to be completely satisfied with Welurik Review. If within <strong>7 days</strong> of your initial purchase you determine that our review standee and AI assistant tools do not meet your business needs, contact us for a prompt, 100% full refund.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-950">2. Refund Processing</h2>
            <p>
              Approved refunds are credited back to your original payment method (UPI account, credit/debit card, or bank account) via Razorpay within <strong>5–7 business days</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-950">3. How to Request a Refund</h2>
            <p>
              To initiate a refund, email your Razorpay Order ID or registered business email to <a href="mailto:support@welurik.com" className="text-emerald-600 font-semibold underline">support@welurik.com</a> with the subject line "Refund Request".
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto px-6 py-8 text-center text-xs text-slate-400 border-t border-slate-100">
        © 2026 Welurik Review. All rights reserved.
      </footer>
    </div>
  );
}
