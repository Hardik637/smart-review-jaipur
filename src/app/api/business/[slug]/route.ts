import { NextRequest, NextResponse } from "next/server";
import { FirestoreDB } from "@/lib/firestore-db";
import { getCategoryById } from "@/lib/categories";
import { getSession } from "@/lib/auth";
import { parseTopicItem, parseServiceItem } from "@/lib/sanitize-items";

// In-memory LRU/TTL cache for public business metadata (sub-10ms responses)
interface CachedBusiness {
  data: any;
  timestamp: number;
}
const businessCache = new Map<string, CachedBusiness>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

// GET business by slug (Powered by Authoritative Firebase Firestore + Edge Caching)
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    if (!slug) {
      return NextResponse.json({ success: false, error: "Missing slug" }, { status: 400 });
    }

    // 1. Instant cache hit
    const cached = businessCache.get(slug);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(
        { success: true, business: cached.data },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
            "X-Cache": "HIT",
          },
        }
      );
    }

    const business = await FirestoreDB.getBusinessBySlug(slug);

    if (!business) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
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

    const safeBusiness = {
      id: business.id || business.slug,
      name: business.name,
      slug: business.slug,
      category: business.category,
      location: business.location || "",
      description: business.description || "",
      googleReviewUrl: business.googleReviewUrl || "",
      brandColor: business.brandColor || "#16A34A",
      logoUrl: business.logoUrl || null,
      services: safeServices,
      topics: safeTopics,
    };

    // Store in fast memory cache
    businessCache.set(slug, { data: safeBusiness, timestamp: Date.now() });

    // Strict Sanitization: Return ONLY public fields needed by the customer review funnel
    return NextResponse.json(
      {
        success: true,
        business: safeBusiness,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "X-Cache": "MISS",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/business/[slug] error:", err);
    return NextResponse.json({ success: false, error: "Failed to load business details" }, { status: 500 });
  }
}

// PUT update business settings (Powered by Firebase Firestore)
export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, category, location, description, googleReviewUrl, brandColor, phone, services, topics } = body;

    const existing = await FirestoreDB.getBusinessBySlug(params.slug);

    // IDOR Protection: Verify session user owns this business
    if (existing && existing.userId && session.userId && existing.userId !== session.userId) {
      return NextResponse.json({ success: false, error: "Forbidden: You do not own this business" }, { status: 403 });
    }

    // Format services and topics for Firestore
    const formattedServices = Array.isArray(services)
      ? services
          .map((s, idx) => {
            const name = (typeof s === "string" ? s : s?.name || "").trim();
            return name ? { id: s?.id || `srv_${idx}`, name } : null;
          })
          .filter(Boolean)
      : existing?.services || [];

    const formattedTopics = Array.isArray(topics)
      ? topics
          .map((t, idx) => {
            const name = (typeof t === "string" ? t : t?.name || "").trim();
            const type = typeof t === "object" && t?.type === "issue" ? "issue" : "positive";
            return name ? { id: t?.id || `top_${idx}`, name, type } : null;
          })
          .filter(Boolean)
      : existing?.topics || [];

    const updated = await FirestoreDB.saveBusiness({
      ...(existing || {}),
      slug: params.slug,
      name: name !== undefined ? name : existing?.name || "My Business",
      category: category !== undefined ? category : existing?.category || "cafe",
      location: location !== undefined ? location : existing?.location || "",
      description: description !== undefined ? description : existing?.description || "",
      googleReviewUrl: googleReviewUrl !== undefined ? googleReviewUrl : existing?.googleReviewUrl || "",
      brandColor: brandColor !== undefined ? brandColor : existing?.brandColor || "#0f172a",
      phone: phone !== undefined ? phone : existing?.phone || "",
      services: formattedServices,
      topics: formattedTopics,
      userId: session.userId,
    });

    // Permanently link business to user in Firestore
    if (session.email) {
      const user = await FirestoreDB.getUserByEmail(session.email);
      if (user) {
        await FirestoreDB.updateUser(user.id, {
          businessSlug: params.slug,
          businessId: updated.id,
          businessName: updated.name,
        });
      }
    }


    // Invalidate cached copy on update
    businessCache.delete(params.slug);

    return NextResponse.json({ success: true, business: updated });
  } catch (err: any) {
    console.error("PUT /api/business/[slug] error:", err);
    return NextResponse.json({ success: false, error: "Failed to update business settings" }, { status: 500 });
  }
}
