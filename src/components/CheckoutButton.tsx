"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutButtonProps {
  planType?: string;
  className?: string;
  buttonText?: string;
  showIcon?: boolean;
}

export function CheckoutButton({
  planType = "lifetime",
  className = "",
  buttonText = "Get Lifetime Access — ₹1,999 only",
  showIcon = true,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showKeyNotice, setShowKeyNotice] = useState(false);
  const router = useRouter();

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      // Step 1: Create Order on backend
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });

      if (res.status === 401) {
        router.push("/signup");
        return;
      }

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || "Could not initialize checkout order");
      }

      // If Razorpay API keys are not added yet (demo / mock mode)
      if (orderData.isMock || !orderData.keyId || orderData.keyId === "rzp_test_placeholder") {
        // Direct simulation for instant preview
        setLoading(true);
        setTimeout(async () => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: orderData.orderId,
              razorpay_payment_id: `pay_demo_${Date.now().toString().slice(-6)}`,
              razorpay_signature: `mock_sig_${Date.now()}`,
              planType,
            }),
          });
          const verifyData = await verifyRes.json();
          router.push(`/checkout/success?order_id=${verifyData.orderId || orderData.orderId}&payment_id=pay_demo_success`);
        }, 800);
        return;
      }

      // Step 2: Load Razorpay Checkout SDK
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setErrorMessage("Failed to load secure payment gateway. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // Step 3: Configure Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Welurik Review",
        description: orderData.planLabel || "Lifetime License Access",
        image: "/favicon.png",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            setLoading(true);
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || orderData.orderId,
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || `mock_sig_${Date.now()}`,
                planType,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("welurik_dashboard_cache");
              }
              router.push(`/checkout/success?order_id=${verifyData.orderId || orderData.orderId}&payment_id=${response.razorpay_payment_id || "demo"}`);
            } else {
              setErrorMessage(verifyData.error || "Payment verification failed");
              setLoading(false);
            }
          } catch (err: any) {
            setErrorMessage("Error verifying payment transaction");
            setLoading(false);
          }
        },
        prefill: {
          email: orderData.prefill?.email || "",
          contact: "",
        },
        notes: {
          plan: planType,
        },
        theme: {
          color: "#16A34A", // Brand Green
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setErrorMessage(response.error?.description || "Payment failed or cancelled");
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Checkout error:", err);
      setErrorMessage(err.message || "Failed to start checkout");
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={
          className ||
          "w-full py-4 px-8 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-lg rounded-2xl shadow-xl shadow-green-600/25 border-2 border-green-500/50 hover:shadow-green-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        }
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Connecting Secure Gateway...</span>
          </>
        ) : (
          <>
            {showIcon && <Zap className="w-5 h-5 fill-current text-white group-hover:scale-110 transition-transform" />}
            <span>{buttonText}</span>
          </>
        )}
      </button>

      {errorMessage && (
        <p className="mt-2 text-xs text-red-500 font-medium">{errorMessage}</p>
      )}

      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-500">
        <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
        <span>256-Bit SSL Encrypted • Instant UPI & Card Activation</span>
      </div>
    </div>
  );
}
