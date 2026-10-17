"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Printer,
  SlidersHorizontal,
  MessageSquare,
  ExternalLink,
  QrCode,
  LogOut,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Headphones,
  Eye,
  ChevronDown,
  Check,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import WelurikLogo from "@/components/Logo";
import { CheckoutButton } from "@/components/CheckoutButton";
import { CustomerCareModal } from "@/components/CustomerCareModal";
import BirthdayPopCelebration, { triggerBirthdayPop } from "@/components/BirthdayPopCelebration";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [loadingBusiness, setLoadingBusiness] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Super Admin Client Inspection / Impersonation States
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedSlug, setImpersonatedSlug] = useState<string | null>(null);
  const [impersonatedBusinessName, setImpersonatedBusinessName] = useState<string | null>(null);
  const [impersonatedClientEmail, setImpersonatedClientEmail] = useState<string | null>(null);
  const [clientList, setClientList] = useState<{ slug: string; name: string }[]>([]);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  // Paywall Promo Code States
  const [paywallPromo, setPaywallPromo] = useState("");
  const [paywallLoading, setPaywallLoading] = useState(false);
  const [paywallSuccess, setPaywallSuccess] = useState("");
  const [paywallError, setPaywallError] = useState("");
  const [showPaywallPromo, setShowPaywallPromo] = useState(false);
  const [showCustomerCare, setShowCustomerCare] = useState(false);


  const handleApplyPaywallPromo = async () => {
    if (!paywallPromo.trim()) return;
    setPaywallLoading(true);
    setPaywallError("");
    setPaywallSuccess("");

    try {
      const res = await fetch("/api/payment/promo-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: paywallPromo,
          businessSlug: business?.slug,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPaywallSuccess(data.message || "🎉 VIP Access Activated!");
        triggerBirthdayPop({
          title: "VIP Pro Access Activated! 🚀",
          message: "All pro features, analytics, and standee templates are now unlocked!",
          emoji: "🎉",
        });
        setBusiness((prev: any) => ({
          ...(prev || {}),
          isPro: true,
          planName: "VIP Pro License",
        }));
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("welurik_pro_activated", "true");
            sessionStorage.removeItem("welurik_dashboard_cache");
          } catch {}
        }
        setTimeout(() => {
          window.location.reload();
        }, 1800);
      } else {
        setPaywallError(data.error || "Invalid or expired promo code.");
      }
    } catch {
      setPaywallError("Failed to apply promo code. Please try again.");
    } finally {
      setPaywallLoading(false);
    }
  };

  useEffect(() => {
    const fetchBusiness = () => {
      fetch("/api/business/me", { cache: "no-store" })
        .then((r) => {
          if (r.status === 401) {
            router.push("/login");
            return null;
          }
          return r.json();
        })
        .then((d) => {
          if (d && d.success && d.business) {
            setBusiness(d.business);
            setUnreadCount(d.unreadFeedbackCount || 0);
            setIsSuperAdmin(Boolean(d.isSuperAdmin));
            setIsImpersonating(Boolean(d.isImpersonating));
            setImpersonatedSlug(d.impersonatedSlug || null);
            setImpersonatedBusinessName(d.impersonatedBusinessName || null);
            setImpersonatedClientEmail(d.impersonatedClientEmail || null);

            if (d.isSuperAdmin) {
              fetch("/api/admin/impersonate")
                .then((res) => res.json())
                .then((impData) => {
                  if (impData.success && Array.isArray(impData.clients)) {
                    setClientList(impData.clients);
                  }
                })
                .catch(() => {});
            }

            if (d.business.isPro !== true && typeof window !== "undefined") {
              try {
                sessionStorage.removeItem("welurik_dashboard_cache");
                sessionStorage.removeItem("welurik_pro_activated");
              } catch {}
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          setLoadingBusiness(false);
        });
    };

    fetchBusiness();
    window.addEventListener("refresh_business", fetchBusiness);
    return () => window.removeEventListener("refresh_business", fetchBusiness);
  }, [router, pathname]);

  const handleExitImpersonation = async (returnToVault: boolean = false) => {
    try {
      await fetch("/api/admin/impersonate", { method: "DELETE" });
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem("welurik_dashboard_cache");
        } catch {}
      }
      if (returnToVault) {
        router.push("/admin-vault");
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      if (returnToVault) router.push("/admin-vault");
    }
  };

  const handleSwitchClient = async (targetSlug: string) => {
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: targetSlug }),
      });
      if (res.ok) {
        if (typeof window !== "undefined") {
          try {
            sessionStorage.removeItem("welurik_dashboard_cache");
          } catch {}
        }
        setSwitcherOpen(false);
        window.location.href = "/dashboard";
      }
    } catch {}
  };


  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem("welurik_dashboard_cache");
        } catch {}
      }
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    count?: number;
  }

  const navItems: NavItem[] = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Standee Studio",
      href: "/qr-studio",
      icon: Printer,
      badge: "Print Ready",
    },
    {
      label: "Keywords & Topics",
      href: "/settings",
      icon: SlidersHorizontal,
    },
    {
      label: "Private Feedback",
      href: "/feedback",
      icon: MessageSquare,
      count: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  const origin = typeof window !== "undefined" ? window.location.origin : "https://review.welurik.com";
  const publicReviewUrl = business?.slug ? `${origin}/r/${business.slug}` : "#";

  if (pathname === "/onboarding") {
    return (
      <>
        {children}
        {/* Floating Customer Care Trigger Button during onboarding */}
        <button
          type="button"
          onClick={() => setShowCustomerCare(true)}
          className="fixed bottom-6 right-6 z-40 bg-slate-900 hover:bg-slate-800 text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-xl border border-slate-700/60 flex items-center gap-2 text-xs font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 group no-print"
          title="Direct Customer Care"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Headphones className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span>Customer Care</span>
        </button>

        <CustomerCareModal
          isOpen={showCustomerCare}
          onClose={() => setShowCustomerCare(false)}
          businessName={business?.name}
        />
      </>
    );
  }


  return (
    <div className="min-h-screen bg-[#ECFDF5] flex font-sans selection:bg-slate-900 selection:text-white">
      {/* LEFT SIDEBAR (Linear / Vercel style) */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 shrink-0 hidden md:flex no-print">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="px-2 py-1.5 flex items-center">
            <WelurikLogo className="h-9 sm:h-[48px]" />
          </div>

          {/* Active Business Switcher Card */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Business</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {business?.name ? business.name.charAt(0) : "B"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{business?.name || "Loading..."}</p>
                <p className="text-[10px] text-slate-400 capitalize truncate">{business?.category || "Workspace"}</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workspace
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isActive ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.count && (
                    <span
                      className={`text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${
                        isActive ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-600 border border-rose-200"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Direct Customer Care Action */}
            <button
              type="button"
              onClick={() => setShowCustomerCare(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/80 transition-all cursor-pointer group mt-3 shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Headphones className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>Customer Care</span>
              </div>
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-200/60 px-1.5 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Call / WhatsApp
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom CTA / Quick Customer Link & Logout */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          {business?.slug && (
            <a
              href={publicReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-600" />
              <span>Live Customer Link</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

          {isSuperAdmin && (
            <Link
              href="/admin-vault"
              className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold flex items-center justify-between transition-all shadow-xs"
              title="Return to Super Admin Vault"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Super Admin Vault</span>
              </div>
              <ArrowRight className="w-3 h-3 text-amber-700" />
            </Link>
          )}

          {isImpersonating && (
            <button
              type="button"
              onClick={() => handleExitImpersonation(true)}
              className="w-full py-2 px-3 bg-black hover:bg-slate-800 text-amber-300 border border-black rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Exit Inspection Mode</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Super Admin Client Inspection Banner */}
        {isImpersonating && (
          <div className="bg-amber-400 border-b-2 border-black text-black px-3.5 sm:px-6 py-2 sticky top-0 z-50 shadow-[0_3px_0px_#000000] no-print">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="bg-black text-amber-300 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <Eye className="w-3 h-3 text-amber-300" /> Super Admin View
                </span>
                <span className="text-xs font-black truncate">
                  Inspecting Dashboard: <span className="underline decoration-black">{business?.name || impersonatedBusinessName || "Client"}</span>
                  {impersonatedClientEmail && (
                    <span className="text-[11px] font-medium text-black/75 ml-1 hidden sm:inline">
                      ({impersonatedClientEmail})
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Switcher Dropdown */}
                {clientList.length > 0 && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setSwitcherOpen(!switcherOpen)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 text-black border border-black rounded-lg text-xs font-bold shadow-[1px_1px_0px_#000000] flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Switch Client ({clientList.length})</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {switcherOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-64 max-h-72 overflow-y-auto bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000000] py-1 z-50 divide-y divide-slate-100">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                          Select Client Dashboard
                        </div>
                        {clientList.map((c) => (
                          <button
                            key={c.slug}
                            type="button"
                            onClick={() => handleSwitchClient(c.slug)}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition-colors cursor-pointer ${
                              c.slug === business?.slug
                                ? "font-black bg-emerald-100/70 text-emerald-900"
                                : "font-medium text-slate-900"
                            }`}
                          >
                            <span className="truncate">{c.name}</span>
                            {c.slug === business?.slug && (
                              <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleExitImpersonation(true)}
                  className="px-3 py-1 bg-black hover:bg-slate-800 text-white border border-black rounded-lg text-xs font-black shadow-[1.5px_1.5px_0px_#000000] flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3 text-amber-300" />
                  <span>Exit to Admin Vault</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Header Bar */}
        <header className="md:hidden bg-white border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between sticky top-0 z-20 no-print gap-2">

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0">
              {business?.name ? business.name.charAt(0) : "W"}
            </div>
            <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">{business?.name || "Welurik"}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowCustomerCare(true)}
              className="text-xs font-bold px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 cursor-pointer transition-colors"
              title="Direct Customer Care"
            >
              <Headphones className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px]">Support</span>
            </button>
            {business?.isPro === true && (
              <Link
                href="/qr-studio"
                className="text-xs font-semibold px-2 py-1.5 rounded-lg bg-slate-900 text-white flex items-center gap-1"
                title="Print QR Standees"
              >
                <QrCode className="w-3 h-3" />
                <span className="hidden xs:inline">QR</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-xs font-bold px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 cursor-pointer transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{loggingOut ? "..." : "Logout"}</span>
            </button>
          </div>
        </header>


        {/* Unpaid Account Paywall Guard */}
        {loadingBusiness && !business && pathname !== "/onboarding" ? (
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2.5 text-slate-400">
              <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-slate-500">Loading workspace...</p>
            </div>
          </div>
        ) : business &&
        business.isPro !== true &&
        !isSuperAdmin &&
        pathname !== "/onboarding" ? (

          <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[32px] p-7 sm:p-8 text-center border border-slate-200/80 shadow-[0_20px_50px_rgba(15,23,42,0.06)] space-y-5">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Instant Lifetime Access
                </div>
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">Activate Your Workspace</h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Complete your one-time payment of <strong>₹1,999 only</strong> to unlock your analytics dashboard, QR standee studio, and start getting 5-star Google reviews.
                </p>
              </div>

              {/* Ultra-Clean Modern Pricing Card */}
              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-5 space-y-4 text-left shadow-sm">
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

                <div className="border-t border-slate-200/60 pt-2.5 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-900">Rank #1 on Google Maps & beat local competitors</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-900">10x More 5-star reviews (AI writes them in 5 secs)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-900">Turn everyday footfall into repeat paying customers</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-900">Zero monthly fees • Pays for itself with 1 customer</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="text-slate-500 font-semibold">Total Payable:</span>
                  <span className="text-base font-black text-slate-950">₹1,999 only</span>
                </div>
              </div>

              {/* VIP Promo Code Option */}
              <div className="bg-slate-50/80 border border-dashed border-slate-300/80 rounded-2xl p-3.5 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Have a VIP Promo / Partner Code?
                  </span>
                  {!showPaywallPromo && (
                    <button
                      type="button"
                      onClick={() => setShowPaywallPromo(true)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                    >
                      Enter Code
                    </button>
                  )}
                </div>

                {showPaywallPromo && (
                  <div className="space-y-2 pt-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={paywallPromo}
                        onChange={(e) => setPaywallPromo(e.target.value.toUpperCase())}
                        placeholder="Enter promo code"
                        className="flex-1 text-xs uppercase px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                      />
                      <button
                        type="button"
                        disabled={paywallLoading || !paywallPromo.trim()}
                        onClick={handleApplyPaywallPromo}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {paywallLoading ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>

                    {paywallSuccess && (
                      <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>{paywallSuccess}</span>
                      </p>
                    )}

                    {paywallError && (
                      <p className="text-xs font-medium text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                        {paywallError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <CheckoutButton
                planType="lifetime"
                buttonText="Pay ₹1,999 only with UPI / Card & Unlock"
                className="w-full py-4 text-xs font-black rounded-xl"
              />

              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Secured by Razorpay • UPI (GPay, PhonePe), Cards & NetBanking</span>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <span>Facing any problem or question?</span>
                <button
                  type="button"
                  onClick={() => setShowCustomerCare(true)}
                  className="font-bold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1 cursor-pointer"
                >
                  <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                  Call or WhatsApp Support
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</div>
        )}

        {/* Mobile Fixed Bottom Navigation Bar - only active when business is Pro */}
        {business?.isPro === true && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-xl border-t border-slate-200/80 px-1 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around z-30 no-print shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const shortLabel =
                item.label === "Standee Studio"
                  ? "Standee"
                  : item.label === "Keywords & Topics"
                  ? "Keywords"
                  : item.label === "Private Feedback"
                  ? "Feedback"
                  : item.label;

              return (
                <motion.div key={item.href} whileTap={{ scale: 0.88 }} className="flex-1">
                  <Link
                    href={item.href}
                    className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
                      isActive ? "text-slate-950 font-bold" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <div className="relative">
                      <Icon className={`w-4 h-4 ${isActive ? "text-slate-950 stroke-[2.5]" : "text-slate-400"}`} />
                      {item.count && (
                        <span className="absolute -top-1 -right-2 text-[8.5px] font-black w-3.5 h-3.5 bg-rose-500 text-white rounded-full flex items-center justify-center">
                          {item.count}
                        </span>
                      )}
                    </div>
                    <span className="text-[9.5px] mt-0.5 tracking-tight truncate max-w-[58px] text-center">
                      {shortLabel}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
            {business?.slug && (
              <motion.div whileTap={{ scale: 0.88 }} className="flex-1">
                <a
                  href={publicReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-emerald-600 hover:text-emerald-700"
                >
                  <QrCode className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  <span className="text-[9.5px] mt-0.5 text-emerald-600 font-bold truncate max-w-[58px] text-center">
                    Funnel
                  </span>
                </a>
              </motion.div>
            )}
          </nav>
        )}

        {/* Floating Customer Care Trigger Button */}
        <button
          type="button"
          onClick={() => setShowCustomerCare(true)}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30 bg-slate-900 hover:bg-slate-800 text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-xl border border-slate-700/60 flex items-center gap-2 text-xs font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 group no-print"
          title="Direct Customer Care"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Headphones className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span>Customer Care</span>
        </button>

        {/* Customer Care Modal (Call or WhatsApp directly) */}
        <CustomerCareModal
          isOpen={showCustomerCare}
          onClose={() => setShowCustomerCare(false)}
          businessName={business?.name}
        />

        {/* Global Birthday Pop & Sky Fireworks Celebration System */}
        <BirthdayPopCelebration />
      </div>
    </div>
  );
}

