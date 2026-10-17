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
    // - 18 Months: ₹1,999 (199900 paise)
    // - 24 Months: ₹2,499 (249900 paise)
    // - 48 Months: ₹3,499 (349900 paise)
    let amountInPaise = 199900;
    let planLabel = "18 Months Access (₹1,999)";
    let planType = "18m";

    if (requestedPlan === "24m" || requestedPlan === "24months") {
      amountInPaise = 249900;
      planLabel = "24 Months Access (₹2,499)";
      planType = "24m";
    } else if (requestedPlan === "48m" || requestedPlan === "48months") {
      amountInPaise = 349900;
      planLabel = "48 Months Access (₹3,499)";
      planType = "48m";
    } else if (requestedPlan === "lifetime" || requestedPlan === "18m" || requestedPlan === "18months") {
      amountInPaise = 199900;
      planLabel = "18 Months Access (₹1,999)";
      planType = "18m";
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
