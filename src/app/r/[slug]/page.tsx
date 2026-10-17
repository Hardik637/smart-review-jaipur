"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Copy,
  ExternalLink,
  CheckCircle2,
  Star,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { parseTopicItem, parseServiceItem } from "@/lib/sanitize-items";

interface Topic {
  id: string;
  name: string;
  type: string;
}

interface Service {
  id: string;
  name: string;
}

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  category: string;
  location?: string;
  description?: string;
  googleReviewUrl: string;
  brandColor?: string;
  services: Service[];
  topics: Topic[];
}

export default function CustomerReviewPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Customer Selections
  const [rating, setRating] = useState(5);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customerComment, setCustomerComment] = useState("");
  const [tone, setTone] = useState<"short" | "natural" | "detailed">("natural");

  // Review State & Tone Cache
  const [generatedReview, setGeneratedReview] = useState("");
  const [toneCache, setToneCache] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [step, setStep] = useState<"select" | "review">("select");
  const [genError, setGenError] = useState("");

  useEffect(() => {
    async function loadBusiness() {
      try {
        setLoading(true);
        const res = await fetch(`/api/business/${slug}`);
        const data = await res.json();

        if (data.success && data.business) {
          setBusiness(data.business);

          fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              businessSlug: slug,
              eventType: "scan",
            }),
          }).catch(() => {});
        } else {
          setError(data.error || "Business not found");
        }
      } catch {
        setError("Failed to load business details");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadBusiness();
    }
  }, [slug]);

  const toggleTopic = (topicName: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicName)
        ? prev.filter((t) => t !== topicName)
        : [...prev, topicName]
    );
  };

  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const handleGenerate = async (targetTone: "short" | "natural" | "detailed" = tone) => {
    if (!business) return;

    if (toneCache[targetTone]) {
      setTone(targetTone);
      setGeneratedReview(toneCache[targetTone]);
      setIsCopied(false);
      return;
    }

    setTone(targetTone);
    setIsCopied(false);
    setGenError("");

    // Optimistic transition: switch immediately so perceived customer latency is 0ms
    setStep("review");

    if (step === "review") {
      setIsRegenerating(true);
    } else {
      setIsGenerating(true);
    }

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug: slug,
          businessName: business.name,
          category: business.category,
          location: business.location,
          selectedTopics,
          selectedServices,
          customerComment,
          tone: targetTone,
          rating,
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        setGeneratedReview(data.review);
        setToneCache((prev) => ({ ...prev, [targetTone]: data.review }));
      } else {
        setGenError(data.error || "Could not generate review. Please try again.");
      }
    } catch {
      setGenError("Something went wrong while generating the review. Please try again.");
    } finally {
      setIsGenerating(false);
      setIsRegenerating(false);
    }
  };

  const handleCopyAndOpenGoogle = async () => {
    if (!business) return;

    const rawUrl = business.googleReviewUrl?.trim() || "";
    const targetUrl =
      rawUrl.length > 0
        ? (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`)
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name + (business.location ? " " + business.location : ""))}`;

    // 1. Copy review text to clipboard
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(generatedReview);
      } else {
        throw new Error("Clipboard API unavailable");
      }
      setIsCopied(true);
    } catch {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = generatedReview;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setIsCopied(true);
      } catch {
        setIsCopied(true);
      }
    }

    // 2. Confetti celebration only for 4 & 5 star reviews
    if (rating >= 4) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
    }

    // 3. Track conversion analytics
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessSlug: slug,
        eventType: "google_clicked",
      }),
    }).catch(() => {});

    // 4. Redirect directly to Google Maps review page
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">Business Not Found</h2>
          <p className="text-xs text-slate-400 mt-1">{error || "This review link may be inactive."}</p>
          <Link
            href="/"
            className="mt-5 inline-block text-xs font-medium text-slate-900 hover:bg-slate-100 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

const DEFAULT_NEGATIVE_TOPICS = [
  { id: "issue_slow", name: "Slow Service", type: "issue" as const },
  { id: "issue_wait", name: "Long Wait Time", type: "issue" as const },
  { id: "issue_quality", name: "Subpar Quality", type: "issue" as const },
  { id: "issue_staff", name: "Staff Behavior", type: "issue" as const },
  { id: "issue_price", name: "Overpriced", type: "issue" as const },
  { id: "issue_clean", name: "Cleanliness", type: "issue" as const },
];

const DEFAULT_POSITIVE_TOPICS = [
  { id: "pos_service", name: "Great Service", type: "positive" as const },
  { id: "pos_staff", name: "Friendly Staff", type: "positive" as const },
  { id: "pos_quality", name: "Top Quality", type: "positive" as const },
  { id: "pos_clean", name: "Clean & Tidy", type: "positive" as const },
  { id: "pos_vibe", name: "Great Ambience", type: "positive" as const },
];

const DEFAULT_MIXED_TOPICS = [
  { id: "mix_service", name: "Average Service", type: "issue" as const },
  { id: "mix_wait", name: "Wait Time", type: "issue" as const },
  { id: "mix_vibe", name: "Decent Ambience", type: "positive" as const },
  { id: "mix_quality", name: "Fair Quality", type: "positive" as const },
  { id: "mix_pricing", name: "Slightly Pricey", type: "issue" as const },
];

  const allTopics = (business.topics || [])
    .map((t: any) => parseTopicItem(t))
    .filter(Boolean) as { id: string; name: string; type: "positive" | "issue" }[];

  const businessIssueTopics = allTopics.filter((t) => t.type === "issue");
  const businessPositiveTopics = allTopics.filter((t) => t.type !== "issue");

  let activeTopics: { id: string; name: string; type: "positive" | "issue" }[] = [];
  if (rating <= 2) {
    activeTopics = businessIssueTopics.length > 0
      ? [
          ...businessIssueTopics,
          ...DEFAULT_NEGATIVE_TOPICS.filter(
            (d) => !businessIssueTopics.some((b) => b.name.toLowerCase() === d.name.toLowerCase())
          ),
        ].slice(0, 6)
      : DEFAULT_NEGATIVE_TOPICS;
  } else if (rating === 3) {
    activeTopics =
      businessIssueTopics.length > 0 || businessPositiveTopics.length > 0
        ? [
            ...businessPositiveTopics.slice(0, 3),
            ...businessIssueTopics.slice(0, 3),
            ...DEFAULT_MIXED_TOPICS.filter(
              (d) => !allTopics.some((a) => a.name.toLowerCase() === d.name.toLowerCase())
            ),
          ].slice(0, 6)
        : DEFAULT_MIXED_TOPICS;
  } else {
    activeTopics =
      businessPositiveTopics.length > 0 ? businessPositiveTopics : DEFAULT_POSITIVE_TOPICS;
  }

  const allServices = (business.services || [])
    .map((s: any) => parseServiceItem(s))
    .filter(Boolean) as { id: string; name: string }[];

  return (
    <div className="min-h-screen bg-[#ECFDF5] neo-canvas-bg text-slate-900 flex flex-col justify-between items-center py-8 px-4 font-sans selection:bg-slate-900 selection:text-white">
      <div className="w-full max-w-sm mx-auto">
        {/* Brand Identity */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-5 space-y-1"
        >
          <span className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
            Google Review
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {business.name}
          </h1>
          {business.location && (
            <p className="text-xs text-slate-400 font-normal">{business.location}</p>
          )}

          {/* Mobile Step Progress Indicator */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            <div className={`h-1 rounded-full transition-all duration-300 ${step === "select" ? "w-6 bg-slate-900" : "w-2 bg-slate-300"}`} />
            <div className={`h-1 rounded-full transition-all duration-300 ${step === "review" ? "w-6 bg-slate-900" : "w-2 bg-slate-300"}`} />
          </div>
        </motion.div>

        {/* STEP 1: EXPERIENCE SELECTION */}
        <AnimatePresence mode="wait">
          {step === "select" ? (
            <motion.div
              key="step-select"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-[28px] p-5 sm:p-6 shadow-sm border border-slate-200/70 space-y-5"
            >
              {/* Star Rating with Confetti on 5 Stars */}
              <div className="text-center">
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Rate Your Visit
                </label>
                <div className="flex justify-center gap-1 sm:gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.8 }}
                      onClick={() => {
                        const prevRatingTier = rating <= 2 ? "neg" : rating === 3 ? "mix" : "pos";
                        const newRatingTier = star <= 2 ? "neg" : star === 3 ? "mix" : "pos";
                        if (prevRatingTier !== newRatingTier) {
                          setSelectedTopics([]);
                        }
                        setRating(star);
                        setToneCache({});
                        if (star === 5) {
                          try {
                            confetti({
                              particleCount: 35,
                              spread: 55,
                              origin: { y: 0.35 },
                              colors: ["#16A34A", "#22C55E", "#F59E0B"],
                            });
                          } catch {}
                        }
                      }}
                      className="p-1.5 sm:p-1 focus:outline-none transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 sm:w-7 sm:h-7 transition-colors ${
                          star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200 fill-slate-100"
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                  {rating === 5 && "⭐ 5 Stars • Excellent Experience"}
                  {rating === 4 && "⭐ 4 Stars • Very Good"}
                  {rating === 3 && "⭐ 3 Stars • Good"}
                  {rating === 2 && "⭐ 2 Stars • Fair"}
                  {rating === 1 && "⭐ 1 Star • Needs Improvement"}
                </p>

                {/* Optional Customer Choice: Private Note to Management (Never forced) */}
                {rating <= 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-2xl text-left space-y-1 mt-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Have a concern?
                      </span>
                      <Link
                        href={`/r/${slug}/feedback`}
                        className="text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-lg transition-colors inline-flex items-center gap-0.5 shrink-0"
                      >
                        Message Owner Privately ➔
                      </Link>
                    </div>
                    <p className="text-[10.5px] text-amber-800/80 leading-relaxed">
                      You can send a direct note to management, or proceed below to generate and post your review on Google.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Quick Tags / Topics */}
              {activeTopics.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2.5">
                    {rating <= 2
                      ? "What went wrong? (Optional)"
                      : rating === 3
                      ? "What was your experience? (Optional)"
                      : "Add Quick Tags"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {activeTopics.map((topic) => {
                      const isSelected = selectedTopics.includes(topic.name);
                      return (
                        <motion.button
                          key={topic.id || topic.name}
                          type="button"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => {
                            toggleTopic(topic.name);
                            setToneCache({});
                          }}
                          className={`text-xs font-medium px-3.5 py-2 rounded-xl transition-colors border flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                              : "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span>{topic.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Specific Services / Items */}
              {allServices.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2.5">
                    Items / Services (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allServices.map((service) => {
                      const isSelected = selectedServices.includes(service.name);
                      return (
                        <motion.button
                          key={service.id || service.name}
                          type="button"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => {
                            toggleService(service.name);
                            setToneCache({});
                          }}
                          className={`text-xs font-medium px-3 py-1.5 rounded-xl transition-colors border flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-slate-800 text-white border-slate-800"
                              : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3 h-3" />}
                          <span>{service.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Optional Customer Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Your Review (Optional note)
                </label>
                <textarea
                  rows={2}
                  value={customerComment}
                  onChange={(e) => {
                    setCustomerComment(e.target.value);
                    setToneCache({});
                  }}
                  placeholder={
                    rating <= 2
                      ? "Briefly tell us what happened..."
                      : rating === 3
                      ? "Share what was good and what could improve..."
                      : "Share anything specific about your experience..."
                  }
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 placeholder-slate-400 resize-none font-normal transition-all"
                />
              </div>

              {/* Inline Generation Error */}
              {genError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{genError}</span>
                </div>
              )}

              {/* Generate CTA Button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={isGenerating}
                onClick={() => handleGenerate("natural")}
                className={`w-full py-4 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                  isGenerating
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200"
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Review...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {rating <= 2
                      ? `Generate ${rating}-Star Review`
                      : rating === 3
                      ? `Generate 3-Star Review`
                      : `Generate ${rating}-Star Review`}
                  </>
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="step-review"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/70 space-y-5"
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("select")}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Adjust
                </button>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

            {/* Tone Variations Switcher */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Length & Tone
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: "short", label: "Short" },
                  { id: "natural", label: "Balanced" },
                  { id: "detailed", label: "Detailed" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    disabled={isGenerating || isRegenerating}
                    onClick={() => handleGenerate(t.id as any)}
                    className={`py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                      tone === t.id
                        ? "bg-white text-slate-900 shadow-sm font-bold scale-[1.02]"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inline Generation Error */}
            {genError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{genError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerate(tone)}
                  className="text-xs underline font-bold hover:text-rose-900 shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Editable Review Text Box */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  Your Review (Tap to edit)
                  {isGenerating && (
                    <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3 animate-pulse text-emerald-500" />
                      AI drafting...
                    </span>
                  )}
                </label>
                {isRegenerating && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <div className="w-2.5 h-2.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </span>
                )}
              </div>
              {isGenerating ? (
                <div className="w-full min-h-[104px] p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-center gap-2 animate-pulse">
                  <div className="h-3 bg-slate-200 rounded-full w-4/5" />
                  <div className="h-3 bg-slate-200 rounded-full w-full" />
                  <div className="h-3 bg-slate-200 rounded-full w-3/5" />
                </div>
              ) : (
                <textarea
                  rows={4}
                  value={generatedReview}
                  onChange={(e) => setGeneratedReview(e.target.value)}
                  disabled={isRegenerating}
                  placeholder="Type your review here..."
                  className={`w-full text-xs leading-relaxed p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none font-normal transition-opacity ${
                    isRegenerating ? "opacity-40" : "opacity-100"
                  }`}
                />
              )}
            </div>

            {/* DIRECT GOOGLE POST ACTION BUTTON */}
            <div className="space-y-2.5 pt-1">
              <motion.button
                type="button"
                whileHover={{ scale: isGenerating ? 1 : 1.03, y: isGenerating ? 0 : -1 }}
                whileTap={{ scale: isGenerating ? 1 : 0.96, y: isGenerating ? 0 : 1 }}
                disabled={isGenerating}
                onClick={handleCopyAndOpenGoogle}
                className={`w-full py-4 px-5 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                  isGenerating
                    ? "bg-emerald-700/60 cursor-not-allowed opacity-80"
                    : "bg-[#15803D] hover:bg-[#166534] cursor-pointer"
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    AI is preparing your review...
                  </>
                ) : isCopied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    Copied! Redirecting to Google...
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Post Review on Google
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </>
                )}
              </motion.button>

              {isCopied ? (
                <a
                  href={
                    business.googleReviewUrl && business.googleReviewUrl.trim().length > 0
                      ? (business.googleReviewUrl.trim().startsWith("http://") || business.googleReviewUrl.trim().startsWith("https://")
                          ? business.googleReviewUrl.trim()
                          : `https://${business.googleReviewUrl.trim()}`)
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name + (business.location ? " " + business.location : ""))}`
                  }
                  className="block text-center text-xs font-bold text-[#15803D] hover:underline pt-1 animate-pulse"
                >
                  Click here if Google doesn't open automatically →
                </a>
              ) : (
                <p className="text-center text-[11px] text-slate-400">
                  Review is copied automatically. Simply paste and post on Google!
                </p>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      <div className="text-center mt-8 space-y-1">
        <p className="text-[11px] text-slate-400 font-medium block">
          Powered by SmartReview
        </p>
      </div>
    </div>
  );
}
