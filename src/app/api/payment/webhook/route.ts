import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { FirestoreDB } from "@/lib/firestore-db";
import { FirestoreREST } from "@/lib/firestore-rest";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const webhookSignature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured on server.");
      return NextResponse.json({ error: "Webhook secret is unconfigured" }, { status: 500 });
    }

    const isValid = verifyWebhookSignature(rawBody, webhookSignature, webhookSecret);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType === "order.paid" || eventType === "payment.captured") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;

      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await FirestoreDB.getOrderByRazorpayOrderId(razorpayOrderId);

        if (order) {
          await FirestoreDB.updateOrder(order.id, {
            status: "paid",
            razorpayPaymentId: razorpayPaymentId || order.razorpayPaymentId,
          });

          if (order.userEmail) {
            try {
              const u = await FirestoreDB.getUserByEmail(order.userEmail);
              if (u) {
                const planTitle = order.planName || "Pro Plan";
                await FirestoreREST.setDocument("users", u.id, {
                  ...u,
                  isPro: true,
                  planName: planTitle,
                  planType: order.planType || "1y",
                });
                if (u.businessSlug) {
                  const b = await FirestoreDB.getBusinessBySlug(u.businessSlug);
                  if (b) {
                    await FirestoreREST.setDocument("businesses", b.slug || b.id, {
                      ...b,
                      isPro: true,
                      planName: planTitle,
                      planType: order.planType || "1y",
                      monthlyAiQuota: 999999,
                    });
                  }
                }
              }
            } catch (fsWebhookErr) {
              console.warn("Firestore webhook Pro sync note:", fsWebhookErr);
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "ok", received: true });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
