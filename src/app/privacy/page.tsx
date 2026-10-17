import React from "react";
import Link from "next/link";
import WelurikLogo from "@/components/Logo";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Welurik Review",
  description: "Privacy policy and data protection practices for Welurik Review SaaS.",
};

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-emerald-600" /> Data Privacy & Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-500">Last updated: August 31, 2026</p>
        </div>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-950">1. Information We Collect</h2>
            <p>
              When you register for Welurik Review, we collect your business email address, password hash, business name, category, and public Google Review link. When customers interact with your QR standee review funnel, we collect anonymous aggregate interaction metrics (scan timestamps, selected experience keywords, and review completion status).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-950">2. Customer Private Feedback</h2>
            <p>
              Customers rating 1–3 stars who choose to submit private feedback may optionally provide their name, phone number, and issue description. This information is stored securely in your private inbox and is never shared with third parties or published publicly.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-950">3. AI Review Processing</h2>
            <p>
              The AI Review Assistant uses Google Gemini to generate human-sounding review suggestions based solely on customer-selected keyword tags and custom comments. No personally identifiable customer information is transmitted to third-party AI models.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-950">4. Payment Security</h2>
            <p>
              All financial transactions and payment card details are processed directly through Razorpay's PCI-DSS Level 1 compliant payment infrastructure. Welurik Review does not store credit/debit card numbers or UPI PINs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-950">5. Contact Us</h2>
            <p>
              If you have any questions regarding your data privacy or wish to request data deletion, contact our support team at <a href="mailto:support@welurik.com" className="text-emerald-600 font-semibold underline">support@welurik.com</a>.
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
