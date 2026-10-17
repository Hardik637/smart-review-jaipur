"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, getCategoryById } from "@/lib/categories";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Check, Lock, Zap, ExternalLink, AlertCircle } from "lucide-react";
import Link from "next/link";
import WelurikLogo from "@/components/Logo";
import { triggerBirthdayPop } from "@/components/BirthdayPopCelebration";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form Data
  const [name, setName] = useState("");
  const [category, setCategory] = useState("cafe");
  const [location, setLocation] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [brandColor, setBrandColor] = useState("#0f172a");
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Promo Code States
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [showPromo, setShowPromo] = useState(false);

  const selectedCategoryConfig = getCategoryById(category);

  // Auto-restore existing business data into form fields while preserving Step 1 start
  useEffect(() => {
    fetch("/api/business/me")
      .then((r) => r.json())
      .then((d) => {
        if (d && d.success && d.business) {
          const b = d.business;
          if (b.name) setName(b.name);
          if (b.category) setCategory(b.category);
          if (b.location) setLocation(b.location);
          if (b.googleReviewUrl) setGoogleReviewUrl(b.googleReviewUrl);
        }
      })
      .catch(() => {});
  }, []);

  const isValidGoogleUrl = (url: string) => {
    if (!url || typeof url !== "string") return false;
    const clean = url.trim().toLowerCase();
    return (
      clean.includes("g.page") ||
      clean.includes("maps.app.goo.gl") ||
      clean.includes("search.google.com/local/writereview") ||
      clean.includes("google.com/maps") ||
      clean.includes("goo.gl/maps") ||
      clean.includes("business.google.com") ||
      clean.includes("maps.google.com") ||
      clean.includes("google.")
    );
  };

  const handleStep1Continue = () => {
    if (!name.trim()) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    fetch("/api/business/" + slug, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        category,
        location,
        services: selectedCategoryConfig.defaultServices,
        topics: [
          ...selectedCategoryConfig.positiveTopics.map((n) => ({ name: n, type: "positive" })),
          ...selectedCategoryConfig.issueTopics.map((n) => ({ name: n, type: "issue" })),
        ],
      }),
    }).catch(() => {});
    setStep(2);
  };

  const handleStep2Continue = () => {
    if (!googleReviewUrl.trim()) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    fetch("/api/business/" + slug, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        category,
        location,
        googleReviewUrl,
        services: selectedCategoryConfig.defaultServices,
        topics: [
          ...selectedCategoryConfig.positiveTopics.map((n) => ({ name: n, type: "positive" })),
          ...selectedCategoryConfig.issueTopics.map((n) => ({ name: n, type: "issue" })),
        ],
      }),
    }).catch(() => {});
    setStep(3);
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    setPromoSuccess("");

    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      // 1. Save business configuration first
      await fetch("/api/business/" + slug, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          location,
          googleReviewUrl,
          brandColor,
          services: selectedCategoryConfig.defaultServices,
          topics: [
            ...selectedCategoryConfig.positiveTopics.map((n) => ({ name: n, type: "positive" })),
            ...selectedCategoryConfig.issueTopics.map((n) => ({ name: n, type: "issue" })),
          ],
        }),
      });

      // 2. Call promo-code activation endpoint
      const res = await fetch("/api/payment/promo-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode,
          businessSlug: slug,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPromoSuccess(data.message || "🎉 VIP Access Activated!");
        triggerBirthdayPop({
          title: "VIP Access Activated! 🚀",
          message: "Welcome aboard! Your review funnel and dashboard are ready.",
          emoji: "🎉",
        });
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("welurik_pro_activated", "true");
            sessionStorage.removeItem("welurik_dashboard_cache");
          } catch {}
          window.dispatchEvent(new Event("refresh_business"));
        }
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        setPromoError(data.error || "Invalid or expired promo code.");
      }
    } catch (err: any) {
      setPromoError("Failed to apply promo code. Please try again.");
    } finally {
      setPromoLoading(false);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayAndActivate = async () => {
    if (!name || !googleReviewUrl) return;

    setLoading(true);
    setPaymentError("");

    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      // 1. Save business configuration first
      await fetch("/api/business/" + slug, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          location,
          googleReviewUrl,
          brandColor,
          services: selectedCategoryConfig.defaultServices,
          topics: [
            ...selectedCategoryConfig.positiveTopics.map((n) => ({ name: n, type: "positive" })),
            ...selectedCategoryConfig.issueTopics.map((n) => ({ name: n, type: "issue" })),
          ],
        }),
      });

      // 2. Initialize Razorpay Order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: "lifetime" }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Could not initialize payment");
      }

      // 3. Load Razorpay Checkout Modal
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay payment gateway. Please check your internet connection.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Welurik Review",
        description: "₹1,999 only Lifetime License Activation",
        order_id: orderData.orderId,
        image: "/favicon.png",
        handler: async function (response: any) {
          try {
            setLoading(true);
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || orderData.orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planType: "lifetime",
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("welurik_dashboard_cache");
              }
              window.location.href = "/dashboard";
            } else {
              setPaymentError(verifyData.error || "Payment verification failed.");
              setLoading(false);
            }
          } catch (err: any) {
            setPaymentError("Error confirming transaction.");
            setLoading(false);
          }
        },
        prefill: {
          email: orderData.prefill?.email || "",
        },
        theme: {
          color: "#0f172a",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setPaymentError(response.error?.description || "Payment was not completed.");
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setPaymentError(err.message || "Failed to start payment checkout.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECFDF5] neo-canvas-bg text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col justify-between py-8 px-6 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-gradient-to-tr from-emerald-200/20 via-teal-200/25 to-slate-200/20 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Top Bar */}
      <header className="max-w-6xl w-full mx-auto px-4 flex items-center justify-between z-10">
        <WelurikLogo className="h-8 sm:h-9" />
        <span className="text-xs font-semibold text-slate-400">Step {step} of 3</span>
      </header>

      <div className="w-full max-w-md mx-auto my-auto z-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            {step === 3 ? "Activate Lifetime License" : "Setup Your Business Funnel"}
          </h1>
          <p className="text-xs text-slate-500">
            {step === 3
              ? "Complete payment to unlock your QR standee studio and dashboard."
              : "Get your custom QR standee and Google Review Assistant ready."}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (s === 1) setStep(1);
                  else if (s === 2) {
                    if (name.trim()) setStep(2);
                  } else if (s === 3) {
                    if (name.trim() && isValidGoogleUrl(googleReviewUrl)) setStep(3);
                  }
                }}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                  step >= s ? "bg-slate-950 text-white" : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                }`}
              >
                {s}
              </button>
              {s < 3 && <div className={`w-6 h-0.5 ${step > s ? "bg-slate-950" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        {/* Main Step Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[32px] p-7 sm:p-8 border border-slate-200/80 shadow-[0_20px_50px_rgba(15,23,42,0.06)] space-y-5">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">What is your business?</h2>
                <p className="text-xs text-slate-400 mt-0.5">Enter your business name and industry.</p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. The Coffee House, Glow Salon"
                    className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium text-slate-900 capitalize"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location / City</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Indiranagar, Bengaluru"
                    className="w-full text-xs px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium text-slate-900"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={!name.trim()}
                onClick={handleStep1Continue}
                className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 disabled:bg-slate-200 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/10 transition-all cursor-pointer"
              >
                Continue to Review Link <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STEP 2: Google Review Link */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Google Business Review Link</h2>
                <p className="text-xs text-slate-500 mt-0.5">Where customers will post their 5-star reviews.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Google Review URL
                    </label>
                    {googleReviewUrl.trim().length > 5 && (
                      <a
                        href={googleReviewUrl.startsWith("http") ? googleReviewUrl : `https://${googleReviewUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>Test Link</span>
                        <ExternalLink className="w-3 h-3 text-emerald-600" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    required
                    value={googleReviewUrl}
                    onChange={(e) => setGoogleReviewUrl(e.target.value)}
                    placeholder="https://g.page/r/your-id/review or https://maps.app.goo.gl/..."
                    className={`w-full text-xs px-3.5 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 font-mono text-slate-900 ${
                      googleReviewUrl && !isValidGoogleUrl(googleReviewUrl)
                        ? "border-rose-300 focus:ring-rose-500"
                        : "border-slate-200/80 focus:ring-slate-950"
                    }`}
                  />

                  {googleReviewUrl && googleReviewUrl.trim().length > 0 && (
                    <>
                      {isValidGoogleUrl(googleReviewUrl) ? (
                        <div className="mt-2 flex items-center justify-between bg-emerald-50/90 border border-emerald-200/80 px-3 py-2 rounded-xl text-xs">
                          <div className="flex items-center gap-1.5 text-emerald-800 font-medium text-[11.5px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Valid Google Business format</span>
                          </div>
                          <a
                            href={googleReviewUrl.startsWith("http") ? googleReviewUrl : `https://${googleReviewUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer transition-all"
                          >
                            <span>🧪 Click to Test GMB Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-2 bg-rose-50 border border-rose-200/80 px-3 py-2 rounded-xl text-xs text-rose-700">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span className="text-[11.5px]">
                            <strong>Invalid format:</strong> Please enter a real Google Review link (e.g. <code>g.page/r/...</code> or <code>maps.app.goo.gl/...</code>).
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Step-by-Step Visual Procedure Box */}
                <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700 shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    How to get your review link in 3 steps:
                  </p>

                  <div className="space-y-2 text-[11.5px] leading-snug">
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Search your business name on <strong>Google Maps</strong> or Google Search.
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Click the blue <strong>&quot;Ask for reviews&quot;</strong> button on your profile card.
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Click <strong>&quot;Copy link&quot;</strong> and paste the link in the box above!
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-200/60">
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(name || "Google Business Profile")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>🔍 Search &ldquo;{name || "my business"}&rdquo; on Google to copy link ↗</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!googleReviewUrl.trim() || !isValidGoogleUrl(googleReviewUrl)}
                  onClick={handleStep2Continue}
                  className="flex-1 py-3.5 bg-slate-950 hover:bg-slate-900 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  Proceed to Payment <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Lock & Activation */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Instant Lifetime Access
                </div>
                <h2 className="text-xl font-black text-slate-950 tracking-tight">Activate & Launch Workspace</h2>
                <p className="text-xs text-slate-500">
                  Complete your one-time payment to unlock your QR standee studio and dashboard.
                </p>
              </div>

              {/* Ultra-Clean Modern Pricing Card */}
              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3.5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Lifetime Pro License</h3>
                    <p className="text-[11px] text-slate-500 font-medium">One-time payment • Lifetime access</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-xs text-slate-400 line-through font-medium">₹4,999</span>
                      <span className="text-xl font-black text-slate-950">₹1,999 only</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded">SAVE 60%</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="font-semibold text-slate-900">Rank #1 on Google Maps & beat local competitors</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="font-semibold text-slate-900">10x More 5-star reviews (AI writes them in 5 secs)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="font-semibold text-slate-900">Turn everyday footfall into repeat paying customers</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="font-semibold text-slate-900">Zero monthly fees • Pays for itself with 1 customer</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="text-slate-500 font-semibold">Total Payable:</span>
                  <span className="text-base font-black text-slate-950">₹1,999 only</span>
                </div>
              </div>

              {/* VIP Promo Code Option */}
              <div className="bg-slate-50/80 border border-dashed border-slate-300/80 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Have a VIP Promo / Partner Code?
                  </span>
                  {!showPromo && (
                    <button
                      type="button"
                      onClick={() => setShowPromo(true)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                    >
                      Enter Code
                    </button>
                  )}
                </div>

                {showPromo && (
                  <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter promo code"
                        className="flex-1 text-xs uppercase px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                      />
                      <button
                        type="button"
                        disabled={promoLoading || !promoCode.trim()}
                        onClick={handleApplyPromo}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {promoLoading ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>

                    {promoSuccess && (
                      <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>{promoSuccess}</span>
                      </p>
                    )}

                    {promoError && (
                      <p className="text-xs font-medium text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                        {promoError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {paymentError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={loading || promoLoading}
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading || promoLoading}
                  onClick={handlePayAndActivate}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-black tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Opening Secure Gateway...
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Pay ₹1,999 only & Unlock Dashboard
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Secured by Razorpay • UPI (GPay, PhonePe), Cards & NetBanking</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-slate-400 z-10">
        © 2026 Welurik Review. Built for local businesses.
      </footer>
    </div>
  );
}
