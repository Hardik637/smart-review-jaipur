import { NextRequest, NextResponse } from "next/server";
import { getSession, createSessionPayload, SESSION_COOKIE_NAME } from "@/lib/auth";
import { FirestoreDB } from "@/lib/firestore-db";
import { FirestoreREST } from "@/lib/firestore-rest";
import { checkRateLimit, rateLimitExceededResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Valid trial & VIP promo codes (case-insensitive)
const VALID_PROMO_CODES = [
  "VIP7",
  "FRIENDS7",
  "WELURIK7",
  "FREE7",
  "TRIAL7",
  "NITIN7",
  "MAYANK7",
  "SPECIAL7",
  "FRIEND7",
  "LAUNCH100",
  "WELURIK100",
  "FREE100",
  "VIP100",
  "PRO100",
  "ZERO100",
  "DISCOUNT100",
  "TEST100",
  "REVIEW100",
  "MAPS100",
  "GOOGLE100",
  "PRO7",
  "VIP",
  "FREE",
  "TRIAL",
  "PROMO",
  "LAUNCH",
  "OFFER",
];

export async function POST(req: NextRequest) {
  try {
    const rl = await checkRateLimit(req, "promo_code", { limit: 5, windowSeconds: 60 });
    if (!rl.success) {
      return rateLimitExceededResponse(rl.limit, rl.resetAt);
    }

    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { code, businessSlug: clientSlug, businessId: clientId, googleReviewUrl: clientGoogleUrl } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter a valid promo code." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    if (!VALID_PROMO_CODES.includes(cleanCode)) {
      return NextResponse.json(
        { success: false, error: "Invalid promo code. Please check with the administrator." },
        { status: 400 }
      );
    }

    const userId = session.userId;
    const userEmail = session.email;
    const businessSlug = clientSlug || session.businessSlug;

    // Enforce 1 promo code per account
    const existingRedemption = await FirestoreREST.getDocument("promo_redemptions", `${userId}_${cleanCode}`);
    if (existingRedemption) {
      return NextResponse.json(
        { success: false, error: "This promo code has already been redeemed on your account." },
        { status: 400 }
      );
    }

    // 7 Days from now for trial, or 365 days for 100% codes
    const isFullPass = cleanCode.includes("100") || cleanCode === "VIP" || cleanCode === "LAUNCH";
    const durationDays = isFullPass ? 365 : 7;
    const trialEndsAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const activationData = {
      isPro: true,
      planName: isFullPass ? "VIP Pro License" : "7-Day VIP Free Trial",
      trialEndsAt,
      promoCodeUsed: cleanCode,
      activatedAt: new Date().toISOString(),
    };

    // 1. Look up existing business belonging to this authenticated user
    let business: any = null;
    if (userId) {
      business = await FirestoreDB.getBusinessByUserId(userId);
    }
    if (!business && session.businessSlug) {
      const candidate = await FirestoreDB.getBusinessBySlug(session.businessSlug);
      if (candidate && (!candidate.userId || candidate.userId === userId)) {
        business = candidate;
      }
    }
    if (!business && userEmail) {
      const defaultSlug = userEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const candidate = await FirestoreDB.getBusinessBySlug(defaultSlug);
      if (candidate && (!candidate.userId || candidate.userId === userId)) {
        business = candidate;
      }
    }

    const targetSlug = business?.slug || session.businessSlug || (userEmail ? userEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-") : "my-business");
    const finalReviewUrl = business?.googleReviewUrl || clientGoogleUrl || "";

    // 2. Save/update business in Firestore
    const finalBusinessDoc = {
      ...(business || {}),
      id: business?.id || targetSlug,
      slug: targetSlug,
      name: business?.name || (userEmail ? userEmail.split("@")[0] : "My Business"),
      userId: userId,
      category: business?.category || "cafe",
      googleReviewUrl: finalReviewUrl,
      brandColor: business?.brandColor || "#16A34A",
      ...activationData,
    };

    await FirestoreREST.setDocument("businesses", targetSlug, finalBusinessDoc);

    // 3. Fast O(1) link in user_businesses
    await FirestoreREST.setDocument("user_businesses", userId, {
      userId,
      businessSlug: targetSlug,
      businessId: targetSlug,
      isPro: true,
      trialEndsAt,
      name: finalBusinessDoc.name,
    });

    // 4. Update User document directly in Firestore
    if (userEmail) {
      const user = await FirestoreDB.getUserByEmail(userEmail);
      if (user) {
        await FirestoreREST.setDocument("users", user.id, {
          ...user,
          businessSlug: targetSlug,
          businessId: targetSlug,
          ...activationData,
        });
      }
    }

    // Record promo redemption to prevent reuse
    await FirestoreREST.setDocument("promo_redemptions", `${userId}_${cleanCode}`, {
      userId,
      email: userEmail,
      code: cleanCode,
      redeemedAt: new Date().toISOString(),
    }).catch(() => {});

    const res = NextResponse.json({
      success: true,
      message: `🎉 Code "${cleanCode}" Applied! Your VIP Pro Access is active.`,
      trialEndsAt,
      isPro: true,
      businessSlug: targetSlug,
      redirect: "/dashboard",
    });

    // 6. Re-issue fresh session cookie so edge middleware & layout immediately reflect Pro status
    const payload = createSessionPayload({
      userId,
      email: userEmail,
      businessId: targetSlug,
      businessSlug: targetSlug,
    });

    res.cookies.set(SESSION_COOKIE_NAME, payload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (error: any) {
    console.error("Promo code activation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to apply promo code. Please try again." },
      { status: 500 }
    );
  }
}
