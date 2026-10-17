"use client";

import React, { useState } from "react";
import { Headphones, PhoneCall, Copy, Check, X, ExternalLink, MessageCircle } from "lucide-react";

interface CustomerCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName?: string;
}

export function CustomerCareModal({
  isOpen,
  onClose,
  businessName,
}: CustomerCareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Primary support contact provided by owner: 84217 06305
  const rawPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+918421706305";
  // Clean phone number for tel: and wa.me (digits only with country code)
  const phoneDigits = rawPhone.replace(/[^0-9]/g, "");
  const displayPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY || "+91 84217 06305";

  // Pre-filled WhatsApp message
  const whatsappText = encodeURIComponent(
    `Hi Welurik Support, I am reaching out from ${businessName ? `"${businessName}"` : "my business account"}. I need assistance with my review app.`
  );
  const whatsappUrl = `https://wa.me/${phoneDigits}?text=${whatsappText}`;
  const callUrl = `tel:${rawPhone.startsWith("+") ? rawPhone : `+${phoneDigits}`}`;

  const handleCopyPhone = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(displayPhone);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200/80 relative space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <Headphones className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Direct Support Available
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-950 tracking-tight">
                Customer Care
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Facing any problem with your account, QR standee, or Google reviews? Connect with us directly:
          </p>
        </div>

        {/* Action Buttons: WhatsApp & Direct Call */}
        <div className="space-y-3 pt-1">
          {/* WhatsApp Direct Option */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-between shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  Message on WhatsApp
                  <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
                </p>
                <p className="text-[11px] text-white/90">
                  Instant replies • Share screenshots & queries
                </p>
              </div>
            </div>
          </a>

          {/* Direct Phone Call Option */}
          <div className="w-full p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-between shadow-md transition-all">
            <a
              href={callUrl}
              className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  Call Customer Care
                </p>
                <p className="text-[11px] text-slate-300 font-mono font-bold">
                  {displayPhone}
                </p>
              </div>
            </a>

            {/* Quick Copy Button */}
            <button
              type="button"
              onClick={handleCopyPhone}
              className="ml-2 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-slate-200 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              title="Copy phone number"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Helpful Advice Footer */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1 text-slate-600">
          <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
            💡 Quick Tip for Fast Resolution:
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            When messaging on WhatsApp, take a quick screenshot of any issue or error on your screen so we can resolve it for you immediately.
          </p>
        </div>

        {/* Operating Hours */}
        <div className="text-center pt-1">
          <p className="text-[10px] text-slate-400 font-medium">
            Support Hours: Monday – Sunday • 9:00 AM – 9:00 PM IST
          </p>
        </div>
      </div>
    </div>
  );
}
