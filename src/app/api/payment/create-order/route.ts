import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { FirestoreDB } from "@/lib/firestore-db";
import { getRazorpayInstance } from "@/lib/razorpay";
import { checkRateLimit, rateLimitExceededResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest | Request) {
  try {
    const rl = await checkRateLimit(req, "payment_create_order", { limit: 10, windowSeconds: 60 });
    if (!rl.success) {
      return rateLimitExceededResponse(rl.limit, rl.resetAt);
    }

    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Please sign in or create an account before proceeding to payment." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const requestedPlan = (body?.planType || "").toLowerCase();

    // Multi-tier pricing plans:
    // - 1 Month: ₹199 (19900 paise)
    // - 3 Months: ₹574 (57400 paise)
    // - 6 Months: ₹1,099 (109900 paise)
    // - 1 Year: ₹2,000 (200000 paise)
    let amountInPaise = 200000;
    let planLabel = "1 Year Access (₹2,000)";
    let planType = "1y";

    if (requestedPlan === "1m" || requestedPlan === "1month") {
      amountInPaise = 19900;
      planLabel = "1 Month Access (₹199)";
      planType = "1m";
    } else if (requestedPlan === "3m" || requestedPlan === "3months") {
      amountInPaise = 57400;
      planLabel = "3 Months Access (₹574)";
      planType = "3m";
    } else if (requestedPlan === "6m" || requestedPlan === "6months") {
      amountInPaise = 109900;
      planLabel = "6 Months Access (₹1,099)";
      planType = "6m";
    } else if (requestedPlan === "1y" || requestedPlan === "1year" || requestedPlan === "12m") {
      amountInPaise = 200000;
      planLabel = "1 Year Access (₹2,000)";
      planType = "1y";
    }

    const key_id =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    let razorpayOrderId = `order_${Date.now()}`;
    let isMock = false;

    // If real keys are provided, create live Razorpay order
    if (key_id && key_secret && !key_id.includes("placeholder")) {
      try {
        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_${Date.now().toString().slice(-8)}`,
          notes: {
            planType,
            userId: session.userId,
            userEmail: session.email,
          },
        });
        razorpayOrderId = order.id;
        isMock = false;
      } catch (pgError: any) {
        console.error("Razorpay order creation error:", pgError);
        return NextResponse.json(
          {
            error: pgError.message || "Failed to initialize payment order with Razorpay",
          },
          { status: 500 }
        );
      }
    }

    // Save order record to authoritative Firestore
    let orderRecordId = `ord_${Date.now()}`;
    try {
      let businessSlug = session?.businessSlug;
      let businessId = session?.businessId;
      if (!businessSlug && session?.userId) {
        const biz = await FirestoreDB.getBusinessByUserId(session.userId);
        if (biz) {
          businessId = biz.id || biz.slug;
          businessSlug = biz.slug;
        }
      }

      const orderRecord = await FirestoreDB.createOrder({
        id: orderRecordId,
        businessId: businessId || null,
        businessSlug: businessSlug || null,
        userId: session.userId,
        userEmail: session.email || null,
        razorpayOrderId,
        amount: amountInPaise,
        currency: "INR",
        status: "created",
        planType,
        receipt: `rcpt_${Date.now().toString().slice(-8)}`,
      });
      orderRecordId = orderRecord.id;
    } catch (dbErr) {
      console.warn("Database order record creation notice:", dbErr);
    }

    return NextResponse.json({
      success: true,
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: key_id || "rzp_test_placeholder",
      isMock,
      planLabel,
      planType,
      prefill: {
        email: session.email,
      },
      orderRecordId,
    });
  } catch (error: any) {
    console.error("Create order API error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment order. Please try again." },
      { status: 500 }
    );
  }
}
