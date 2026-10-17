"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Star,
  Printer,
  ChevronRight,
  Calendar,
  ArrowUpRight,
  SlidersHorizontal,
  CheckCircle2,
  Loader2,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardData {
  business: {
    id: string;
    name: string;
    slug: string;
    category: string;
    location?: string;
    googleReviewUrl: string;
    brandColor?: string;
    aiCallsThisMonth: number;
    monthlyAiQuota: number;
    isPro?: boolean;
    planName?: string;
  };
  metrics: {
    totalScans: number;
    reviewsGenerated: number;
    googleClicks: number;
    conversionRate: string;
  };
  topTopics: { name: string; count: number; percentage: number }[];
  recentReviews: {
    id: string;
    rating: number;
    selectedTopics: string[];
    selectedServices: string[];
    generatedReview: string;
    status: string;
    createdAt: string;
  }[];
  unreadFeedbackCount: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [visibleReviewCount, setVisibleReviewCount] = useState<number>(20);
  const router = useRouter();

  const loadDashboard = async (bustCache = false) => {
    if (bustCache) setIsRefreshing(true);
    try {
      const url = bustCache ? `/api/business/me?_t=${Date.now()}` : "/api/business/me";
      const res = await fetch(url);
      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const bData = await res.json();

      if (bData.success) {
        if (!bData.business) {
          return;
        }

        const biz = bData.business;
        const reviews = bData.recentReviews || [];

        // Compute topic frequencies from real review sessions
        const topicCounts: { [key: string]: number } = {};
        reviews.forEach((r: any) => {
          (r.selectedTopics || []).forEach((t: string) => {
            topicCounts[t] = (topicCounts[t] || 0) + 1;
          });
        });

        const totalReviews = reviews.length || 1;
        const topTopics = Object.entries(topicCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({
            name,
            count,
            percentage: Math.min(100, Math.round((count / totalReviews) * 100)),
          }));

        const dashboardPayload: DashboardData = {
          business: biz,
          metrics: bData.metrics || {
            totalScans: 0,
            reviewsGenerated: reviews.length,
            googleClicks: 0,
            conversionRate: "0%",
          },
          topTopics: topTopics.length > 0 ? topTopics : [
            { name: "Service Quality", count: 0, percentage: 0 },
            { name: "Staff Hospitality", count: 0, percentage: 0 },
            { name: "Speed & Ease", count: 0, percentage: 0 },
          ],
          recentReviews: reviews,
          unreadFeedbackCount: bData.unreadFeedbackCount || 0,
        };

        setData(dashboardPayload);
        try {
          sessionStorage.setItem("welurik_dashboard_cache", JSON.stringify(dashboardPayload));
        } catch {}
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Fast hydration from session cache without causing SSR mismatch
    try {
      const cached = sessionStorage.getItem("welurik_dashboard_cache");
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false);
      }
    } catch {}

    loadDashboard(true);
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading your live dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs text-center max-w-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">Setting up your workspace</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We could not load your workspace metrics right now. Please refresh or update your settings.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
          >
            Refresh Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { business, metrics, topTopics, recentReviews, unreadFeedbackCount } = data;
  const origin = typeof window !== "undefined" ? window.location.origin : "https://review.welurik.com";
  const publicReviewUrl = `${origin}/r/${business.slug}`;
  const rawGmbUrl = business.googleReviewUrl?.trim() || "";
  const safeGoogleReviewUrl = rawGmbUrl
    ? (rawGmbUrl.startsWith("http://") || rawGmbUrl.startsWith("https://") ? rawGmbUrl : `https://${rawGmbUrl}`)
    : "#";

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 md:p-8 shadow-xl shadow-slate-900/10">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-white/10 shrink-0">
              Live Funnel Active
            </span>
            <button
              onClick={() => loadDashboard(true)}
              disabled={isRefreshing}
              title="Refresh live metrics"
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs font-medium text-slate-300 capitalize shrink-0">{business.category}</span>
            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs font-semibold text-amber-300 inline-flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 shrink-0">
              <Star className="w-3 h-3 fill-amber-300" /> {business.planName || "Lifetime Pro Active"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight truncate">{business.name}</h1>
          <p className="text-xs text-slate-400">
            {business.location ? `${business.location} • ` : ""}
            AI-driven QR review conversion engine
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 shrink-0">
          <Link
            href="/qr-studio"
            className="w-full sm:w-auto px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Standees</span>
          </Link>
          <a
            href={publicReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Open Customer Link</span>
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Scans */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600 truncate">Total QR Scans</span>
            <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900">{metrics.totalScans}</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">In-store customer scans</p>
        </div>

        {/* AI Reviews Generated */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600 truncate">AI Generated</span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900">{metrics.reviewsGenerated}</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">AI drafted in 30s</p>
        </div>

        {/* Real Google Clicks */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600 truncate">Google Handoffs</span>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900">{metrics.googleClicks}</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">Sent to Google Maps</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-600 truncate">Scan to Google</span>
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 shrink-0" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900">{metrics.conversionRate}</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">Industry avg: 3-5%</p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Reviews Generated (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200/80 p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Recent Customer Reviews</h2>
                {recentReviews.length > 0 && (
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                    {recentReviews.length} total
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Recent reviews generated by your happy customers</p>
            </div>
            {safeGoogleReviewUrl !== "#" && (
              <a
                href={safeGoogleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View on Google</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {recentReviews.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
              <Sparkles className="w-6 h-6 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">No reviews generated yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Print your standees in the Standee Studio and place them near your checkout counter!
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {recentReviews.slice(0, visibleReviewCount).map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-2xl space-y-2.5 transition-all hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-amber-400">
                        {[...Array(Math.max(1, Math.min(5, Number(rev.rating) || 5)))].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 ml-1">Verified {rev.rating || 5}-Star</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {rev.createdAt}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          rev.status === "opened_google"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                        }`}
                      >
                        {rev.status === "opened_google" ? "Posted to Google" : "Drafted by AI"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-normal">"{rev.generatedReview}"</p>

                  {((rev.selectedTopics && rev.selectedTopics.length > 0) || (rev.selectedServices && rev.selectedServices.length > 0)) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {(rev.selectedTopics || []).map((topic) => (
                        <span
                          key={topic}
                          className="text-[10px] bg-white border border-slate-200 text-slate-600 font-medium px-2 py-0.5 rounded-md"
                        >
                          {topic}
                        </span>
                      ))}
                      {(rev.selectedServices || []).map((svc) => (
                        <span
                          key={svc}
                          className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium px-2 py-0.5 rounded-md"
                        >
                          {svc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {recentReviews.length > visibleReviewCount && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    onClick={() => setVisibleReviewCount((prev) => prev + 25)}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Load More Reviews (Showing {Math.min(visibleReviewCount, recentReviews.length)} of {recentReviews.length})
                  </button>
                  <button
                    onClick={() => setVisibleReviewCount(recentReviews.length)}
                    className="w-full sm:w-auto px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Show All {recentReviews.length}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Praised Topics & Feedback Inbox (1 Col) */}
        <div className="space-y-6">
          {/* Most Praised Topics */}
          <div className="bg-white rounded-[24px] border border-slate-200/80 p-6 space-y-4 shadow-xs">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900">Most Praised Aspects</h3>
              <p className="text-[11px] text-slate-400">Keywords customers select most often</p>
            </div>

            <div className="space-y-3">
              {topTopics.map((topic) => (
                <div key={topic.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 text-[11px]">{topic.name}</span>
                    <span className="text-slate-400 text-[10px]">{topic.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(topic.percentage, 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href="/settings"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 transition-all"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Edit Custom Keywords</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feedback Inbox Preview Card */}
          <div className="bg-white rounded-[24px] border border-slate-200/80 p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Private Grievance Inbox</span>
              {unreadFeedbackCount > 0 ? (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                  {unreadFeedbackCount} unread
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  Inbox Clear
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Customers who choose to message management privately submit their notes directly to your private inbox.
            </p>
            <Link
              href="/feedback"
              className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all block text-center shadow-xs"
            >
              View Private Feedback ({unreadFeedbackCount})
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
