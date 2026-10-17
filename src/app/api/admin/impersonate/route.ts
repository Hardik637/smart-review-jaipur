import { NextRequest, NextResponse } from "next/server";
import { getSession, checkIsSuperAdmin, IMPERSONATE_COOKIE_NAME } from "@/lib/auth";
import { FirestoreDB, emailToDocId } from "@/lib/firestore-db";
import { FirestoreREST } from "@/lib/firestore-rest";

export const dynamic = "force-dynamic";

/**
 * GET current impersonation state and list of client businesses for quick switching
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !checkIsSuperAdmin(session.email)) {
      return NextResponse.json(
        { success: false, error: "Access Denied: Super Admin required." },
        { status: 403 }
      );
    }

    const activeSlug = req.cookies.get(IMPERSONATE_COOKIE_NAME)?.value || null;

    // Fetch businesses for switcher dropdown
    const fsBusinesses = await FirestoreDB.listBusinesses(100).catch(() => []);

    const bizMap = new Map<string, { slug: string; name: string; category?: string }>();
    fsBusinesses.forEach((b: any) => {
      if (b.slug && b.name) {
        bizMap.set(b.slug, { slug: b.slug, name: b.name, category: b.category });
      }
    });

    const clients = Array.from(bizMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      isSuperAdmin: true,
      isImpersonating: Boolean(activeSlug),
      activeSlug,
      clients,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}

/**
 * POST switch into / inspect a client's dashboard
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !checkIsSuperAdmin(session.email)) {
      return NextResponse.json(
        { success: false, error: "Access Denied: Super Admin required." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    let targetSlug: string = (body.slug || "").trim();
    const targetEmail: string = (body.email || "").trim().toLowerCase();

    // If slug not provided, try resolving from email
    if (!targetSlug && targetEmail) {
      const userDoc = await FirestoreDB.getUserByEmail(targetEmail).catch(() => null);
      if (userDoc?.businessSlug) {
        targetSlug = userDoc.businessSlug;
      } else {
        const userBiz = await FirestoreREST.getDocument("user_businesses", emailToDocId(targetEmail)).catch(() => null);
        if (userBiz?.businessSlug || userBiz?.businessId) {
          targetSlug = userBiz.businessSlug || userBiz.businessId;
        }
      }
    }

    if (!targetSlug) {
      return NextResponse.json(
        { success: false, error: "A client business slug or valid email is required." },
        { status: 400 }
      );
    }

    // Verify target business exists in authoritative Firestore
    const targetBiz = await FirestoreDB.getBusinessBySlug(targetSlug).catch(() => null);

    if (!targetBiz) {
      return NextResponse.json(
        { success: false, error: `Business with slug '${targetSlug}' could not be located.` },
        { status: 404 }
      );
    }


    const response = NextResponse.json({
      success: true,
      message: `Switched into dashboard for ${targetBiz.name}`,
      slug: targetSlug,
      businessName: targetBiz.name,
    });

    // Set secure impersonation cookie
    response.cookies.set(IMPERSONATE_COOKIE_NAME, targetSlug, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to switch account" },
      { status: 500 }
    );
  }
}

/**
 * DELETE exit impersonation and return to Super Admin's default view
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !checkIsSuperAdmin(session.email)) {
      return NextResponse.json(
        { success: false, error: "Access Denied: Super Admin required." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Exited client inspection mode.",
    });

    response.cookies.set(IMPERSONATE_COOKIE_NAME, "", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to exit inspection" },
      { status: 500 }
    );
  }
}
