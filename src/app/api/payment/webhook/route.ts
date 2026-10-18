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

    // 1. One-time payment captured / order paid
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

    // 2. AutoPay Subscription Lifecycle Events
    if (
      eventType === "subscription.activated" ||
      eventType === "subscription.charged" ||
      eventType === "subscription.authenticated"
    ) {
      const subscriptionEntity = event.payload?.subscription?.entity;
      const paymentEntity = event.payload?.payment?.entity;

      const subscriptionId = subscriptionEntity?.id;
      const notes = subscriptionEntity?.notes || {};
      const userEmail = notes.userEmail || notes.email;
      const userId = notes.userId;
      const planType = (notes.planType || "1y").toLowerCase();

      let validDays = 365;
      let planTitle = "1 Year Access";
      if (planType === "1m" || planType === "1month") {
        validDays = 30;
        planTitle = "1 Month Access";
      } else if (planType === "3m" || planType === "3months") {
        validDays = 90;
        planTitle = "3 Months Access";
      } else if (planType === "6m" || planType === "6months") {
        validDays = 180;
        planTitle = "6 Months Access";
      }

      // Calculate new extended expiration date
      const now = Date.now();
      let currentExpiresAtMs = now;
      let targetUser: any = null;

      if (userEmail) {
        try {
          targetUser = await FirestoreDB.getUserByEmail(userEmail);
          if (targetUser?.expiresAt) {
            const existingExp = new Date(targetUser.expiresAt).getTime();
            if (existingExp > now) {
              currentExpiresAtMs = existingExp;
            }
          }
        } catch {}
      }

      const newExpiresAt = new Date(currentExpiresAtMs + validDays * 24 * 60 * 60 * 1000).toISOString();
      const activationTime = new Date().toISOString();

      // Update user Pro status
      if (targetUser) {
        try {
          await FirestoreREST.setDocument("users", targetUser.id, {
            ...targetUser,
            isPro: true,
            isAutoPay: true,
            subscriptionId: subscriptionId || targetUser.subscriptionId,
            planName: `${planTitle} Pro (AutoPay)`,
            planType,
            paidAt: activationTime,
            expiresAt: newExpiresAt,
          });

          if (targetUser.businessSlug) {
            const b = await FirestoreDB.getBusinessBySlug(targetUser.businessSlug);
            if (b) {
              await FirestoreREST.setDocument("businesses", b.slug || b.id, {
                ...b,
                isPro: true,
                isAutoPay: true,
                subscriptionId: subscriptionId || b.subscriptionId,
                planName: `${planTitle} Pro (AutoPay)`,
                planType,
                monthlyAiQuota: 999999,
                paidAt: activationTime,
                expiresAt: newExpiresAt,
              });
            }
          }
        } catch (subUpdateErr) {
          console.warn("Firestore subscription user update note:", subUpdateErr);
        }
      }

      // Log charge record in orders
      if (paymentEntity?.id) {
        try {
          await FirestoreREST.setDocument("orders", paymentEntity.id, {
            id: paymentEntity.id,
            paymentId: paymentEntity.id,
            subscriptionId: subscriptionId || null,
            isAutoPay: true,
            amount: paymentEntity.amount,
            currency: paymentEntity.currency || "INR",
            status: "paid",
            planType,
            planName: `${planTitle} (AutoPay Renewal)`,
            userEmail: userEmail || "",
            userId: userId || targetUser?.id || "",
            createdAt: activationTime,
            expiresAt: newExpiresAt,
          });
        } catch (logErr) {
          console.warn("Subscription charge order log notice:", logErr);
        }
      }
    }

    // 3. Subscription Cancelled / Halted
    if (eventType === "subscription.cancelled" || eventType === "subscription.halted") {
      const subscriptionEntity = event.payload?.subscription?.entity;
      const notes = subscriptionEntity?.notes || {};
      const userEmail = notes.userEmail || notes.email;

      if (userEmail) {
        try {
          const u = await FirestoreDB.getUserByEmail(userEmail);
          if (u) {
            await FirestoreREST.setDocument("users", u.id, {
              ...u,
              isAutoPay: false,
            });
            if (u.businessSlug) {
              const b = await FirestoreDB.getBusinessBySlug(u.businessSlug);
              if (b) {
                await FirestoreREST.setDocument("businesses", b.slug || b.id, {
                  ...b,
                  isAutoPay: false,
                });
              }
            }
          }
        } catch (cancelErr) {
          console.warn("Subscription cancellation update note:", cancelErr);
        }
      }
    }

    return NextResponse.json({ status: "ok", received: true });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

