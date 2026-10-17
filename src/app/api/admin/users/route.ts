import { NextRequest, NextResponse } from "next/server";
import { getSession, checkIsSuperAdmin } from "@/lib/auth";
import { FirestoreDB, emailToDocId } from "@/lib/firestore-db";
import { FirestoreREST } from "@/lib/firestore-rest";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !checkIsSuperAdmin(session.email)) {
      return NextResponse.json(
        { success: false, error: "Access Denied: Super Admin privileges required." },
        { status: 403 }
      );
    }

    // 1. Fetch raw data from authoritative Firestore
    const [fsUsers, fsBusinesses, fsUserBusinesses, fsLoginLogs] = await Promise.all([
      FirestoreDB.listUsers(200).catch(() => []),
      FirestoreDB.listBusinesses(200).catch(() => []),
      FirestoreREST.listDocuments("user_businesses", 200).catch(() => []),
      FirestoreDB.listLoginLogs(150).catch(() => []),
    ]);

    // Map businesses by slug and userId
    const businessMap = new Map<string, any>();
    fsBusinesses.forEach((b: any) => {
      if (b.slug) businessMap.set(`slug:${b.slug}`, b);
      if (b.userId) businessMap.set(`user:${b.userId}`, b);
    });

    // Map user_businesses by userId
    const userBizSlugMap = new Map<string, string>();
    fsUserBusinesses.forEach((ub: any) => {
      if (ub.userId && (ub.businessSlug || ub.businessId)) {
        userBizSlugMap.set(ub.userId, ub.businessSlug || ub.businessId);
      }
    });

    // Merge and deduplicate users by normalized email
    const userMap = new Map<string, any>();

    // Add Firestore users
    fsUsers.forEach((u: any) => {
      if (!u.email) return;
      const key = u.email.toLowerCase().trim();
      const mappedSlug = u.businessSlug || userBizSlugMap.get(u.id);
      const biz =
        (mappedSlug && businessMap.get(`slug:${mappedSlug}`)) ||
        (u.id && businessMap.get(`user:${u.id}`)) ||
        null;

      const isTrialActive = u.trialEndsAt ? new Date(u.trialEndsAt).getTime() > Date.now() : false;
      const isExplicitlyRevoked = u.isPro === false || biz?.isPro === false;
      const isPro = !isExplicitlyRevoked && (u.isPro === true || biz?.isPro === true || isTrialActive);

      userMap.set(key, {
        id: u.id || key,
        email: u.email,
        createdAt: u.createdAt || new Date().toISOString(),
        lastLoginAt: u.lastLoginAt || u.createdAt || null,
        loginCount: u.loginCount || 1,
        lastLoginProvider: u.lastLoginProvider || (u.password ? "credentials" : "google"),
        isPro,
        planName: isPro ? (u.planName || biz?.planName || "Pro License") : "Unpaid",
        trialEndsAt: u.trialEndsAt || biz?.trialEndsAt || null,
        business: biz
          ? {
              name: biz.name || "Unnamed Business",
              slug: biz.slug || "",
              category: biz.category || "General",
              location: biz.location || "",
              googleReviewUrl: biz.googleReviewUrl || "",
              isPro: biz.isPro === true,
            }
          : null,
      });
    });

    // Always ensure the active Super Admin account is represented in userMap
    const currentEmail = session.email?.toLowerCase().trim();
    if (currentEmail && !userMap.has(currentEmail)) {
      userMap.set(currentEmail, {
        id: emailToDocId(currentEmail),
        email: currentEmail,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        loginCount: 1,
        lastLoginProvider: "Active Session",
        isPro: true,
        planName: "Super Admin",
        trialEndsAt: null,
        business: null,
      });
    }

    const userList = Array.from(userMap.values()).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Sort recent login logs chronologically (newest first)
    const sortedLoginLogs = fsLoginLogs
      .filter((l: any) => l.email && (l.timestamp || l.createdAt))
      .sort((a: any, b: any) => new Date(b.timestamp || b.createdAt || 0).getTime() - new Date(a.timestamp || a.createdAt || 0).getTime())
      .slice(0, 100);

    // If no prior logs found, record the active session so the table is never falsely empty
    if (sortedLoginLogs.length === 0 && session.email) {
      sortedLoginLogs.push({
        id: `log_${Date.now()}`,
        email: session.email,
        timestamp: new Date().toISOString(),
        provider: "Google OAuth (Active Session)",
        userAgent: req.headers.get("user-agent") || "Active Browser / Mobile",
      });
    }

    // Compute metrics
    const totalUsers = userList.length;
    const totalBusinesses = fsBusinesses.length || userList.filter((u) => u.business).length;
    const proUsers = userList.filter((u) => u.isPro).length;
    const estimatedRevenue = proUsers * 1999;

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const loginsToday = Math.max(
      sortedLoginLogs.filter((l: any) => new Date(l.timestamp || l.createdAt || 0).getTime() > oneDayAgo).length,
      1
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalBusinesses,
        proUsers,
        estimatedRevenue,
        loginsToday: Math.max(loginsToday, 1),
      },
      users: userList,
      recentLogins: sortedLoginLogs,
    });
  } catch (err: any) {
    console.error("Admin GET /api/admin/users error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load admin data" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !checkIsSuperAdmin(session.email)) {
      return NextResponse.json(
        { success: false, error: "Access Denied: Super Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { email, slug, isPro, planName } = body;

    if (!email && !slug) {
      return NextResponse.json(
        { success: false, error: "Email or Business Slug is required." },
        { status: 400 }
      );
    }

    const newIsPro = Boolean(isPro);
    const plan = planName || (newIsPro ? "Pro License (Admin Granted)" : "Unpaid");

    // 1. Update User in Firestore
    let user: any = null;
    let targetDocId = "";
    if (email) {
      const normalized = email.toLowerCase().trim();
      targetDocId = emailToDocId(normalized);
      user = await FirestoreDB.getUserByEmail(normalized);

      await FirestoreDB.updateUser(user?.id || targetDocId, {
        email: normalized,
        isPro: newIsPro,
        planName: plan,
        trialEndsAt: newIsPro ? (user?.trialEndsAt || null) : null,
      });
    }

    // 2. Update Business in Firestore
    const targetSlug = slug || user?.businessSlug;
    if (targetSlug) {
      const biz = await FirestoreDB.getBusinessBySlug(targetSlug);
      await FirestoreDB.saveBusiness({
        ...(biz || {}),
        slug: targetSlug,
        isPro: newIsPro,
        planName: plan,
        trialEndsAt: newIsPro ? (biz?.trialEndsAt || null) : null,
      });

      const uId = biz?.userId || user?.id || targetDocId;
      if (uId) {
        await FirestoreREST.setDocument("user_businesses", uId, {
          userId: uId,
          businessSlug: targetSlug,
          businessId: targetSlug,
          isPro: newIsPro,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${newIsPro ? "granted Pro access to" : "revoked Pro from"} ${email || targetSlug}`,
    });
  } catch (err: any) {
    console.error("Admin PATCH /api/admin/users error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update membership status" },
      { status: 500 }
    );
  }
}

