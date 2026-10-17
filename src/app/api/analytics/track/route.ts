import { NextRequest, NextResponse } from "next/server";
import { FirestoreDB } from "@/lib/firestore-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const businessSlug = body.businessSlug || body.slug;
    const { eventType, metadata } = body;

    if (!businessSlug || !eventType) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    // Track event in authoritative Firestore
    await FirestoreDB.trackEvent(businessSlug, eventType, metadata).catch((e) => {
      console.warn("Firestore trackEvent note:", e);
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Tracking error:", err);
    return NextResponse.json({ success: false, error: "Failed to track analytics event" }, { status: 500 });
  }
}

