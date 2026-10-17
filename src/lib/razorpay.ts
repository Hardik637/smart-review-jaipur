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
