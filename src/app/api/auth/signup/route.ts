import { NextRequest, NextResponse } from "next/server";
import { FirestoreDB } from "@/lib/firestore-db";
import { createSessionPayload, SESSION_COOKIE_NAME, hashPassword } from "@/lib/auth";
import { checkRateLimit, rateLimitExceededResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rl = await checkRateLimit(req, "auth_signup", { limit: 5, windowSeconds: 60 });
    if (!rl.success) {
      return rateLimitExceededResponse(rl.limit, rl.resetAt);
    }

    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check existing in authoritative Firestore
    let existing = null;
    try {
      existing = await FirestoreDB.getUserByEmail(normalizedEmail);
    } catch (checkErr: any) {
      console.error("Database error during signup check:", checkErr);
      return NextResponse.json(
        { success: false, error: "Database error during registration. Please try again." },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);

    // Create user in authoritative Firestore
    const fsUser = await FirestoreDB.createUser({
      email: normalizedEmail,
      password: hashedPassword,
    });

    const userId = fsUser.id;

    const payload = createSessionPayload({
      userId,
      email: normalizedEmail,
    });

    // Record registration activity in Firestore for Super Admin audit log
    try {
      const userAgent = req.headers.get("user-agent") || "unknown";
      await FirestoreDB.createLoginLog({
        userId,
        email: normalizedEmail,
        businessSlug: "",
        provider: "New Account Registration",
        userAgent,
      });
    } catch {}

    const res = NextResponse.json({ success: true, redirect: "/onboarding" });
    res.cookies.set(SESSION_COOKIE_NAME, payload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });

    return res;
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { success: false, error: "Unable to create account. Please try again." },
      { status: 500 }
    );
  }
}

