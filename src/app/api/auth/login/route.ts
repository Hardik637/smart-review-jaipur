import { NextRequest, NextResponse } from "next/server";
import { FirestoreDB } from "@/lib/firestore-db";
import { createSessionPayload, SESSION_COOKIE_NAME, verifyPassword, hashPassword, checkIsSuperAdmin } from "@/lib/auth";
import { checkRateLimit, rateLimitExceededResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rl = await checkRateLimit(req, "auth_login", { limit: 5, windowSeconds: 60 });
    if (!rl.success) {
      return rateLimitExceededResponse(rl.limit, rl.resetAt);
    }

    const body = await req.json().catch(() => ({}));
    const { email, password, rememberMe = true } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Look up directly in authoritative Firestore
    let user: any = null;
    try {
      user = await FirestoreDB.getUserByEmail(normalizedEmail);
    } catch (dbErr: any) {
      console.error("Database error looking up user:", dbErr);
      return NextResponse.json(
        { success: false, error: "Database error during login. Please try again." },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 1. Verify password via local secure scrypt hash
    let isMatch = false;
    if (user.password) {
      isMatch = verifyPassword(password, user.password);
    }

    // 2. If not matched locally, verify with Firebase Authentication (e.g. after Firebase password reset)
    if (!isMatch) {
      try {
        const fbKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCLvs5UjkDh12b18iplyWpoUtP_PFDdzRU";
        const fbRes = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${fbKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: normalizedEmail,
              password,
              returnSecureToken: true,
            }),
          }
        );
        const fbData = await fbRes.json().catch(() => ({}));
        if (fbData && fbData.idToken) {
          isMatch = true;
          // Automatically sync local hash so future logins are instant
          const newHashedPassword = hashPassword(password);
          if (user.id) {
            await FirestoreDB.updateUser(user.id, {
              password: newHashedPassword,
            }).catch(() => {});
          }
        }
      } catch (fbErr) {
        console.warn("Firebase signin fallback note:", fbErr);
      }
    }

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    let business = user.business;
    if (!business && user.businessSlug) {
      business = await FirestoreDB.getBusinessBySlug(user.businessSlug).catch(() => null);
    }
    if (!business && user.id) {
      business = await FirestoreDB.getBusinessByUserId(user.id).catch(() => null);
    }

    const businessSlug = business?.slug || user.businessSlug || "";
    const businessId = business?.id || user.businessId || undefined;

    const maxAgeSeconds = rememberMe !== false ? 60 * 60 * 24 * 90 : 60 * 60 * 24 * 1; // 90 days vs 1 day
    const payload = createSessionPayload({
      userId: user.id,
      email: user.email,
      businessId,
      businessSlug: businessSlug || undefined,
    }, maxAgeSeconds);

    const isSuperAdmin = checkIsSuperAdmin(user.email);
    const redirectPath = isSuperAdmin
      ? (businessSlug ? "/dashboard" : "/admin-vault")
      : (businessSlug ? "/dashboard" : "/onboarding");

    // Record login activity in Firestore for Super Admin audit log
    try {
      const loginTime = new Date().toISOString();
      const userAgent = req.headers.get("user-agent") || "unknown";

      if (user.id) {
        await FirestoreDB.updateUser(user.id, {
          role: isSuperAdmin ? "admin" : (user.role || "user"),
          isPro: isSuperAdmin ? true : Boolean(user.isPro),
          planName: isSuperAdmin ? (user.planName || "Super Admin") : (user.planName || "Free"),
          lastLoginAt: loginTime,
          loginCount: (user.loginCount || 0) + 1,
          lastLoginProvider: "credentials",
        });
      }

      await FirestoreDB.createLoginLog({
        userId: user.id,
        email: user.email,
        businessSlug: businessSlug || "",
        provider: "Email & Password",
        userAgent,
      });
    } catch {}


    const res = NextResponse.json({
      success: true,
      redirect: redirectPath,
    });

    res.cookies.set(SESSION_COOKIE_NAME, payload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeSeconds,
    });

    return res;
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during sign in" },
      { status: 500 }
    );
  }
}
