"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap, ShieldCheck, RefreshCw } from "lucide-react";

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
  showAutoPayToggle?: boolean;
  defaultAutoPay?: boolean;
}

export function CheckoutButton({
  planType = "1y",
  className = "",
  buttonText,
  showIcon = true,
  showAutoPayToggle = true,
  defaultAutoPay = true,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [autoPay, setAutoPay] = useState(defaultAutoPay);
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

      // Step 1: Create Order / Subscription on backend
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType, autoPay }),
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
        setLoading(true);
        setTimeout(async () => {
          const verifyPayload = orderData.isSubscription
            ? {
                razorpay_subscription_id: orderData.subscriptionId || `sub_demo_${Date.now()}`,
                razorpay_payment_id: `pay_demo_${Date.now().toString().slice(-6)}`,
                razorpay_signature: `mock_sig_${Date.now()}`,
                planType,
                isAutoPay: true,
              }
            : {
                razorpay_order_id: orderData.orderId,
                razorpay_payment_id: `pay_demo_${Date.now().toString().slice(-6)}`,
                razorpay_signature: `mock_sig_${Date.now()}`,
                planType,
                isAutoPay: false,
              };

          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(verifyPayload),
          });
          const verifyData = await verifyRes.json();
          router.push(`/checkout/success?order_id=${verifyData.orderId || orderData.orderId || orderData.subscriptionId}&payment_id=pay_demo_success`);
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
      const baseOptions: Record<string, any> = {
        key: orderData.keyId,
        name: "Welurik Review",
        description: orderData.planLabel || "Welurik Review Pro Access",
        image: "/favicon.png",
        prefill: {
          email: orderData.prefill?.email || "",
          contact: "",
        },
        notes: {
          plan: planType,
          isAutoPay: orderData.isSubscription ? "true" : "false",
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

      if (orderData.isSubscription && orderData.subscriptionId) {
        // AutoPay Recurring Subscription Checkout
        baseOptions.subscription_id = orderData.subscriptionId;
        baseOptions.handler = async function (response: any) {
          try {
            setLoading(true);
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_subscription_id: response.razorpay_subscription_id || orderData.subscriptionId,
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_signature: response.razorpay_signature,
                planType,
                isAutoPay: true,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("welurik_dashboard_cache");
              }
              router.push(`/checkout/success?order_id=${verifyData.orderId || orderData.subscriptionId}&payment_id=${response.razorpay_payment_id || "demo"}`);
            } else {
              setErrorMessage(verifyData.error || "Payment verification failed");
              setLoading(false);
            }
          } catch {
            setErrorMessage("Error verifying payment transaction");
            setLoading(false);
          }
        };
      } else {
        // Standard One-Time Order Checkout
        baseOptions.amount = orderData.amount;
        baseOptions.currency = orderData.currency || "INR";
        baseOptions.order_id = orderData.orderId;
        baseOptions.handler = async function (response: any) {
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
                isAutoPay: false,
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
          } catch {
            setErrorMessage("Error verifying payment transaction");
            setLoading(false);
          }
        };
      }

      const rzp = new window.Razorpay(baseOptions);
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

  const getPlanPriceText = () => {
    if (planType === "1m") return "₹199";
    if (planType === "3m") return "₹574";
    if (planType === "6m") return "₹1,099";
    return "₹2,000";
  };

  const resolvedButtonText =
    buttonText ||
    (autoPay
      ? `Pay ${getPlanPriceText()} with AutoPay (Auto-Renew)`
      : `Pay ${getPlanPriceText()} (One-Time Access)`);

  return (
    <div className="w-full flex flex-col items-center">
      {showAutoPayToggle && (
        <div className="w-full mb-3 bg-white/95 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-left shadow-xs transition-all hover:border-emerald-300">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Enable AutoPay (Auto-Renew)</span>
                <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  Recommended
                </span>
              </p>
              <p className="text-[11px] text-slate-500">
                Automatic renewal via UPI AutoPay & Cards. Zero manual hassle.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
            <input
              type="checkbox"
              checked={autoPay}
              onChange={(e) => setAutoPay(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      )}

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
            <span>{resolvedButtonText}</span>
          </>
        )}
      </button>

      {errorMessage && (
        <p className="mt-2 text-xs text-red-500 font-medium text-center">{errorMessage}</p>
      )}

      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-500">
        <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
        <span>256-Bit SSL Encrypted • Instant UPI & Card Activation</span>
      </div>
    </div>
  );
}

