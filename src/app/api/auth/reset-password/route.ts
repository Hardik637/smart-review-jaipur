import { NextRequest, NextResponse } from "next/server";
import { FirestoreDB } from "@/lib/firestore-db";
import { hashPassword } from "@/lib/auth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code") || req.nextUrl.searchParams.get("token") || "";
    if (!code) {
      return NextResponse.json({ valid: false, error: "Missing reset code" }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(code).digest("hex");

    // 1. Check in authoritative Firestore
    try {
      const fsToken = await FirestoreDB.getResetToken(tokenHash);
      if (fsToken) {
        if (fsToken.usedAt || (fsToken.expiresAt && new Date(fsToken.expiresAt).getTime() < Date.now())) {
          return NextResponse.json({ valid: false, error: "Link expired or already used" }, { status: 400 });
        }
        return NextResponse.json({ valid: true, email: fsToken.email });
      }
    } catch {}

    // 2. Check with Firebase Identity Toolkit (if dispatched via Firebase Auth client SDK)
    try {
      const fbKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB7nnrGVSUxVTmKw4t6qXrBVxAGbxarVvE";
      const fbRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${fbKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oobCode: code }),
      });
      const fbData = await fbRes.json().catch(() => ({}));
      if (fbData && fbData.email) {
        return NextResponse.json({ valid: true, email: fbData.email });
      }
    } catch {}

    return NextResponse.json({ valid: false, error: "Invalid reset link" }, { status: 400 });
  } catch {
    return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, code, newPassword } = body;
    const resetCode = token || code;

    // STRICT SECURITY: A valid reset token is MANDATORY. No unverified email updates permitted!
    if (!resetCode || typeof resetCode !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid password reset token is required." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(resetCode).digest("hex");
    let userIdToUpdate: string | null = null;
    let userEmail: string | null = null;

    // 1. Verify token in authoritative Firestore
    try {
      const fsToken = await FirestoreDB.getResetToken(tokenHash);
      if (fsToken) {
        if (fsToken.usedAt) {
          return NextResponse.json(
            { success: false, error: "This password reset link has already been used. Please request a new one." },
            { status: 400 }
          );
        }

        if (fsToken.expiresAt && new Date(fsToken.expiresAt).getTime() < Date.now()) {
          return NextResponse.json(
            { success: false, error: "This password reset link has expired. Please request a new one." },
            { status: 400 }
          );
        }

        userIdToUpdate = fsToken.userId;
        userEmail = fsToken.email || null;
      }
    } catch (tokenErr) {
      console.warn("Firestore reset token verify note:", tokenErr);
    }

    // 2. Verify with Google Identity Toolkit if code is a Firebase Action Code (oobCode)
    if (!userIdToUpdate) {
      try {
        const fbKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB7nnrGVSUxVTmKw4t6qXrBVxAGbxarVvE";
        const fbRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${fbKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            oobCode: resetCode,
            newPassword,
          }),
        });
        const fbData = await fbRes.json().catch(() => ({}));
        if (fbData && fbData.email) {
          const verifiedEmail = fbData.email.toLowerCase().trim();
          userEmail = verifiedEmail;
          const targetUser = await FirestoreDB.getUserByEmail(verifiedEmail);
          if (targetUser?.id) {
            userIdToUpdate = targetUser.id;
          }
        }
      } catch (fbErr) {
        console.warn("Firebase reset verification note:", fbErr);
      }
    }

    // STRICT REJECTION: If token wasn't found or validated, abort!
    if (!userIdToUpdate) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired password reset link. Please request a new one." },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(newPassword);

    // 3. Update password in authoritative Firestore
    try {
      const targetDocId = userIdToUpdate;
      await FirestoreDB.updateUser(targetDocId, {
        password: hashedPassword,
      });

      // Mark token as used in Firestore
      await FirestoreDB.markResetTokenUsed(tokenHash);
    } catch (fsErr) {
      console.error("Firestore password update error:", fsErr);
      return NextResponse.json(
        { success: false, error: "Failed to update password in database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now sign in with your new password.",
    });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to reset password. Please try again." },
      { status: 500 }
    );
  }
}

