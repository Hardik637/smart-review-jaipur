import { NextRequest, NextResponse } from "next/server";
import { FirestoreDB } from "@/lib/firestore-db";
import { createSessionPayload, SESSION_COOKIE_NAME, hashPassword, checkIsSuperAdmin } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { idToken, name, picture } = body;

    let email = "";
    let verifiedName = name || "";
    let verifiedPicture = picture || "";

    // SECURITY: Always require idToken — verify via Google tokeninfo or Firebase Auth JWT
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid Google ID token is required." },
        { status: 401 }
      );
    }

    try {
      // 1. Try Google OAuth tokeninfo
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (googleRes.ok) {
        const tokenInfo = await googleRes.json();
        if (tokenInfo?.email) {
          const expectedAud = process.env.GOOGLE_CLIENT_ID;
          if (expectedAud && tokenInfo.aud && tokenInfo.aud !== expectedAud) {
            console.warn("Google ID token audience mismatch:", tokenInfo.aud);
          } else {
            email = tokenInfo.email;
            verifiedName = tokenInfo.name || verifiedName;
            verifiedPicture = tokenInfo.picture || verifiedPicture;
          }
        }
      }

      // 2. If not standard Google OAuth, verify via Google Firebase Identity Toolkit
      if (!email) {
        const fbApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB7nnrGVSUxVTmKw4t6qXrBVxAGbxarVvE";
        const fbRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${fbApiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        if (fbRes.ok) {
          const fbData = await fbRes.json();
          const userRec = fbData.users?.[0];
          if (userRec?.email) {
            email = userRec.email;
            verifiedName = userRec.displayName || verifiedName;
            verifiedPicture = userRec.photoUrl || verifiedPicture;
          }
        }
      }
    } catch (tokenErr) {
      console.error("Google/Firebase token verification error:", tokenErr);
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Google token verification failed or expired." },
        { status: 401 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 3. Look up existing user in Firestore
    let user = await FirestoreDB.getUserByEmail(normalizedEmail);
    let userId = user?.id;

    // 4. If new user, create account automatically in Firestore
    if (!user) {
      const randomPassword = crypto.randomBytes(24).toString("hex");
      const hashedPassword = hashPassword(randomPassword);

      const fsUser = await FirestoreDB.createUser({
        email: normalizedEmail,
        password: hashedPassword,
        name: verifiedName,
      });
      if (fsUser) {
        userId = fsUser.id;
        user = fsUser;
      }
    }

    // 5. Look up existing business
    let business = user?.business;
    if (!business && user?.businessSlug) {
      business = await FirestoreDB.getBusinessBySlug(user.businessSlug);
    }
    if (!business && userId) {
      business = await FirestoreDB.getBusinessByUserId(userId);
    }

    // Check if a business exists under the email prefix slug belonging to this user
    if (!business) {
      const emailSlug = normalizedEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const candidate = await FirestoreDB.getBusinessBySlug(emailSlug);
      if (candidate && (!candidate.userId || candidate.userId === userId)) {
        business = candidate;
      }
    }

    const businessSlug = business?.slug || user?.businessSlug || "";
    const businessId = business?.id || user?.businessId || undefined;

    // Permanently link business on user profile
    if (business && (!user?.businessSlug || user.businessSlug !== businessSlug)) {
      await FirestoreDB.updateUser(user.id, {
        businessSlug,
        businessId,
      });
    }

    const payload = createSessionPayload({
      userId: userId || user.id,
      email: normalizedEmail,
      businessId,
      businessSlug: businessSlug || undefined,
    }, 60 * 60 * 24 * 90);

    const isSuperAdmin = checkIsSuperAdmin(normalizedEmail);
    const redirectPath = isSuperAdmin
      ? (businessSlug ? "/dashboard" : "/admin-vault")
      : (businessSlug ? "/dashboard" : "/onboarding");

    // Record login activity in Firestore for Super Admin audit log
    try {
      const loginTime = new Date().toISOString();
      const userAgent = req.headers.get("user-agent") || "unknown";

      if (user?.id || userId) {
        const uId = user?.id || userId;
        await FirestoreDB.updateUser(uId, {
          email: normalizedEmail,
          role: isSuperAdmin ? "admin" : (user?.role || "user"),
          isPro: isSuperAdmin ? true : Boolean(user?.isPro),
          planName: isSuperAdmin ? (user?.planName || "Super Admin") : (user?.planName || "Free"),
          lastLoginAt: loginTime,
          loginCount: ((user?.loginCount) || 0) + 1,
          lastLoginProvider: "google",
        });
      }

      await FirestoreDB.createLoginLog({
        userId: user?.id || userId,
        email: normalizedEmail,
        businessSlug: businessSlug || "",
        provider: "Google OAuth",
        userAgent,
      });
    } catch {}


    const res = NextResponse.json({
      success: true,
      redirect: redirectPath,
      user: {
        id: userId,
        email: normalizedEmail,
        name: verifiedName,
        picture: verifiedPicture,
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, payload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90, // 90 days
    });

    return res;
  } catch (err: any) {
    console.error("Google Auth Route Error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during Google sign-in." },
      { status: 500 }
    );
  }
}
