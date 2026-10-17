import { NextRequest, NextResponse } from "next/server";
import { generateReview, generateSmartTemplateReview } from "@/lib/ai-generator";
import { FirestoreDB } from "@/lib/firestore-db";
import { checkRateLimit, rateLimitExceededResponse } from "@/lib/rate-limit";

// In-memory cache for business metadata to achieve sub-10ms business lookups
interface CachedBusinessMeta {
  businessName: string;
  category: string;
  location: string;
  businessId: string;
  aiCallsThisMonth: number;
  monthlyAiQuota: number;
  cachedAt: number;
}
const businessMetaCache = new Map<string, CachedBusinessMeta>();
const META_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting: 20 AI generations per minute per IP
    const rl = await checkRateLimit(req, "ai_generate", { limit: 20, windowSeconds: 60 });
    if (!rl.success) {
      return rateLimitExceededResponse(rl.limit, rl.resetAt);
    }

    const body = await req.json().catch(() => ({}));
    const businessSlug = body.businessSlug || body.slug;
    const {
      selectedTopics = body.topics || [],
      selectedServices = body.services || [],
      customerComment = body.comment || "",
      tone = "natural",
      rating = 5,
      businessName: clientBusinessName,
      category: clientCategory,
      location: clientLocation,
    } = body;

    if (!businessSlug || typeof businessSlug !== "string") {
      return NextResponse.json({ error: "A valid business slug is required." }, { status: 400 });
    }

    // 2. Input validation & sanitization
    const validRating = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
    const validTone = (["short", "natural", "detailed"].includes(tone) ? tone : "natural") as "short" | "natural" | "detailed";
    const sanitizedTopics = Array.isArray(selectedTopics)
      ? selectedTopics.filter((t): t is string => typeof t === "string").map((t) => t.slice(0, 50).trim()).slice(0, 10)
      : [];
    const sanitizedServices = Array.isArray(selectedServices)
      ? selectedServices.filter((s): s is string => typeof s === "string").map((s) => s.slice(0, 50).trim()).slice(0, 10)
      : [];
    const sanitizedComment = typeof customerComment === "string" ? customerComment.slice(0, 300).trim() : "";

    // 3. Fast Business Metadata Resolution (Cache First -> Client Body -> DB)
    let businessName = clientBusinessName || "Our Business";
    let category = clientCategory || "local service";
    let location = clientLocation || "";
    let businessId: string | null = null;
    let isQuotaExceeded = false;

    const cached = businessMetaCache.get(businessSlug);
    if (cached && Date.now() - cached.cachedAt < META_TTL_MS) {
      businessName = clientBusinessName || cached.businessName;
      category = clientCategory || cached.category;
      location = clientLocation || cached.location;
      businessId = cached.businessId;
      if (cached.aiCallsThisMonth >= cached.monthlyAiQuota) {
        isQuotaExceeded = true;
      }
    } else {
      // Resolve from authoritative Firestore once and cache
      try {
        const fsBiz = await FirestoreDB.getBusinessBySlug(businessSlug);
        if (fsBiz) {
          businessName = fsBiz.name || clientBusinessName || businessName;
          category = fsBiz.category || clientCategory || category;
          location = fsBiz.location || clientLocation || "";
          businessId = fsBiz.id || fsBiz.slug;
          if ((fsBiz.aiCallsThisMonth || 0) >= (fsBiz.monthlyAiQuota || 500)) {
            isQuotaExceeded = true;
          }
        }
      } catch (err) {
        console.warn("Firestore business lookup note in /api/ai/generate:", err);
      }

      if (businessId) {
        businessMetaCache.set(businessSlug, {
          businessName,
          category,
          location,
          businessId,
          aiCallsThisMonth: 0,
          monthlyAiQuota: 500,
          cachedAt: Date.now(),
        });
      }
    }

    if (!businessId && !clientBusinessName) {
      return NextResponse.json({ error: "Business not found or inactive." }, { status: 404 });
    }

    // 4. Generate review using upgraded AI engine (Gemini Flash-Lite + 2s race timeout)
    const result = isQuotaExceeded
      ? {
          review: generateSmartTemplateReview({
            businessName,
            category,
            location,
            selectedTopics: sanitizedTopics,
            selectedServices: sanitizedServices,
            customerComment: sanitizedComment,
            tone: validTone,
            rating: validRating,
          }),
          source: "smart_nlp" as const,
        }
      : await generateReview({
          businessName,
          category,
          location,
          selectedTopics: sanitizedTopics,
          selectedServices: sanitizedServices,
          customerComment: sanitizedComment,
          tone: validTone,
          rating: validRating,
        });

    // 5. Non-blocking asynchronous persistence to authoritative Firestore
    const persistPromises: Promise<any>[] = [
      FirestoreDB.createReview({
        businessSlug: businessSlug || "my-business",
        rating: validRating,
        selectedTopics: sanitizedTopics,
        selectedServices: sanitizedServices,
        customerComment: sanitizedComment || null,
        generatedReview: result.review,
        tone: validTone,
        status: "generated",
      }).catch((e) => console.warn("Firestore createReview non-blocking notice:", e)),

      FirestoreDB.trackEvent(businessSlug || "my-business", "review_generated", {
        source: result.source,
        tone: validTone,
      }).catch((e) => console.warn("Firestore trackEvent non-blocking notice:", e)),
    ];

    // Fire non-blocking promises concurrently
    Promise.allSettled(persistPromises);

    return NextResponse.json({
      success: true,
      review: result.review,
      source: result.source,
    });
  } catch (error: any) {
    console.error("AI Generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate review. Please try again." },
      { status: 500 }
    );
  }
}
