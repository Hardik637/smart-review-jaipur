import React from "react";
import Link from "next/link";
import WelurikLogo from "@/components/Logo";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Welurik Review",
  description: "Terms and conditions governing the use of Welurik Review SaaS.",
};

export default function TermsOfServicePage() {
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
            <FileText className="w-3.5 h-3.5 text-slate-600" /> User Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-500">Last updated: August 31, 2026</p>
        </div>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-950">1. Acceptance of Terms</h2>
            <p>
              By purchasing a license or using Welurik Review, you agree to comply with these terms. If you do not agree with any part of these terms, you must not use the software or services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-950">2. Google Policy Compliance</h2>
            <p>
              Welurik Review provides an AI-assisted review drafting assistant and private customer grievance resolution channel. Business owners agree not to use review gating to bribe customers, solicit fake reviews, or violate Google Maps Content Policies. Welurik Review does not guarantee specific star ratings or removal of organic negative reviews on Google Maps.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-950">3. Lifetime License Scope</h2>
            <p>
              A Lifetime License granted under the ₹1,999 only deal provides perpetual software access for one business entity, including future platform updates, QR Standee generation, and a generous monthly quota of AI generations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-950">4. Account Responsibility</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
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
