import { NextRequest, NextResponse } from "next/server";
import { getSession, checkIsSuperAdmin, IMPERSONATE_COOKIE_NAME } from "@/lib/auth";
import { FirestoreDB } from "@/lib/firestore-db";
import { sendFeedbackNotificationEmail } from "@/lib/email";

// GET authenticated business's feedback inbox
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const isSuperAdmin = checkIsSuperAdmin(session.email);
    const impersonateSlug = isSuperAdmin
      ? (req.cookies.get(IMPERSONATE_COOKIE_NAME)?.value || req.nextUrl.searchParams.get("impersonate") || null)
      : null;

    let business: any = null;
    if (isSuperAdmin && impersonateSlug) {
      business = await FirestoreDB.getBusinessBySlug(impersonateSlug).catch(() => null);
    }

    if (!business) {
      business = await FirestoreDB.getBusinessByUserId(session.userId);
      if (!business && session.businessSlug) {
        business = await FirestoreDB.getBusinessBySlug(session.businessSlug);
      }
    }

    if (!business) {
      return NextResponse.json({ success: true, feedback: [], feedbacks: [] });
    }

    const feedbackList = await FirestoreDB.getFeedbacksBySlug(business.slug);

    const formattedList = (feedbackList || []).map((f: any) => ({
      id: f.id,
      customerName: f.customerName || null,
      customerPhone: f.customerPhone || null,
      customerEmail: f.customerEmail || null,
      message: f.message || f.feedback || "",
      issueTopics: typeof f.issueTopics === "string" ? f.issueTopics : JSON.stringify(f.issueTopics || f.selectedIssues || []),
      status: f.status || "unread",
      createdAt: f.createdAt ? new Date(f.createdAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      feedback: formattedList,
      feedbacks: formattedList,
    });
  } catch (error: any) {
    console.error("GET /api/feedback error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH toggle feedback status (resolved / unread) with strict ownership validation
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const id = body.id || body.feedbackId;
    const status = body.status;

    if (!id || !status || !["unread", "resolved"].includes(status)) {
      return NextResponse.json({ success: false, error: "Valid ID and status ('unread' | 'resolved') required" }, { status: 400 });
    }

    const isSuperAdmin = checkIsSuperAdmin(session.email);
    const impersonateSlug = isSuperAdmin
      ? (req.cookies.get(IMPERSONATE_COOKIE_NAME)?.value || req.nextUrl.searchParams.get("impersonate") || null)
      : null;

    let business: any = null;
    if (isSuperAdmin && impersonateSlug) {
      business = await FirestoreDB.getBusinessBySlug(impersonateSlug).catch(() => null);
    }

    if (!business) {
      business = await FirestoreDB.getBusinessByUserId(session.userId);
      if (!business && session.businessSlug) {
        business = await FirestoreDB.getBusinessBySlug(session.businessSlug);
      }
    }

    if (!business) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
    }

    // Update in Firestore with business tenant verification (super admin can bypass slug check)
    const updated = await FirestoreDB.updateFeedbackStatus(
      id,
      status,
      isSuperAdmin ? undefined : business.slug
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Feedback record not found or permission denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    console.error("PATCH /api/feedback error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// POST public customer submission from /r/[slug]/feedback
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const businessSlug = body.businessSlug || body.slug;
    const rawMessage = body.message || body.feedback;
    const { customerName, customerPhone, customerEmail } = body;
    const issueTopics = body.issueTopics || body.selectedIssues || [];

    if (!businessSlug || !rawMessage || typeof rawMessage !== "string") {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const business = await FirestoreDB.getBusinessBySlug(businessSlug);
    if (!business) {
      return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
    }

    const sanitizedMessage = rawMessage.slice(0, 1000).trim();
    const sanitizedName = customerName ? String(customerName).slice(0, 100).trim() : null;
    const sanitizedPhone = customerPhone ? String(customerPhone).slice(0, 30).trim() : null;
    const sanitizedEmail = customerEmail ? String(customerEmail).slice(0, 100).trim() : null;
    const sanitizedTopics = Array.isArray(issueTopics) ? issueTopics.slice(0, 10) : [];

    // Save in authoritative Firestore
    const createdFeedback = await FirestoreDB.createFeedback({
      businessSlug,
      customerName: sanitizedName,
      customerPhone: sanitizedPhone,
      customerEmail: sanitizedEmail,
      message: sanitizedMessage,
      issueTopics: sanitizedTopics,
    });

    const feedbackId = createdFeedback?.id || `fb_${Date.now()}`;

    // Track analytics event
    await FirestoreDB.trackEvent(businessSlug, "feedback_submitted").catch(() => {});

    // Dispatch Instant Email Alert to Business Owner if email configured
    try {
      let recipientEmail = business.notificationEmail || business.email || business.contactEmail;
      if (!recipientEmail && business.userId) {
        const owner = await FirestoreDB.getUserById(business.userId);
        if (owner?.email) recipientEmail = owner.email;
      }

      if (recipientEmail) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        await sendFeedbackNotificationEmail({
          to: recipientEmail,
          businessName: business.name || "Your Business",
          customerName: sanitizedName,
          customerPhone: sanitizedPhone,
          customerEmail: sanitizedEmail,
          message: sanitizedMessage,
          issueTopics: sanitizedTopics,
          dashboardLink: `${appUrl}/feedback`,
        }).catch((mailErr) => {
          console.warn("Feedback email alert dispatch note:", mailErr);
        });
      }
    } catch (mailErr) {
      console.warn("Feedback email recipient resolution note:", mailErr);
    }

    return NextResponse.json({ success: true, feedbackId });
  } catch (err: any) {
    console.error("Feedback submission error:", err);
    return NextResponse.json({ success: false, error: "Failed to submit feedback" }, { status: 500 });
  }
}
