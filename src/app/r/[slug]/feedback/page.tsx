"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, CheckCircle2, ArrowLeft, ExternalLink, MessageSquare, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PrivateFeedbackPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [issueTopics, setIssueTopics] = useState<string[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBusiness() {
      try {
        const res = await fetch(`/api/business/${slug}`);
        const data = await res.json();
        if (data.success && data.business) {
          setBusinessName(data.business.name);
          const rawUrl = data.business.googleReviewUrl?.trim() || "";
          setGoogleReviewUrl(
            rawUrl.length > 0
              ? (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`)
              : ""
          );

          const issues = (data.business.topics || [])
            .filter((t: any) => t.type === "issue")
            .map((t: any) => t.name);
          setIssueTopics(
            issues.length > 0
              ? issues
              : ["Slow Service", "Long Wait Time", "Subpar Quality", "Staff Behavior", "High Pricing", "Cleanliness Issue"]
          );
        }
      } catch {}
    }

    if (slug) {
      loadBusiness();
    }
  }, [slug]);

  const toggleIssue = (topic: string) => {
    setSelectedIssues((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug: slug,
          message,
          customerName: name || undefined,
          customerPhone: phone || undefined,
          issueTopics: selectedIssues,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || "Failed to submit feedback. Please try again.");
      }
    } catch {
      setError("An error occurred while sending your note. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECFDF5] neo-canvas-bg text-slate-900 flex flex-col justify-between items-center py-8 px-4 font-sans selection:bg-slate-900 selection:text-white">
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-4">
          <Link
            href={`/r/${slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to review page
          </Link>
        </div>

        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-200/80 space-y-5">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner mb-2">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Direct Note to Management
                </h1>
                <p className="text-xs text-slate-500">
                  {businessName ? `Share your private feedback with ${businessName}` : "Share your private feedback"}
                </p>
              </div>

              {issueTopics.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    What area can we improve? (Optional)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {issueTopics.map((topic) => {
                      const isSelected = selectedIssues.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => toggleIssue(topic)}
                          className={`text-xs px-2.5 py-1.5 rounded-xl border font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                              : "bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what happened so management can address it..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder-slate-400 resize-none font-normal"
                />
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Your Name (Optional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone Number for Follow-up (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
              >
                {submitting ? "Sending note..." : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Private Message to Management
                  </>
                )}
              </button>

              {/* Explicit customer choice: Unconditional access to public Google reviews */}
              {googleReviewUrl && (
                <div className="pt-2 text-center border-t border-slate-100">
                  <p className="text-[11px] text-slate-500">
                    Prefer to post publicly on Google directly?{" "}
                    <a
                      href={googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-0.5"
                    >
                      Post on Google <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </p>
                </div>
              )}
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-900">Thank You for Letting Us Know</h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  We've received your note and will review it with our team to address it promptly.
                </p>
              </div>

              {googleReviewUrl && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-center space-y-1">
                  <p className="text-[11px] text-slate-500">You can also leave a public Google review anytime:</p>
                  <a
                    href={googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Open Google Review <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="pt-2">
                <Link
                  href={`/r/${slug}`}
                  className="inline-block text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors"
                >
                  Return to Main Page
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
