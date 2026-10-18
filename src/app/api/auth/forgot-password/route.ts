import { NextRequest, NextResponse } from "next/server";
import { FirestoreDB } from "@/lib/firestore-db";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, rateLimitExceededResponse } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rl = await checkRateLimit(req, "auth_forgot_password", { limit: 3, windowSeconds: 60 });
    if (!rl.success) {
      return rateLimitExceededResponse(rl.limit, rl.resetAt);
    }

    const body = await req.json().catch(() => ({}));
    const { email } = body;

    // Generic response message to prevent email enumeration
    const genericResponse = {
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    };

    if (!email || typeof email !== "string") {
      return NextResponse.json(genericResponse);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Look up user in authoritative Firestore
    let user = await FirestoreDB.getUserByEmail(normalizedEmail).catch(() => null);

    if (user && user.id) {
      // Generate cryptographically secure unguessable random token
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry

      // Save token hash in authoritative Firestore
      try {
        await FirestoreDB.saveResetToken(tokenHash, {
          userId: user.id,
          email: normalizedEmail,
          expiresAt,
        });
      } catch (tokenErr) {
        console.warn("Reset token creation note:", tokenErr);
      }

      // Build secure reset URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
      const proto = req.headers.get("x-forwarded-proto") || "https";
      const origin = appUrl || (host ? `${proto}://${host}` : "http://localhost:3000");
      const resetLink = `${origin}/reset-password?token=${rawToken}&uid=${user.id}`;


      // Dispatch email in background through configured SMTP (if set)
      sendPasswordResetEmail({
        to: normalizedEmail,
        resetLink,
      }).catch((emailErr) => {
        console.error("Email dispatch failed:", emailErr);
      });

      // Dispatch real password reset email via Google Identity Toolkit
      const fbKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCLvs5UjkDh12b18iplyWpoUtP_PFDdzRU";
      fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${fbKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "PASSWORD_RESET",
          email: normalizedEmail,
          continueUrl: `${origin}/reset-password`,
        }),
      }).catch((fbErr) => {
        console.warn("Identity Toolkit reset dispatch note:", fbErr);
      });
    }

    // STRICT SECURITY: Never leak resetLink or emailPreviewUrl in API response!
    return NextResponse.json(genericResponse);
  } catch (err: any) {
    console.error("Forgot password handler error:", err);
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  }
}
