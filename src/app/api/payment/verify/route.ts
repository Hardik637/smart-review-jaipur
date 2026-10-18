import { NextRequest, NextResponse } from "next/server";
import { getSession, createSessionPayload, SESSION_COOKIE_NAME } from "@/lib/auth";
import { verifyRazorpaySignature, verifyRazorpaySubscriptionSignature } from "@/lib/razorpay";
import { FirestoreDB } from "@/lib/firestore-db";
import { FirestoreREST } from "@/lib/firestore-rest";
import { checkRateLimit, rateLimitExceededResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest | Request) {
  try {
    const rl = await checkRateLimit(req, "payment_verify", { limit: 15, windowSeconds: 60 });
    if (!rl.success) {
      return rateLimitExceededResponse(rl.limit, rl.resetAt);
    }

    let session = null;
    try {
      session = await getSession();
    } catch {
      // Guest session
    }

    const body = await req.json().catch(() => ({}));
    const {
      razorpay_order_id,
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
      planType = "1y",
      isAutoPay = false,
    } = body;

    const isSubscription = Boolean(razorpay_subscription_id);

    if ((!razorpay_order_id && !razorpay_subscription_id) || !razorpay_payment_id) {
      return NextResponse.json(
        { error: "Missing required order or payment identifiers" },
        { status: 400 }
      );
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpay_signature) {
      return NextResponse.json({ error: "Missing payment signature" }, { status: 400 });
    }

    if (!key_secret) {
      return NextResponse.json({ error: "Payment gateway configuration error" }, { status: 500 });
    }

    let isValid = false;
    if (isSubscription) {
      isValid = verifyRazorpaySubscriptionSignature({
        subscriptionId: razorpay_subscription_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      });
    } else {
      isValid = verifyRazorpaySignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      });
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature verification failed" },
        { status: 400 }
      );
    }


    // Update database records safely
    let orderId = `ord_${Date.now()}`;
    let businessId = session?.businessId;
    let businessSlug = session?.businessSlug;

    if (!businessId && session?.userId) {
      try {
        const biz = await FirestoreDB.getBusinessByUserId(session.userId);
        if (biz) {
          businessId = biz.id || biz.slug;
          if (!businessSlug) businessSlug = biz.slug;
        }
      } catch (bizLookupErr) {
        console.warn("Business lookup note in verify:", bizLookupErr);
      }
    }

    let amountInPaise = 200000;
    let planTitle = "1 Year Access";
    const normalizedPlan = (planType || "").toLowerCase();
    let validDays = 365;

    if (normalizedPlan === "1m" || normalizedPlan === "1month") {
      amountInPaise = 19900;
      planTitle = "1 Month Access";
      validDays = 30;
    } else if (normalizedPlan === "3m" || normalizedPlan === "3months") {
      amountInPaise = 57400;
      planTitle = "3 Months Access";
      validDays = 90;
    } else if (normalizedPlan === "6m" || normalizedPlan === "6months") {
      amountInPaise = 109900;
      planTitle = "6 Months Access";
      validDays = 180;
    } else if (normalizedPlan === "1y" || normalizedPlan === "1year" || normalizedPlan === "12m") {
      amountInPaise = 200000;
      planTitle = "1 Year Access";
      validDays = 365;
    }

    // 1. Permanently record and update order in authoritative Firestore
    const userEmail = session?.email;
    const userId = session?.userId;
    const activationTime = new Date().toISOString();
    const expiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString();

    // A. Update User in Firestore
    let fsUser: any = null;
    if (userEmail) {
      try {
        fsUser = await FirestoreDB.getUserByEmail(userEmail);
        if (fsUser) {
          await FirestoreREST.setDocument("users", fsUser.id, {
            ...fsUser,
            isPro: true,
            isAutoPay: isSubscription || Boolean(isAutoPay),
            subscriptionId: razorpay_subscription_id || null,
            planName: `${planTitle} Pro${isSubscription ? " (AutoPay)" : ""}`,
            planType: normalizedPlan || "1y",
            paidAt: activationTime,
            expiresAt,
          });
        }
      } catch (fsUserErr) {
        console.warn("Firestore user Pro update note:", fsUserErr);
      }
    }

    // B. Update Business in Firestore
    let fsBusiness: any = null;
    try {
      if (userId) {
        fsBusiness = await FirestoreDB.getBusinessByUserId(userId);
      }
      if (!fsBusiness && (businessSlug || fsUser?.businessSlug)) {
        fsBusiness = await FirestoreDB.getBusinessBySlug(businessSlug || fsUser?.businessSlug);
      }
      if (!fsBusiness && userEmail) {
        const defaultSlug = userEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-");
        fsBusiness = await FirestoreDB.getBusinessBySlug(defaultSlug);
      }

      const targetSlug = fsBusiness?.slug || businessSlug || fsUser?.businessSlug || (userEmail ? userEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-") : "my-business");

      const finalBizDoc = {
        ...(fsBusiness || {}),
        id: fsBusiness?.id || targetSlug,
        slug: targetSlug,
        name: fsBusiness?.name || (userEmail ? userEmail.split("@")[0] : "My Business"),
        userId: userId || fsBusiness?.userId || "user",
        category: fsBusiness?.category || "cafe",
        isPro: true,
        isAutoPay: isSubscription || Boolean(isAutoPay),
        subscriptionId: razorpay_subscription_id || null,
        planName: `${planTitle} Pro${isSubscription ? " (AutoPay)" : ""}`,
        planType: normalizedPlan || "1y",
        monthlyAiQuota: 999999,
        paidAt: activationTime,
        expiresAt,
      };

      await FirestoreREST.setDocument("businesses", targetSlug, finalBizDoc);

      if (userId) {
        await FirestoreREST.setDocument("user_businesses", userId, {
          userId,
          businessSlug: targetSlug,
          businessId: targetSlug,
          isPro: true,
          isAutoPay: isSubscription || Boolean(isAutoPay),
          subscriptionId: razorpay_subscription_id || null,
          name: finalBizDoc.name,
          paidAt: activationTime,
          expiresAt,
        });
      }
    } catch (fsBizErr) {
      console.warn("Firestore business Pro update note:", fsBizErr);
    }

    // Persist immutable order record in Firestore
    const orderDocKey = razorpay_order_id || razorpay_subscription_id || `ord_${Date.now()}`;
    try {
      await FirestoreREST.setDocument("orders", orderDocKey, {
        id: orderDocKey,
        orderId: razorpay_order_id || null,
        subscriptionId: razorpay_subscription_id || null,
        isAutoPay: isSubscription || Boolean(isAutoPay),
        paymentId: razorpay_payment_id,
        amount: amountInPaise,
        currency: "INR",
        status: "paid",
        planType: normalizedPlan || "1y",
        planName: `${planTitle}${isSubscription ? " (AutoPay)" : ""}`,
        userId: userId || "guest",
        userEmail: userEmail || "",
        businessSlug: fsBusiness?.slug || businessSlug || "",
        createdAt: activationTime,
        expiresAt,
      });
    } catch (orderSaveErr) {
      console.warn("Firestore order record note:", orderSaveErr);
    }


    const res = NextResponse.json({
      success: true,
      message: `Payment successfully verified! Your ${planTitle} is now active.`,
      orderId,
      paymentId: razorpay_payment_id,
      isPro: true,
    });

    // Re-issue fresh session cookie so edge middleware & layout immediately reflect Pro status
    if (session && session.userId && session.email) {
      const payload = createSessionPayload({
        userId: session.userId,
        email: session.email,
        businessId: businessId || session.businessId,
        businessSlug: fsBusiness?.slug || businessSlug || session.businessSlug,
      });

      res.cookies.set(SESSION_COOKIE_NAME, payload, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return res;
  } catch (error: any) {
    console.error("Payment verify API error:", error);
    return NextResponse.json(
      { error: "Internal error during payment verification" },
      { status: 500 }
    );
  }
}
