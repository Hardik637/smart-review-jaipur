import Razorpay from "razorpay";
import crypto from "crypto";

export const getRazorpayInstance = () => {
  const key_id =
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials are not configured in environment variables.");
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
};

export const verifyRazorpaySignature = ({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean => {
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret || !signature) return false;

  try {
    const generatedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const sigBuf = Buffer.from(signature, "utf-8");
    const genBuf = Buffer.from(generatedSignature, "utf-8");

    if (sigBuf.length !== genBuf.length) return false;
    return crypto.timingSafeEqual(genBuf, sigBuf);
  } catch {
    return false;
  }
};

export const verifyWebhookSignature = (
  bodyString: string,
  webhookSignature: string,
  webhookSecret: string
): boolean => {
  if (!webhookSecret || !webhookSignature) return false;

  try {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(bodyString)
      .digest("hex");

    const sigBuf = Buffer.from(webhookSignature, "utf-8");
    const genBuf = Buffer.from(expectedSignature, "utf-8");

    if (sigBuf.length !== genBuf.length) return false;
    return crypto.timingSafeEqual(genBuf, sigBuf);
  } catch {
    return false;
  }
};

export const verifyRazorpaySubscriptionSignature = ({
  subscriptionId,
  paymentId,
  signature,
}: {
  subscriptionId: string;
  paymentId: string;
  signature: string;
}): boolean => {
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret || !signature) return false;

  try {
    const generatedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(`${paymentId}|${subscriptionId}`)
      .digest("hex");

    const sigBuf = Buffer.from(signature, "utf-8");
    const genBuf = Buffer.from(generatedSignature, "utf-8");

    if (sigBuf.length !== genBuf.length) return false;
    return crypto.timingSafeEqual(genBuf, sigBuf);
  } catch {
    return false;
  }
};

export interface SubscriptionPlanConfig {
  period: "monthly" | "yearly";
  interval: number;
  amount: number; // in paise
  name: string;
  total_count: number;
  validDays: number;
  description: string;
}

export const RAZORPAY_PLANS_CONFIG: Record<string, SubscriptionPlanConfig> = {
  "1m": {
    period: "monthly",
    interval: 1,
    amount: 19900,
    name: "Welurik Review Pro (1 Month AutoPay)",
    total_count: 60,
    validDays: 30,
    description: "Welurik Review Monthly Recurring Subscription",
  },
  "3m": {
    period: "monthly",
    interval: 3,
    amount: 57400,
    name: "Welurik Review Pro (3 Months AutoPay)",
    total_count: 20,
    validDays: 90,
    description: "Welurik Review 3-Month Recurring Subscription",
  },
  "6m": {
    period: "monthly",
    interval: 6,
    amount: 109900,
    name: "Welurik Review Pro (6 Months AutoPay)",
    total_count: 10,
    validDays: 180,
    description: "Welurik Review 6-Month Recurring Subscription",
  },
  "1y": {
    period: "yearly",
    interval: 1,
    amount: 200000,
    name: "Welurik Review Pro (1 Year AutoPay)",
    total_count: 5,
    validDays: 365,
    description: "Welurik Review Annual Recurring Subscription",
  },
};

export async function getOrCreateRazorpayPlan(planKey: string): Promise<{ id: string; config: SubscriptionPlanConfig }> {
  const normalizedKey =
    planKey === "1month"
      ? "1m"
      : planKey === "3months"
      ? "3m"
      : planKey === "6months"
      ? "6m"
      : planKey === "1year" || planKey === "12m"
      ? "1y"
      : planKey;
  const config = RAZORPAY_PLANS_CONFIG[normalizedKey] || RAZORPAY_PLANS_CONFIG["1y"];
  const razorpay = getRazorpayInstance();

  // Try to find existing plan on Razorpay account to avoid duplicate plans
  try {
    const existing = await razorpay.plans.all({ count: 50 });
    const items = existing?.items || [];
    const matched = items.find(
      (p: any) =>
        p.period === config.period &&
        p.interval === config.interval &&
        p.item?.amount === config.amount &&
        p.item?.currency === "INR"
    );
    if (matched && matched.id) {
      return { id: matched.id, config };
    }
  } catch (err) {
    console.warn("Could not list existing plans, will attempt direct creation:", err);
  }

  // Create new plan on Razorpay
  const created = await razorpay.plans.create({
    period: config.period,
    interval: config.interval,
    item: {
      name: config.name,
      amount: config.amount,
      currency: "INR",
      description: config.description,
    },
    notes: {
      platform: "welurik",
      planKey: normalizedKey,
    },
  });

  return { id: created.id, config };
}
