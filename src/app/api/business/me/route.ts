import { NextRequest, NextResponse } from "next/server";
import { getSession, checkIsSuperAdmin, IMPERSONATE_COOKIE_NAME } from "@/lib/auth";
import { FirestoreDB } from "@/lib/firestore-db";
import { FirestoreREST } from "@/lib/firestore-rest";
import { getCategoryById } from "@/lib/categories";
import { parseTopicItem, parseServiceItem } from "@/lib/sanitize-items";

export const dynamic = "force-dynamic";

function safeParseArray(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [raw];
    } catch {
      return raw ? [raw] : [];
    }
  }
  return [];
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const isFounderSuperAdmin = checkIsSuperAdmin(session.email);

    // Check for super admin client inspection / impersonation
    let impersonateSlug: string | null = null;
    let isImpersonating = false;
    let impersonatedClientEmail: string | null = null;

    if (isFounderSuperAdmin) {
      const querySlug = req.nextUrl.searchParams.get("impersonate");
      const cookieSlug = req.cookies.get(IMPERSONATE_COOKIE_NAME)?.value;
      impersonateSlug = querySlug || cookieSlug || null;
    }

    let business: any = null;
    let userDoc: any = null;

    if (isFounderSuperAdmin && impersonateSlug) {
      business = await FirestoreDB.getBusinessBySlug(impersonateSlug).catch(() => null);

      if (business) {
        isImpersonating = true;
        if (business.userId) {
          const ownerDoc = await FirestoreDB.getUserById(business.userId).catch(() => null);
          if (ownerDoc) {
            userDoc = ownerDoc;
            impersonatedClientEmail = ownerDoc.email || null;
          }
        }
      }
    }

    // Normal client / merchant lookup if not in impersonation mode
    if (!business) {
      // 1. Authoritative Firestore Direct Lookups
      if (session.email) {
        userDoc = await FirestoreDB.getUserByEmail(session.email);
      }

      // Check if user requested a specific branch/location they own
      const branchSlug = req.nextUrl.searchParams.get("branch") || req.nextUrl.searchParams.get("slug");
      if (branchSlug) {
        const candidateBiz = await FirestoreDB.getBusinessBySlug(branchSlug);
        if (candidateBiz && (candidateBiz.userId === session.userId || candidateBiz.email === session.email)) {
          business = candidateBiz;
        }
      }

      if (!business && session.businessSlug) {
        business = await FirestoreDB.getBusinessBySlug(session.businessSlug);
      }
      if (!business && userDoc?.businessSlug) {
        business = await FirestoreDB.getBusinessBySlug(userDoc.businessSlug);
      }
      if (!business) {
        business = await FirestoreDB.getBusinessByUserId(session.userId);
      }
    }



    // If user is authenticated, create or provide default active workspace with their real details
    if (!business) {
      const fallbackSlug = session.email ? session.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-") : "my-business";
      business = await FirestoreDB.saveBusiness({
        slug: fallbackSlug,
        name: session.email?.split("@")[0] || "My Business",
        category: "cafe",
        location: "",
        description: "",
        googleReviewUrl: userDoc?.googleReviewUrl || "",
        brandColor: "#0f172a",
        userId: session.userId,
        isPro: userDoc?.isPro || false,
        planName: userDoc?.planName || "unpaid",
        trialEndsAt: userDoc?.trialEndsAt || null,
        services: [{ id: "srv_0", name: "General Service" }],
        topics: [
          { id: "top_0", name: "Fast Service", type: "positive" },
          { id: "top_1", name: "Friendly Staff", type: "positive" },
          { id: "top_2", name: "High Quality", type: "positive" },
        ],
      });
    }

    // Hydrate metrics from Firestore (the primary live data store)
    let analytics: any[] = [];
    let reviewSessions: any[] = [];
    let feedbacks: any[] = [];

    if (business.slug) {
      try {
        const [fsReviews, fsFeedbacks, fsAnalytics] = await Promise.all([
          FirestoreDB.getReviewsBySlug(business.slug, 5000),
          FirestoreDB.getFeedbacksBySlug(business.slug, 1000),
          FirestoreDB.getAnalyticsBySlug(business.slug, 10000),
        ]);
        if (fsReviews && fsReviews.length > 0) reviewSessions = fsReviews;
        if (fsFeedbacks && fsFeedbacks.length > 0) feedbacks = fsFeedbacks;
        if (fsAnalytics && fsAnalytics.length > 0) analytics = fsAnalytics;
      } catch (err) {
        console.warn("Firestore metrics load warning:", err);
      }
    }

    // Fallback to embedded Prisma models if Firestore collections returned empty
    if (reviewSessions.length === 0 && business.reviewSessions?.length) {
      reviewSessions = business.reviewSessions;
    }
    if (feedbacks.length === 0 && business.feedbacks?.length) {
      feedbacks = business.feedbacks;
    }
    if (analytics.length === 0 && business.analyticsEvents?.length) {
      analytics = business.analyticsEvents;
    }

    // Sort reviewSessions newest first
    reviewSessions.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    // Calculate metrics
    const totalScans = analytics.filter((a: any) => a.eventType === "scan").length;
    const reviewsGenerated = reviewSessions.length;
    const googleClicks = analytics.filter((a: any) => a.eventType === "google_clicked").length;
    const rawConversion = totalScans > 0 ? Math.round((googleClicks / totalScans) * 100) : 0;
    const conversionRate = `${Math.min(100, Math.max(0, rawConversion))}%`;
    const unreadFeedbackCount = feedbacks.filter((f: any) => f.status === "unread").length;

    let isTrialActive = false;
    // Check trial only if not explicitly revoked
    if (business.trialEndsAt && business.isPro !== false && userDoc?.isPro !== false) {
      isTrialActive = new Date(business.trialEndsAt).getTime() > Date.now();
    }
    if (!isTrialActive && session.email && business.isPro !== false && userDoc?.isPro !== false) {
      if (userDoc?.trialEndsAt) {
        isTrialActive = new Date(userDoc.trialEndsAt).getTime() > Date.now();
      }
    }

    // Determine final isProAccount status
    let isProAccount = false;
    if (isFounderSuperAdmin && !isImpersonating) {
      isProAccount = true;
    } else if (userDoc?.isPro === false || business?.isPro === false) {
      // Explicitly revoked by Admin Vault
      isProAccount = false;
      isTrialActive = false;
    } else if (business?.isPro === true || userDoc?.isPro === true || isTrialActive) {
      isProAccount = true;
    }

    if (business) {
      business.isPro = isProAccount;
      if (!isProAccount) {
        business.planName = "Unpaid";
        business.trialEndsAt = null;
      }
    }

    const catConfig = getCategoryById(business.category || "cafe");

    // Clean and normalize services
    let safeServices: any[] = [];
    if (Array.isArray(business.services) && business.services.length > 0) {
      safeServices = business.services
        .map((s: any) => parseServiceItem(s))
        .filter(Boolean);
    }
    if (safeServices.length === 0) {
      safeServices = catConfig.defaultServices.map((name, idx) => ({ id: `srv_${idx}`, name }));
    }

    // Clean and normalize topics
    let safeTopics: any[] = [];
    if (Array.isArray(business.topics) && business.topics.length > 0) {
      safeTopics = business.topics
        .map((t: any) => parseTopicItem(t))
        .filter(Boolean);
    }
    if (safeTopics.length === 0) {
      safeTopics = [
        ...catConfig.positiveTopics.map((name, idx) => ({ id: `top_pos_${idx}`, name, type: "positive" })),
        ...catConfig.issueTopics.map((name, idx) => ({ id: `top_iss_${idx}`, name, type: "issue" })),
      ];
    }

    const responsePayload = {
      success: true,
      isSuperAdmin: isFounderSuperAdmin,
      isImpersonating,
      impersonatedSlug: isImpersonating ? business.slug : undefined,
      impersonatedBusinessName: isImpersonating ? business.name : undefined,
      impersonatedClientEmail: isImpersonating ? (impersonatedClientEmail || undefined) : undefined,
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        category: business.category,
        location: business.location || "",
        description: business.description || "",
        googleReviewUrl: business.googleReviewUrl,
        brandColor: business.brandColor || "#16A34A",
        phone: business.phone || "",
        isPro: isProAccount,
        trialEndsAt: business.trialEndsAt,
        isTrialActive,
        planName: business.planName || (isTrialActive ? "Pro Trial" : "pro"),
        monthlyAiQuota: business.monthlyAiQuota || 10000,
        aiCallsThisMonth: business.aiCallsThisMonth || 0,
        services: safeServices,
        topics: safeTopics,
      },
      metrics: {
        totalScans,
        reviewsGenerated,
        googleClicks,
        conversionRate,
      },
      recentReviews: reviewSessions.map((r: any) => ({
        id: r.id,
        rating: r.rating || 5,
        selectedTopics: safeParseArray(r.selectedTopics),
        selectedServices: safeParseArray(r.selectedServices),
        generatedReview: r.generatedReview || r.reviewText || "",
        status: r.status || "completed",
        createdAt: new Date(r.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      })),
      unreadFeedbackCount,
    };

    const res = NextResponse.json(responsePayload);

    // If query param 'impersonate' was explicitly provided in GET request by super admin, persist cookie
    const querySlug = req.nextUrl.searchParams.get("impersonate");
    if (isFounderSuperAdmin && querySlug && isImpersonating && business.slug) {
      res.cookies.set(IMPERSONATE_COOKIE_NAME, business.slug, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
      });
    }

    return res;
  } catch (error: any) {
    console.error("GET /api/business/me error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const isFounderSuperAdmin = checkIsSuperAdmin(session.email);
    const impersonateSlug = isFounderSuperAdmin
      ? (req.cookies.get(IMPERSONATE_COOKIE_NAME)?.value || req.nextUrl.searchParams.get("impersonate") || null)
      : null;

    const body = await req.json();
    const { name, category, location, description, googleReviewUrl, brandColor, phone, services, topics } = body;

    // Fetch existing business first to lock slug and preserve assets
    let existingBusiness: any = null;
    if (isFounderSuperAdmin && impersonateSlug) {
      existingBusiness = await FirestoreDB.getBusinessBySlug(impersonateSlug).catch(() => null);
    }
    if (!existingBusiness && session.businessSlug) {
      existingBusiness = await FirestoreDB.getBusinessBySlug(session.businessSlug).catch(() => null);
    }
    if (!existingBusiness && session.email) {
      const userDoc = await FirestoreDB.getUserByEmail(session.email).catch(() => null);
      if (userDoc?.businessSlug) {
        existingBusiness = await FirestoreDB.getBusinessBySlug(userDoc.businessSlug).catch(() => null);
      }
    }
    if (!existingBusiness) {
      existingBusiness = await FirestoreDB.getBusinessByUserId(session.userId).catch(() => null);
    }

    const effectiveSlug = existingBusiness?.slug || session.businessSlug || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : `biz-${Date.now().toString(36)}`);


    // Sanitize services and topics
    const cleanServices = Array.isArray(services)
      ? services
          .map((s: any) => parseServiceItem(s))
          .filter(Boolean)
      : (existingBusiness?.services || []).map((s: any) => parseServiceItem(s)).filter(Boolean);

    const cleanTopics = Array.isArray(topics)
      ? topics
          .map((t: any) => parseTopicItem(t))
          .filter(Boolean)
      : (existingBusiness?.topics || []).map((t: any) => parseTopicItem(t)).filter(Boolean);

    // Save business directly to authoritative Firestore
    const fsData = {
      ...(existingBusiness || {}),
      userId: session.userId,
      name: name || existingBusiness?.name || "My Business",
      slug: effectiveSlug,
      category: category || existingBusiness?.category || "cafe",
      location: location !== undefined ? location : existingBusiness?.location || "",
      description: description !== undefined ? description : existingBusiness?.description || "",
      googleReviewUrl: googleReviewUrl !== undefined ? googleReviewUrl : existingBusiness?.googleReviewUrl || "",
      brandColor: brandColor || existingBusiness?.brandColor || "#16A34A",
      phone: phone !== undefined ? phone : existingBusiness?.phone || "",
      services: cleanServices,
      topics: cleanTopics,
    };
    
    const savedBusiness = await FirestoreDB.saveBusiness(fsData);

    // Ensure user document in Firestore is linked
    if (session.email) {
      try {
        const user = await FirestoreDB.getUserByEmail(session.email);
        if (user) {
          await FirestoreDB.updateUser(user.id, {
            businessSlug: effectiveSlug,
            businessName: fsData.name,
          });
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      business: {
        ...savedBusiness,
        services: cleanServices,
        topics: cleanTopics,
      },
    });
  } catch (error: any) {
    console.error("PUT /api/business/me error:", error);
    return NextResponse.json({ success: false, error: "Failed to save business profile" }, { status: 500 });
  }
}

