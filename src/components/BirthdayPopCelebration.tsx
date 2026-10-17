"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { PartyPopper, Sparkles, CheckCircle2, X } from "lucide-react";

export interface BirthdayPopOptions {
  title?: string;
  message?: string;
  emoji?: string;
  duration?: number;
}

/**
 * Triggers a full-sky birthday party popper celebration with fireworks & popup.
 * Can be called from anywhere in client code.
 */
export function triggerBirthdayPop(options?: BirthdayPopOptions) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("welurik_birthday_pop", {
      detail: {
        title: options?.title || "Changes Saved Successfully!",
        message:
          options?.message ||
          "Your updates are instantly synchronized across your Google review funnel.",
        emoji: options?.emoji || "🎉",
        duration: options?.duration || 4500,
      },
    })
  );
}

// Gentle pleasant celebratory chime using Web Audio API (safe, zero external dependencies)
function playGentleCelebrationSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    // Harmonious major arpeggio: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const pitches = [523.25, 659.25, 783.99, 1046.5];
    pitches.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  } catch {
    // Ignore audio permission or context restrictions
  }
}

/**
 * Shoots celebratory birthday party poppers high up into the sky from multiple angles.
 */
function fireSkyBirthdayPop() {
  if (typeof window === "undefined") return;

  const vibrantColors = [
    "#10B981", // Emerald
    "#F59E0B", // Amber Gold
    "#EC4899", // Celebration Pink
    "#3B82F6", // Royal Blue
    "#8B5CF6", // Purple
    "#F97316", // Vibrant Orange
    "#14B8A6", // Teal
  ];

  // 1. Immediate Left Cannon - Shooting high into the sky at 60°
  confetti({
    particleCount: 75,
    angle: 60,
    spread: 65,
    origin: { x: 0.12, y: 0.88 },
    startVelocity: 65,
    gravity: 0.75,
    ticks: 280,
    colors: vibrantColors,
    scalar: 1.15,
  });

  // 2. Immediate Right Cannon - Shooting high into the sky at 120°
  confetti({
    particleCount: 75,
    angle: 120,
    spread: 65,
    origin: { x: 0.88, y: 0.88 },
    startVelocity: 65,
    gravity: 0.75,
    ticks: 280,
    colors: vibrantColors,
    scalar: 1.15,
  });

  // 3. Staggered Center Fireworks Burst directly in the high sky (200ms later)
  setTimeout(() => {
    confetti({
      particleCount: 110,
      angle: 90,
      spread: 120,
      origin: { x: 0.5, y: 0.35 },
      startVelocity: 42,
      gravity: 0.6,
      ticks: 320,
      colors: vibrantColors,
      shapes: ["circle", "square"],
      scalar: 1.3,
    });
  }, 220);

  // 4. Stardust / Sparkler shower cascading down from the sky (450ms later)
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 160,
      origin: { x: 0.5, y: 0.12 },
      startVelocity: 25,
      gravity: 0.5,
      ticks: 300,
      colors: ["#FDE047", "#FEF08A", "#6EE7B7", "#93C5FD", "#F472B6"],
      scalar: 0.9,
    });
  }, 480);
}

export default function BirthdayPopCelebration() {
  const [activePop, setActivePop] = useState<BirthdayPopOptions | null>(null);

  const handleDismiss = useCallback(() => {
    setActivePop(null);
  }, []);

  useEffect(() => {
    const handleEvent = (e: Event) => {
      const customEvent = e as CustomEvent<BirthdayPopOptions>;
      const details = customEvent.detail || {};

      // 1. Play sound & shoot sky cannons
      playGentleCelebrationSound();
      fireSkyBirthdayPop();

      // 2. Show sky popup modal
      setActivePop(details);
    };

    window.addEventListener("welurik_birthday_pop", handleEvent);
    return () => {
      window.removeEventListener("welurik_birthday_pop", handleEvent);
    };
  }, []);

  // Auto-dismiss after duration
  useEffect(() => {
    if (!activePop) return;
    const duration = activePop.duration || 4500;
    const timer = setTimeout(() => {
      setActivePop(null);
    }, duration);
    return () => clearTimeout(timer);
  }, [activePop]);

  return (
    <AnimatePresence>
      {activePop && (
        <div className="fixed inset-0 z-99999 pointer-events-none flex items-start justify-center pt-5 sm:pt-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: -70, scale: 0.82 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.9, transition: { duration: 0.25 } }}
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 26,
            }}
            className="pointer-events-auto w-full max-w-md bg-slate-950/95 backdrop-blur-xl border border-emerald-500/40 rounded-3xl p-5 shadow-2xl shadow-emerald-950/50 text-white relative overflow-hidden select-none"
          >
            {/* Ambient Multi-Color Celebration Glow in background */}
            <div className="absolute -top-16 -left-16 w-36 h-36 bg-emerald-500/25 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/25 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-start gap-4">
              {/* Animated Birthday Popper Icon Badge */}
              <div className="relative shrink-0">
                <motion.div
                  animate={{
                    rotate: [0, -12, 12, -8, 8, 0],
                    scale: [1, 1.15, 1.1, 1.15, 1],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                  }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-300 p-0.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center text-slate-950"
                >
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <span className="text-2xl" role="img" aria-label="Celebration">
                      {activePop.emoji || "🎉"}
                    </span>
                  </div>
                </motion.div>
                {/* Sparkle pin */}
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-md animate-pulse">
                  <Sparkles className="w-3 h-3 text-slate-950" />
                </div>
              </div>

              {/* Text Information */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    Saved & Updated
                  </span>
                  <span className="text-[9px] font-semibold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/20">
                    Live
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight">
                  {activePop.title || "Changes Saved Successfully!"}
                </h3>

                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {activePop.message ||
                    "Your updates are instantly synchronized across your Google review funnel."}
                </p>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom animated celebratory countdown bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-slate-300 font-medium">
                <PartyPopper className="w-3 h-3 text-emerald-400" />
                Instant Sync Enabled
              </span>
              <span className="font-mono text-[9px] text-slate-400">Auto-closing</span>
            </div>

            {/* Glowing progress line */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: (activePop.duration || 4500) / 1000, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-pink-500"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
