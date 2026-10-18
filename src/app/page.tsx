"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Sparkles,
  CheckCircle2,
  Printer,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Play,
  Pause,
  Volume2,
  VolumeX,
  User,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import WelurikLogo from "@/components/Logo";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [pricingDropdownOpen, setPricingDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pricingCarouselRef = useRef<HTMLDivElement>(null);
  const [activePricingSlide, setActivePricingSlide] = useState(0);
  const [isPricingInteracting, setIsPricingInteracting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentUser, setCurrentUser] = useState<{ email?: string; businessSlug?: string } | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Check user authentication status on landing page
  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.authenticated && data?.user) {
          setCurrentUser(data.user);
        } else if (isMounted) {
          setCurrentUser(null);
        }
      })
      .catch(() => {
        if (isMounted) setCurrentUser(null);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setCurrentUser(null);
      setUserDropdownOpen(false);
      window.location.href = "/login";
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPricingDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-scroll pricing cards carousel on mobile (< 768px)
  useEffect(() => {
    if (isPricingInteracting) return;

    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.innerWidth >= 768) return;

      const container = pricingCarouselRef.current;
      if (!container) return;

      setActivePricingSlide((prev) => {
        const nextSlide = (prev + 1) % 4;
        const card = container.children[nextSlide] as HTMLElement;
        if (card) {
          const offsetLeft =
            card.offsetLeft -
            container.offsetLeft -
            (container.clientWidth - card.clientWidth) / 2;
          container.scrollTo({
            left: Math.max(0, offsetLeft),
            behavior: "smooth",
          });
        }
        return nextSlide;
      });
    }, 3800);

    return () => clearInterval(interval);
  }, [isPricingInteracting]);

  const handlePricingScroll = () => {
    const container = pricingCarouselRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const card = container.children[0] as HTMLElement;
    const cardWidth = card ? card.clientWidth + 20 : container.clientWidth * 0.85;
    const index = Math.round(scrollLeft / (cardWidth || 1));
    const clampedIndex = Math.max(0, Math.min(3, index));
    if (clampedIndex !== activePricingSlide) {
      setActivePricingSlide(clampedIndex);
    }
  };

  const scrollToPricingSlide = (index: number) => {
    setActivePricingSlide(index);
    setIsPricingInteracting(true);
    const container = pricingCarouselRef.current;
    if (!container) return;
    const card = container.children[index] as HTMLElement;
    if (card) {
      const offsetLeft =
        card.offsetLeft -
        container.offsetLeft -
        (container.clientWidth - card.clientWidth) / 2;
      container.scrollTo({
        left: Math.max(0, offsetLeft),
        behavior: "smooth",
      });
    }
    setTimeout(() => setIsPricingInteracting(false), 5000);
  };

  // Video starts PAUSED - Plays with full unmuted sound when user clicks Play
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.muted = isMuted;
      video.volume = 1.0;
      video.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Play error:", err);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !video.muted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Does this violate Google's Review Gating policies?",
      a: "No. Welurik Review is 100% Google policy compliant. All customers have direct access to leave a Google review regardless of their rating. We provide a private feedback option for direct feedback without restricting anyone from posting on Google.",
    },
    {
      q: "How does this boost my Google Maps (GMB) ranking?",
      a: "Google's algorithm prioritizes businesses with frequent, detailed reviews that naturally mention key services (e.g., 'Specialty Coffee', 'Keratin Treatment', 'Ceramic Coating'). Our AI naturally weaves your configured service keywords into the customer's review, signaling local relevance to Google's ranking engine.",
    },
    {
      q: "How much does the AI cost to run monthly?",
      a: "Virtually ₹0. The system uses a high-speed hybrid engine: local NLP phrase templates that cost ₹0, backed by ultra-affordable Google Gemini Flash (~₹0.003 per generation). There are zero hidden API bills.",
    },
    {
      q: "Can I print standees for multiple tables or counters?",
      a: "Yes! You get unlimited access to the Standee Studio. You can download and print high-resolution QR standees formatted for standard 4\" x 6\" acrylic frames, foldable table tents, or counter stickers for as many tables as you have.",
    },
    {
      q: "How does the pricing work?",
      a: "Transparent, upfront plans with zero hidden fees: 1 Month (₹199), 3 Months (₹574), 6 Months (₹1,099), or 1 Year (₹2,000). You get full software access, unlimited QR standee generation, and AI review assistant for your selected duration.",
    },
  ];

  return (
    <div className="neo-canvas-bg min-h-screen text-[#0C0E14] font-sans selection:bg-[#15803D] selection:text-white relative overflow-x-hidden">
      
      {/* Active Neo-Grid Background */}
      <div className="neo-grid-overlay absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-75" />
      <div className="absolute top-[2%] right-[-5%] sm:right-[5%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-[#bbf7d0]/40 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[8%] left-[-10%] sm:left-[2%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#dcfce7]/50 rounded-full blur-[90px] sm:blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[50%] right-[5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#bbf7d0]/30 rounded-full blur-[110px] pointer-events-none -z-10" />

      {/* 
        ========================================================================
        FLOATING STADIUM PILL NAVBAR
        ========================================================================
      */}
      <div className="w-full max-w-[1080px] mx-auto px-3.5 sm:px-4 pt-3.5 sm:pt-6 z-40 relative">
        <motion.header
          initial={{ y: -25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full bg-white border-2 border-black rounded-full px-3.5 sm:px-6 py-2 sm:py-2.5 shadow-[3px_3px_0px_#000000] sm:shadow-[4px_4px_0px_#000000] flex items-center justify-between"
        >
          {/* Brand Logo */}
          <Link href="/" className="group hover:opacity-90 transition-opacity flex items-center">
            <WelurikLogo className="h-7 sm:h-9" />
          </Link>

          {/* Action / Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Admin Dashboard Option */}
            <Link
              href="/dashboard"
              className="text-xs sm:text-[14px] font-bold text-neutral-800 hover:text-black transition-colors px-2 sm:px-3 py-1.5"
            >
              Admin Dashboard
            </Link>

            {/* When NOT logged in: Show Get Started button */}
            {!currentUser && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/signup"
                  className="inline-flex text-xs sm:text-[13px] font-bold text-white bg-black hover:bg-neutral-800 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full border border-black shadow-[2px_2px_0px_#000000] transition-all"
                >
                  Get Started
                </Link>
              </motion.div>
            )}

            {/* When LOGGED IN: Remove Get Started, Show Profile Avatar with Dropdown */}
            {currentUser && (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#15803D] text-white font-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000000] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={currentUser.email || "Profile"}
                  aria-label="User profile menu"
                >
                  {currentUser.email ? (
                    <span className="text-xs sm:text-sm font-black uppercase">
                      {currentUser.email.charAt(0)}
                    </span>
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2.5 w-52 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000000] py-1.5 z-50 overflow-hidden"
                    >
                      <div className="px-3.5 py-2 border-b border-black/10 bg-neutral-50">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs font-bold text-black truncate">{currentUser.email || "User"}</p>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-neutral-800 hover:bg-neutral-100 hover:text-black transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#15803D]" />
                        <span>Dashboard</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer border-t border-black/10"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.header>
      </div>

      {/* 
        ========================================================================
        HERO SECTION (Optimized Mobile Flow + Desktop Power)
        ========================================================================
      */}
      <section className="w-full max-w-[1140px] mx-auto px-4 sm:px-8 pt-12 sm:pt-16 md:pt-20 pb-10 sm:pb-20 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
          
          {/* LEFT COLUMN: Typography & CTAs (Tight & Punchy on Mobile) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left pr-0 lg:pr-4">
            
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[26px] xs:text-[34px] sm:text-5xl lg:text-[60px] font-black text-black tracking-[-0.035em] leading-[1.1] sm:leading-[1.04]"
            >
              Turn Happy Customers <br className="hidden xs:inline" />
              into <span className="text-[#15803D] underline decoration-4 decoration-[#15803D]/30">5-Star Reviews</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-[13px] sm:text-base lg:text-[17px] text-slate-700 font-medium leading-[1.5] sm:leading-[1.6] max-w-[510px] mx-auto lg:mx-0"
            >
              AI-powered QR standees that eliminate customer writer's block and multiply your Google Maps reviews in 30 seconds.
            </motion.p>

            {/* Visual Standee Card for Mobile & Tablet */}
            <div className="lg:hidden p-3 bg-gradient-to-r from-emerald-50 via-white to-amber-50 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center gap-3 text-left my-2">
              <img
                src="/images/hero-standee-badge.jpg"
                alt="4x6 Table Standee"
                className="w-16 h-16 rounded-xl border-2 border-black object-cover shrink-0 shadow-[1px_1px_0px_#000000]"
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1">
                  <span className="text-[9.5px] font-black uppercase tracking-wider bg-[#15803D] text-white px-2 py-0.5 rounded-md">
                    Print-Ready
                  </span>
                </div>
                <p className="text-xs font-black text-slate-900 truncate">4" x 6" Acrylic Table Standee</p>
                <p className="text-[10.5px] text-slate-600 font-medium">Place on tables or billing counter • Scan in 30s</p>
              </div>
            </div>

            {/* Clean Mobile & Desktop CTAs with Tactile Spring Interaction */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1.5"
            >
              {/* Dropdown Menu for First Pricing Place */}
              <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97, y: 1 }}
                  className="w-full sm:w-auto"
                >
                  <button
                    type="button"
                    onClick={() => setPricingDropdownOpen(!pricingDropdownOpen)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 bg-[#15803D] hover:bg-[#166534] text-white rounded-full text-sm sm:text-[15px] font-black border-2 border-black shadow-[3px_3px_0px_#000000] sm:shadow-[4px_4px_0px_#000000] transition-all cursor-pointer text-center"
                    aria-expanded={pricingDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span>Get this at 199</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        pricingDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </motion.div>

                {/* Dropdown Options Popover */}
                <AnimatePresence>
                  {pricingDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute left-0 sm:left-0 right-0 sm:right-auto sm:w-[320px] mt-2.5 bg-white border-2 border-black rounded-2xl p-2.5 shadow-[5px_5px_0px_#000000] z-50 space-y-1.5 text-left"
                    >
                      {/* Option 1: At 199 for 1 month */}
                      <Link
                        href="/signup?plan=1m"
                        onClick={() => setPricingDropdownOpen(false)}
                        className="group flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50 border border-transparent hover:border-black/10 transition-all cursor-pointer"
                      >
                        <div>
                          <p className="text-xs sm:text-[13px] font-black text-black group-hover:text-[#15803D] transition-colors">
                            At 199 for 1 month
                          </p>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            ₹199/mo • 1 Month Access
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#15803D] group-hover:translate-x-1 transition-all shrink-0" />
                      </Link>

                      {/* Option 2: At 574 for 3 months */}
                      <Link
                        href="/signup?plan=3m"
                        onClick={() => setPricingDropdownOpen(false)}
                        className="group flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50 border border-transparent hover:border-black/10 transition-all cursor-pointer"
                      >
                        <div>
                          <p className="text-xs sm:text-[13px] font-black text-black group-hover:text-[#15803D] transition-colors">
                            At 574 for 3 months
                          </p>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            ₹191/mo • 3 Months Access
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#15803D] group-hover:translate-x-1 transition-all shrink-0" />
                      </Link>

                      {/* Option 3: At 1,099 for 6 months */}
                      <Link
                        href="/signup?plan=6m"
                        onClick={() => setPricingDropdownOpen(false)}
                        className="group flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50 border border-transparent hover:border-black/10 transition-all cursor-pointer"
                      >
                        <div>
                          <p className="text-xs sm:text-[13px] font-black text-black group-hover:text-[#15803D] transition-colors">
                            At 1,099 for 6 months
                          </p>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            ₹183/mo • 6 Months Access
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#15803D] group-hover:translate-x-1 transition-all shrink-0" />
                      </Link>

                      {/* Option 4: At 2,000 for 1 year */}
                      <Link
                        href="/signup?plan=1y"
                        onClick={() => setPricingDropdownOpen(false)}
                        className="group flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-[#15803D]/30 transition-all cursor-pointer relative"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[9.5px] font-black uppercase tracking-wider bg-[#15803D] text-white px-1.5 py-0.2 rounded">
                              Best Value
                            </span>
                            <span className="text-[10px] font-bold text-emerald-800">Lowest Monthly Rate</span>
                          </div>
                          <p className="text-xs sm:text-[13px] font-black text-black group-hover:text-[#15803D] transition-colors">
                            At 2,000 for 1 year
                          </p>
                          <p className="text-[11px] text-slate-600 font-semibold">
                            ₹166/mo • 1 Full Year
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#15803D] group-hover:translate-x-1 transition-all shrink-0" />
                      </Link>

                      <div className="pt-2 border-t border-black/10 flex items-center justify-between px-2 text-[11px]">
                        <a
                          href="#pricing"
                          onClick={() => setPricingDropdownOpen(false)}
                          className="font-bold text-slate-600 hover:text-black underline underline-offset-2 flex items-center gap-1"
                        >
                          Compare all 4 plans ↓
                        </a>
                        <span className="text-slate-400 font-medium">Instant Activation</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97, y: 1 }}
                className="w-full sm:w-auto"
              >
                <Link
                  href="/r/welurik-media"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-white hover:bg-slate-50 text-black rounded-full text-xs sm:text-sm font-bold border-2 border-black shadow-[2px_2px_0px_#000000] sm:shadow-[4px_4px_0px_#000000] transition-shadow text-center"
                >
                  <Play className="w-3 h-3 fill-black text-black" /> Try Customer Demo
                </Link>
              </motion.div>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: Interactive Smartphone Mockup + Standee Floating Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative pt-2 sm:py-4">
            
            {/* Background Standee Real Photo Preview Card with Gentle Ambient Floating Animation */}
            <motion.div
              animate={{ y: [-4, 6, -4], rotate: [6, 4, 6] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              whileHover={{ rotate: 0, scale: 1.05 }}
              className="hidden xl:block absolute -top-6 -right-10 w-44 rounded-2xl border-2 border-black bg-white p-1.5 shadow-[4px_4px_0px_#000000] z-20 transition-all duration-300 cursor-pointer"
            >
              <img
                src="/images/standee-cafe-counter.jpg"
                alt="Acrylic QR Table Standee"
                className="w-full h-28 object-cover rounded-xl"
              />
              <p className="text-[9px] font-black text-black pt-1 px-1 text-center">4"x6" Acrylic Standee</p>
            </motion.div>
            
            {/* Phone Frame */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-[280px] xs:max-w-[300px] sm:max-w-[320px] bg-black p-2 sm:p-2.5 rounded-[42px] sm:rounded-[48px] border-[3px] sm:border-[3.5px] border-black relative z-10 select-none shadow-[6px_6px_0px_#000000] sm:shadow-[8px_8px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_#000000] transition-all group"
            >
              {/* Inside Screen Container with 9:16 Aspect Ratio */}
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[34px] sm:rounded-[38px] bg-slate-950 flex items-center justify-center">
                
                {/* Dynamic Island */}
                <div className="absolute top-2 sm:top-2.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                  <div className="w-[74px] sm:w-[82px] h-[16px] sm:h-[18px] bg-black rounded-full flex items-center justify-between px-2.5 shadow-md border border-white/10">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/60" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>

                {/* Video Player - Paused by Default */}
                <video
                  ref={videoRef}
                  src="/video/welurik-demo.mp4"
                  poster="/video/welurik-demo-poster.jpg"
                  loop
                  playsInline
                  preload="none"
                  onClick={togglePlay}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full h-full object-cover object-center cursor-pointer"
                />

                {/* Play Button Overlay when Paused */}
                {!isPlaying && (
                  <div 
                    onClick={togglePlay}
                    className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer z-20 transition-opacity group/play"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl border-2 border-black"
                    >
                      <Play className="w-6 h-6 fill-black ml-0.5" />
                    </motion.div>
                    <span className="mt-2.5 text-[11px] font-black text-white bg-black/80 px-3 py-1 rounded-full border border-white/20 shadow-md">
                      Watch Live Demo 🔊
                    </span>
                  </div>
                )}

                {/* Floating Bottom Mute/Unmute Control (Defaults to Unmuted, option to mute) */}
                <div className="absolute bottom-3 right-3 z-20 pointer-events-auto">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="px-2.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white flex items-center gap-1.5 hover:bg-black hover:scale-105 transition-all border border-white/20 shadow-md cursor-pointer text-[11px] font-bold"
                    title={isMuted ? "Unmute Sound" : "Mute Sound"}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                        <span>Mute</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Sound On</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* 
        ========================================================================
        HOW IT WORKS (3 Simple Steps)
        ========================================================================
      */}
      <section id="how-it-works" className="py-14 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-10 sm:space-y-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2.5 max-w-xl mx-auto"
        >
          <span className="text-xs font-black text-[#15803D] uppercase tracking-widest bg-[#dcfce7] px-3.5 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_#000000] inline-block">
            zero friction
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
            How It Works in 3 Simple Steps
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 Card with Photo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.45, delay: 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white p-6 rounded-[28px] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] transition-shadow space-y-4 flex flex-col justify-between overflow-hidden"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-black text-white border-2 border-black rounded-xl flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000000]">
                1
              </div>
              <h3 className="text-base font-black text-black">Scan Table Standee</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Place sleek 4" x 6" acrylic standees on tables, reception counters, or billing desks. Customers simply scan with their phone camera.
              </p>
            </div>
            <div className="relative rounded-2xl border-2 border-black overflow-hidden shadow-[2px_2px_0px_#000000] mt-2 group">
              <img
                src="/images/standee-cafe-counter.jpg"
                alt="Acrylic QR standee on cafe table"
                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                In-Store Table Tent
              </div>
            </div>
          </motion.div>

          {/* Step 2 Card with Photo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.45, delay: 0.2 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white p-6 rounded-[28px] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] transition-shadow space-y-4 flex flex-col justify-between overflow-hidden"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-[#15803D] text-white border-2 border-black rounded-xl flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000000]">
                2
              </div>
              <h3 className="text-base font-black text-black">Tap What They Loved</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Customers tap simple pills (e.g. "Great Coffee", "Fast Wi-Fi"). AI instantly crafts a genuine, polite, keyword-rich 5-star review.
              </p>
            </div>
            <div className="relative rounded-2xl border-2 border-black overflow-hidden shadow-[2px_2px_0px_#000000] mt-2 group">
              <img
                src="/images/step2-ai-tap.jpg"
                alt="Customer selecting experience pills on mobile phone"
                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2 bg-[#15803D] text-white text-[10px] font-black px-2.5 py-0.5 rounded-md border border-black shadow-[1px_1px_0px_#000000]">
                AI 5-Star Generator
              </div>
            </div>
          </motion.div>

          {/* Step 3 Card with Photo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.45, delay: 0.3 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white p-6 rounded-[28px] border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] transition-shadow space-y-4 flex flex-col justify-between overflow-hidden"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-black text-white border-2 border-black rounded-xl flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000000]">
                3
              </div>
              <h3 className="text-base font-black text-black">1-Tap Google Post</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                The review copies to clipboard and instantly redirects to your Google Business profile. The customer pastes and submits in 5 seconds!
              </p>
            </div>
            <div className="relative rounded-2xl border-2 border-black overflow-hidden shadow-[2px_2px_0px_#000000] mt-2 group">
              <img
                src="/images/step3-google-post.jpg"
                alt="5-star Google review posted on mobile phone"
                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2 bg-emerald-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md border border-black shadow-[1px_1px_0px_#000000]">
                Verified Google Review
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 
        ========================================================================
        BENTO GRID FEATURES
        ========================================================================
      */}
      <section id="features" className="py-14 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-10 sm:space-y-14 border-t-2 border-black/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2 max-w-xl mx-auto"
        >
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
            powerful architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
            Everything You Need To Dominate Google Maps
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.05 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-9 h-9 bg-slate-100 border-2 border-black rounded-xl flex items-center justify-center text-black">
                <Printer className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-black">Standee & Table Tent Studio</h3>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-[#15803D] font-bold">✓</span>
                  <span>Ready-to-print 4" x 6" acrylic standee templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#15803D] font-bold">✓</span>
                  <span>Foldable table tents & counter register badges</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#15803D] font-bold">✓</span>
                  <span>Instant high-resolution vector QR code export</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-9 h-9 bg-amber-50 border-2 border-black rounded-xl flex items-center justify-center text-amber-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-black">Target Keyword SEO Booster</h3>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-[#15803D] font-bold">✓</span>
                  <span>Naturally weaves your services into review text</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#15803D] font-bold">✓</span>
                  <span>Helps rank in Google's Top 3 Local Map Pack</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#15803D] font-bold">✓</span>
                  <span>Brings more nearby customers from Google searches</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.15 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-9 h-9 bg-[#dcfce7] border-2 border-black rounded-xl flex items-center justify-center text-[#15803D]">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-black">Live Conversion Analytics</h3>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-[#15803D] font-bold">✓</span>
                  <span>Track camera scans & QR conversion in real time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#15803D] font-bold">✓</span>
                  <span>See which topics & services customers praise most</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#15803D] font-bold">✓</span>
                  <span>Monitor Google Maps handoffs with clear KPIs</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Feature 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-9 h-9 bg-rose-50 border-2 border-black rounded-xl flex items-center justify-center text-rose-600">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-black">Private Grievance Inbox</h3>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-[#15803D] font-bold">✓</span>
                  <span>Catch complaints before customers post online</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#15803D] font-bold">✓</span>
                  <span>Collect customer name, phone & private feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#15803D] font-bold">✓</span>
                  <span>Resolve issues directly & turn angry guests happy</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Feature 5 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.25 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white p-6 rounded-[24px] border-2 border-black shadow-[4px_4px_0px_#000000] space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-9 h-9 bg-slate-100 border-2 border-black rounded-xl flex items-center justify-center text-[#15803D]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-black">100% Policy Compliant</h3>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-[#15803D] font-bold">✓</span>
                  <span>Zero fake reviews or prohibited review gating</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#15803D] font-bold">✓</span>
                  <span>Compliant with Google Maps & FTC policies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#15803D] font-bold">✓</span>
                  <span>Safeguards your Google Business Profile forever</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 
        ========================================================================
        PRICING CARDS (4 Tiers: 1 Month, 3 Months, 6 Months, 1 Year)
        ========================================================================
      */}
      <motion.section
        id="pricing"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="py-14 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto text-center space-y-8"
      >
        <div className="space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-black text-[#15803D] uppercase tracking-widest bg-[#dcfce7] px-3.5 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_#000000] inline-block">
            Transparent Plans
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
            Choose the Perfect Plan for Your Business
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-600">
            Zero hidden charges. Unlimited QR scans, AI review generation, and print-ready standees for your chosen duration.
          </p>
        </div>

        {/* 4 Pricing Cards: Auto-Scroll Carousel on Mobile, Responsive Grid on Tablet/Desktop */}
        <div
          ref={pricingCarouselRef}
          onScroll={handlePricingScroll}
          onTouchStart={() => setIsPricingInteracting(true)}
          onTouchEnd={() => setTimeout(() => setIsPricingInteracting(false), 4000)}
          onMouseEnter={() => setIsPricingInteracting(true)}
          onMouseLeave={() => setIsPricingInteracting(false)}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch pt-4 text-left overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-smooth no-scrollbar pb-6 px-4 md:px-0 -mx-4 md:mx-0"
        >
          
          {/* CARD 1: At 199 for 1 month */}
          <motion.div
            id="pricing-card-1m"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="w-[82vw] max-w-[320px] sm:w-[340px] md:w-auto md:max-w-none shrink-0 md:shrink snap-center bg-white border-2 border-black rounded-[28px] p-5 sm:p-6 space-y-5 flex flex-col justify-between shadow-[5px_5px_0px_#000000]"
          >
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-black/10 inline-block">
                  Starter Plan
                </span>
                <h3 className="text-lg sm:text-xl font-black text-black">1 Month Access</h3>
                <p className="text-xs text-slate-500 font-medium">Try all features and collect your first 5-star reviews</p>
              </div>

              <div className="pt-2 border-t border-black/10">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-black tracking-tight">₹199</span>
                  <span className="text-xs font-bold text-slate-600">/ 1 month</span>
                </div>
                <p className="text-[11.5px] font-bold text-[#15803D] mt-1">
                  At 199 for 1 month (₹199/mo)
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-800 pt-2 border-t border-black/10">
                {[
                  "1 Month Full Software License",
                  "Unlimited QR Camera Scans",
                  "Ready-to-Print 4\" x 6\" Standee Studio",
                  "AI Review Assistant (Gemini Flash)",
                  "Custom Service Keywords & Topics",
                  "Live Conversion Dashboard",
                  "Private Grievance Inbox",
                  "Standard Email & Chat Support",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-800">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/signup?plan=1m"
                  className="w-full py-3.5 bg-white hover:bg-slate-50 text-black rounded-full font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-2 border-black shadow-[3px_3px_0px_#000000] transition-shadow text-center cursor-pointer"
                >
                  Get At 199 for 1 month <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* CARD 2: At 574 for 3 months */}
          <motion.div
            id="pricing-card-3m"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="w-[82vw] max-w-[320px] sm:w-[340px] md:w-auto md:max-w-none shrink-0 md:shrink snap-center bg-white border-2 border-black rounded-[28px] p-5 sm:p-6 space-y-5 flex flex-col justify-between shadow-[5px_5px_0px_#000000]"
          >
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-black/10 inline-block">
                  Quarterly Plan
                </span>
                <h3 className="text-lg sm:text-xl font-black text-black">3 Months Access</h3>
                <p className="text-xs text-slate-500 font-medium">Build strong review momentum across 90 days</p>
              </div>

              <div className="pt-2 border-t border-black/10">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-black tracking-tight">₹574</span>
                  <span className="text-xs font-bold text-slate-600">/ 3 months</span>
                </div>
                <p className="text-[11.5px] font-bold text-[#15803D] mt-1">
                  At 574 for 3 months (Just ₹191/mo)
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-800 pt-2 border-t border-black/10">
                {[
                  "3 Months Full Software Access",
                  "Everything in 1 Month Plan",
                  "Unlimited Multi-Standee Prints",
                  "Fast AI Review Engine",
                  "Google Maps Keyword Booster",
                  "Sentiment Analytics & Insights",
                  "Private Grievance Alert Channel",
                  "Priority Email & Chat Support",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-800">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/signup?plan=3m"
                  className="w-full py-3.5 bg-white hover:bg-slate-50 text-black rounded-full font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-2 border-black shadow-[3px_3px_0px_#000000] transition-shadow text-center cursor-pointer"
                >
                  Get At 574 for 3 months <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* CARD 3: At 1,099 for 6 months */}
          <motion.div
            id="pricing-card-6m"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="w-[82vw] max-w-[320px] sm:w-[340px] md:w-auto md:max-w-none shrink-0 md:shrink snap-center bg-white border-2 border-black rounded-[28px] p-5 sm:p-6 space-y-5 flex flex-col justify-between shadow-[5px_5px_0px_#000000]"
          >
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#15803D] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-[#15803D]/30 inline-block">
                  Half-Yearly Plan
                </span>
                <h3 className="text-lg sm:text-xl font-black text-black">6 Months Access</h3>
                <p className="text-xs text-slate-500 font-medium">Consistent local SEO growth with lower monthly rate</p>
              </div>

              <div className="pt-2 border-t border-black/10">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-black tracking-tight">₹1,099</span>
                  <span className="text-xs font-bold text-slate-600">/ 6 months</span>
                </div>
                <p className="text-[11.5px] font-bold text-[#15803D] mt-1">
                  At 1,099 for 6 months (Only ₹183/mo)
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-800 pt-2 border-t border-black/10">
                {[
                  "6 Months Extended Software Access",
                  "Everything in 3 Months Plan",
                  "Priority AI Review Generation",
                  "Unlimited Multi-Counter QR Prints",
                  "Detailed Rating Trends Analytics",
                  "Real-time Grievance Notification",
                  "Custom Standee Theme Tweaks",
                  "Priority WhatsApp Support",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-800">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/signup?plan=6m"
                  className="w-full py-3.5 bg-white hover:bg-slate-50 text-black rounded-full font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-2 border-black shadow-[3px_3px_0px_#000000] transition-shadow text-center cursor-pointer"
                >
                  Get At 1,099 for 6 months <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* CARD 4: At 2,000 for 1 year (BEST VALUE) */}
          <motion.div
            id="pricing-card-1y"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="w-[82vw] max-w-[320px] sm:w-[340px] md:w-auto md:max-w-none shrink-0 md:shrink snap-center bg-white border-[3px] border-black rounded-[30px] p-5 sm:p-6 space-y-5 flex flex-col justify-between shadow-[8px_8px_0px_#15803D] relative md:-translate-y-2"
          >
            {/* Top Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#15803D] text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_#000000] whitespace-nowrap">
              ★ Best Value • 1 Full Year
            </div>

            <div className="space-y-4">
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#15803D] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-[#15803D]/30 inline-block">
                  Annual Plan • Maximum Savings
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-black">1 Year Access</h3>
                <p className="text-xs text-slate-500 font-medium">Most chosen by high-growth cafes, restaurants & clinics</p>
              </div>

              <div className="pt-2 border-t border-black/10">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-[#15803D] tracking-tight">₹2,000</span>
                  <span className="text-xs font-bold text-slate-600">/ 1 year</span>
                </div>
                <p className="text-[11.5px] font-black text-black mt-1">
                  At 2,000 for 1 year (Lowest rate: ₹166/mo)
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-800 pt-2 border-t border-black/10">
                {[
                  "1 Full Year Software Access",
                  "Everything in 6 Months Plan",
                  "Lowest Rate: Just ₹166/month",
                  "Unlimited Multi-Branch & Table QRs",
                  "VIP Priority AI Review Assistant",
                  "Google Maps Local SEO Keyword Suite",
                  "Priority Business WhatsApp Support",
                  "Free Standee Design Customization",
                ].map((f, i) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                    <span className={i < 2 ? "font-black text-black" : "font-semibold text-slate-800"}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/signup?plan=1y"
                  className="w-full py-4 bg-[#15803D] hover:bg-[#166534] text-white rounded-full font-black text-sm flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0px_#000000] transition-shadow text-center cursor-pointer"
                >
                  Get At 2,000 for 1 year <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>

        </div>

        {/* Mobile Carousel Controls & Interactive Dot Indicators (md:hidden) */}
        <div className="flex md:hidden flex-col items-center justify-center gap-2.5 pt-1">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => scrollToPricingSlide((activePricingSlide - 1 + 4) % 4)}
              className="p-1.5 rounded-full border-2 border-black bg-white hover:bg-slate-100 shadow-[1px_1px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
              aria-label="Previous plan"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-black" />
            </button>

            {[
              { label: "1M", price: "₹199" },
              { label: "3M", price: "₹574" },
              { label: "6M", price: "₹1,099" },
              { label: "1Y", price: "₹2,000", popular: true },
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToPricingSlide(idx)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black transition-all border-2 border-black ${
                  activePricingSlide === idx
                    ? "bg-[#15803D] text-white shadow-[2px_2px_0px_#000000] scale-105"
                    : "bg-white text-slate-700 hover:bg-slate-100 shadow-[1px_1px_0px_#000000]"
                }`}
                aria-label={`View ${p.label} plan`}
              >
                <span>{p.label}</span>
                <span className="text-[10px] opacity-80">{p.price}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => scrollToPricingSlide((activePricingSlide + 1) % 4)}
              className="p-1.5 rounded-full border-2 border-black bg-white hover:bg-slate-100 shadow-[1px_1px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
              aria-label="Next plan"
            >
              <ChevronRight className="w-3.5 h-3.5 text-black" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
            <span>Auto-scrolling • Swipe to explore ({activePricingSlide + 1} of 4)</span>
          </div>
        </div>
      </motion.section>

      {/* 
        ========================================================================
        FAQ ACCORDION with Motion.dev Expand/Collapse Animation
        ========================================================================
      */}
      <section id="faq" className="py-14 sm:py-20 px-4 sm:px-8 max-w-3xl mx-auto space-y-8 border-t-2 border-black/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2"
        >
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
            got questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-3.5">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border-2 border-black overflow-hidden transition-shadow shadow-[3px_3px_0px_#000000] hover:shadow-[4px_4px_0px_#000000]"
            >
              <button
                type="button"
                onClick={() => toggleFaq(i)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-black text-black hover:text-slate-700 cursor-pointer"
              >
                <span>{faq.q}</span>
                <motion.div
                  animate={{ rotate: openFaq === i ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="shrink-0 ml-2"
                >
                  <ChevronDown className="w-4 h-4 text-black" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {openFaq === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs text-slate-700 leading-relaxed font-medium border-t-2 border-black/10 pt-3">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* 
        ========================================================================
        FINAL CTA BANNER
        ========================================================================
      */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="bg-white border-[3px] border-black rounded-[32px] sm:rounded-[36px] p-7 sm:p-14 space-y-5 shadow-[6px_6px_0px_#000000] sm:shadow-[8px_8px_0px_#000000] relative overflow-hidden"
        >
          <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-black text-black tracking-tight leading-[1.15] relative z-10">
            Start Collecting 5-Star Reviews Today
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-medium leading-relaxed relative z-10">
            Outsmart your competitors with Welurik Review and grow your business with our 30-second review assistant.
          </p>
          <div className="pt-2 flex items-center justify-center relative z-10">
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97, y: 1 }}>
              <Link
                href="/#pricing"
                className="w-full sm:w-auto px-8 py-4 bg-[#15803D] hover:bg-[#166534] text-white font-black rounded-full text-sm sm:text-base border-2 border-black shadow-[4px_4px_0px_#000000] transition-shadow text-center inline-flex items-center justify-center gap-2"
              >
                Choose Your Plan (From ₹199) <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 
        ========================================================================
        MINIMAL FOOTER
        ========================================================================
      */}
      <footer className="w-full max-w-[1080px] mx-auto px-4 sm:px-8 py-6 pb-24 md:pb-6 border-t-2 border-black/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-4 z-10 text-center sm:text-left">
        <p>© 2026 Welurik Review. Built for local businesses to collect authentic 5-star Google reviews.</p>
        <div className="flex flex-wrap items-center justify-center gap-4 font-semibold text-slate-700 text-xs">
          <Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
          <Link href="/refund" className="hover:text-black transition-colors">Refunds</Link>
          <Link href="/login" className="hover:text-black transition-colors">Sign In</Link>
          <Link href="/r/welurik-media" className="hover:text-black transition-colors">Customer Demo</Link>
        </div>
      </footer>

      {/* 
        ========================================================================
        MOBILE STICKY BOTTOM ACTION BAR (High-Converting Mobile UX)
        ========================================================================
      */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 px-4 py-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-md border-t-2 border-black z-50 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-black text-black">From ₹199</span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 truncate">
            1, 3, 6 or 12 Months Plans
          </span>
        </div>

        <motion.div
          animate={{
            scale: [1, 1.05, 0.98, 1.03, 1],
          }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
          }}
          whileTap={{ scale: 0.94 }}
          className="shrink-0"
        >
          <Link
            href="/#pricing"
            className="px-6 py-3 bg-[#15803D] hover:bg-[#166534] text-white text-sm font-black rounded-full border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 text-center transition-all whitespace-nowrap"
          >
            View Plans <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
