import React from "react";
import Link from "next/link";
import WelurikLogo from "@/components/Logo";
import { RefreshCcw, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "No-Refund Policy | Welurik Review",
  description: "No-refund policy and digital access terms for Welurik Review SaaS.",
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
            <RefreshCcw className="w-3.5 h-3.5 text-slate-600" /> Policy Notice
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">No-Refund Policy</h1>
          <p className="text-xs text-slate-500">Last updated: October 2026</p>
        </div>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-950">1. All Sales Are Final</h2>
            <p>
              Welurik Review operates a strict <strong>No-Refund Policy</strong> on all subscription plans (1 Month, 3 Months, 6 Months, and 1 Year). Due to the immediate digital provisioning of software access, custom QR Standee templates, AI generation tokens, and analytics infrastructure upon successful payment, we do not offer refunds, prorated credits, or cancellations once an order has been completed.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-950">2. Instant Digital Provisioning</h2>
            <p>
              Upon successful payment via Razorpay, your business account is immediately activated with full access to the QR Standee Studio, private grievance channels, and AI review generation assistant. Because these digital assets and computational quotas cannot be revoked once issued, all payments are non-refundable.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-950">3. Support & Inquiries</h2>
            <p>
              If you experience any technical difficulties accessing your account, configuring your Google Maps review link, or generating your QR standees, our support team is available to assist you. Please reach out to <a href="mailto:support@welurik.media" className="text-emerald-600 font-semibold underline">support@welurik.media</a> for immediate setup assistance.
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
