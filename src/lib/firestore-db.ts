import { getAuthoritativeFirestore } from "./firebase";
import { FirestoreREST } from "./firestore-rest";
export { FirestoreREST };

export function emailToDocId(email: string): string {
  return "usr_" + Buffer.from(email.toLowerCase().trim()).toString("hex");
}

/**
 * Authoritative Firestore Database Service
 * 
 * Powered directly by the Firebase Admin SDK and authenticated via server-side
 * service account credentials for your own Firebase Firestore project.
 */
export const FirestoreDB = {
  // --- USERS ---
  async getUserByEmail(email: string): Promise<any> {
    if (!email || typeof email !== "string") return null;
    const normalized = email.toLowerCase().trim();
    const docId = emailToDocId(normalized);
    const db = getAuthoritativeFirestore();

    // 1. Direct O(1) lookup
    const directDoc = await db.collection("users").doc(docId).get();
    if (directDoc.exists) {
      return { id: directDoc.id, ...directDoc.data() };
    }

    // 2. Query lookup by email
    const snap = await db.collection("users").where("email", "==", normalized).limit(1).get();
    if (!snap.empty) {
      const doc = snap.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    return null;
  },

  async getUserById(id: string): Promise<any> {
    if (!id) return null;
    const db = getAuthoritativeFirestore();
    const doc = await db.collection("users").doc(id).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  },

  async createUser(data: {
    email: string;
    password?: string;
    name?: string;
    role?: string;
    isPro?: boolean;
    planName?: string;
    businessSlug?: string;
    businessId?: string;
  }): Promise<any> {
    if (!data || !data.email || typeof data.email !== "string") {
      throw new Error("Valid email is required to create user document");
    }
    const normalized = data.email.toLowerCase().trim();
    const id = emailToDocId(normalized);
    const now = new Date().toISOString();

    const userDoc: Record<string, any> = {
      id,
      email: normalized,
      password: data.password || "",
      name: data.name || "",
      role: data.role || "user",
      isPro: Boolean(data.isPro),
      planName: data.planName || "Free",
      businessSlug: data.businessSlug || "",
      businessId: data.businessId || "",
      createdAt: now,
      updatedAt: now,
    };

    const db = getAuthoritativeFirestore();
    await db.collection("users").doc(id).set(userDoc, { merge: true });
    return userDoc;
  },

  async updateUser(id: string, data: Record<string, any>): Promise<any> {
    if (!id) throw new Error("User ID is required for update");
    const db = getAuthoritativeFirestore();
    const updatePayload: Record<string, any> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    delete updatePayload.id;
    await db.collection("users").doc(id).set(updatePayload, { merge: true });
    const updated = await db.collection("users").doc(id).get();
    return { id: updated.id, ...updated.data() };
  },

  // --- BUSINESSES ---
  async getBusinessByUserId(userId: string): Promise<any> {
    if (!userId) return null;
    const db = getAuthoritativeFirestore();

    // 1. Direct O(1) document lookup by userId in user_businesses collection
    const userBizSnap = await db.collection("user_businesses").doc(userId).get();
    if (userBizSnap.exists) {
      const userBizData = userBizSnap.data();
      const slug = userBizData?.businessSlug || userBizData?.businessId;
      if (slug) {
        const biz = await this.getBusinessBySlug(slug);
        if (biz) return biz;
      }
    }

    // 2. Query by userId in businesses collection
    const snap = await db.collection("businesses").where("userId", "==", userId).limit(1).get();
    if (!snap.empty) {
      const doc = snap.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    // 3. Direct lookup if business document is keyed by userId
    const directDoc = await db.collection("businesses").doc(userId).get();
    if (directDoc.exists) {
      return { id: directDoc.id, ...directDoc.data() };
    }

    return null;
  },

  async getBusinessBySlug(slug: string): Promise<any> {
    if (!slug) return null;
    const db = getAuthoritativeFirestore();

    // 1. Direct lookup by slug doc ID
    const doc = await db.collection("businesses").doc(slug).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }

    // 2. Query by slug field
    const snap = await db.collection("businesses").where("slug", "==", slug).limit(1).get();
    if (!snap.empty) {
      const bDoc = snap.docs[0];
      return { id: bDoc.id, ...bDoc.data() };
    }

    return null;
  },

  async saveBusiness(data: any): Promise<any> {
    const slug = data.slug;
    const docId = slug || `biz_${Date.now()}`;
    const db = getAuthoritativeFirestore();

    let existing: any = null;
    try {
      if (slug) {
        existing = await this.getBusinessBySlug(slug);
      }
    } catch {}

    if (existing && existing.userId && data.userId && existing.userId !== data.userId) {
      throw new Error("Multi-tenant violation: Cannot overwrite business owned by another user.");
    }

    const businessDoc: Record<string, any> = {
      ...(existing || {}),
      ...data,
      id: docId,
      slug: slug || docId,
      updatedAt: new Date().toISOString(),
    };

    // 1. Save directly under businesses/{slug}
    const cleanDoc = { ...businessDoc };
    delete cleanDoc.id;
    await db.collection("businesses").doc(docId).set(cleanDoc, { merge: true });

    // 2. Map under user_businesses/{userId} for instant lookups
    if (data.userId) {
      await db.collection("user_businesses").doc(data.userId).set({
        userId: data.userId,
        businessSlug: slug || docId,
        businessId: docId,
        name: data.name || "",
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }

    return businessDoc;
  },

  // --- FEEDBACKS ---
  async createFeedback(data: any): Promise<any> {
    const id = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const feedbackDoc: Record<string, any> = {
      ...(data || {}),
      id,
      status: "unread",
      createdAt: new Date().toISOString(),
    };

    const db = getAuthoritativeFirestore();
    const cleanDoc = { ...feedbackDoc };
    delete cleanDoc.id;
    await db.collection("feedback").doc(id).set(cleanDoc);

    return feedbackDoc;
  },

  async getFeedbacksBySlug(slug: string, limit = 1000): Promise<any[]> {
    if (!slug) return [];
    const db = getAuthoritativeFirestore();
    const snap = await db
      .collection("feedback")
      .where("businessSlug", "==", slug)
      .limit(limit)
      .get();

    if (snap.empty) return [];
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return docs.sort(
      (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  },

  async updateFeedbackStatus(id: string, status: string, businessSlug?: string): Promise<boolean> {
    if (!id || !status) return false;
    const db = getAuthoritativeFirestore();
    const docRef = db.collection("feedback").doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return false;

    if (businessSlug && snap.data()?.businessSlug && snap.data()?.businessSlug !== businessSlug) {
      return false; // Multi-tenant ownership mismatch
    }

    await docRef.update({
      status,
      updatedAt: new Date().toISOString(),
    });
    return true;
  },

  // --- REVIEWS ---
  async createReview(data: any): Promise<any> {
    return this.createReviewSession(data);
  },

  async createReviewSession(data: any): Promise<any> {
    const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const reviewDoc: Record<string, any> = {
      ...(data || {}),
      id,
      createdAt: new Date().toISOString(),
    };

    const db = getAuthoritativeFirestore();
    const cleanDoc = { ...reviewDoc };
    delete cleanDoc.id;
    await db.collection("reviews").doc(id).set(cleanDoc);

    return reviewDoc;
  },

  async getReviewsBySlug(slug: string, limit = 5000): Promise<any[]> {
    if (!slug) return [];
    const db = getAuthoritativeFirestore();
    const snap = await db
      .collection("reviews")
      .where("businessSlug", "==", slug)
      .limit(limit)
      .get();

    if (snap.empty) return [];
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return docs.sort(
      (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  },

  // --- ANALYTICS ---
  async trackEvent(businessSlug: string, eventType: string, metadata?: any): Promise<any> {
    const id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const eventDoc = {
      businessSlug,
      eventType,
      ...(metadata || {}),
      createdAt: new Date().toISOString(),
    };

    const db = getAuthoritativeFirestore();
    await db.collection("analytics").doc(id).set(eventDoc);
    return eventDoc;
  },

  async getAnalyticsBySlug(slug: string, limit = 10000): Promise<any[]> {
    if (!slug) return [];
    const db = getAuthoritativeFirestore();
    const snap = await db
      .collection("analytics")
      .where("businessSlug", "==", slug)
      .limit(limit)
      .get();

    if (snap.empty) return [];
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  // --- ORDERS ---
  async createOrder(data: any): Promise<any> {
    const id = data.id || `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const orderDoc: Record<string, any> = {
      ...data,
      id,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const db = getAuthoritativeFirestore();
    const cleanDoc = { ...orderDoc };
    delete cleanDoc.id;
    await db.collection("orders").doc(id).set(cleanDoc, { merge: true });
    return orderDoc;
  },

  async getOrderByRazorpayOrderId(razorpayOrderId: string): Promise<any> {
    if (!razorpayOrderId) return null;
    const db = getAuthoritativeFirestore();
    const snap = await db
      .collection("orders")
      .where("razorpayOrderId", "==", razorpayOrderId)
      .limit(1)
      .get();

    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  async updateOrder(id: string, data: any): Promise<any> {
    if (!id) return null;
    const db = getAuthoritativeFirestore();
    const updatePayload: Record<string, any> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    delete updatePayload.id;
    await db.collection("orders").doc(id).set(updatePayload, { merge: true });
    const snap = await db.collection("orders").doc(id).get();
    return { id: snap.id, ...snap.data() };
  },

  // --- PASSWORD RESET TOKENS ---
  async saveResetToken(tokenHash: string, data: { userId: string; email: string; expiresAt: Date }): Promise<any> {
    const db = getAuthoritativeFirestore();
    const tokenDoc: Record<string, any> = {
      tokenHash,
      userId: data.userId,
      email: data.email.toLowerCase().trim(),
      expiresAt: data.expiresAt.toISOString(),
      usedAt: null,
      createdAt: new Date().toISOString(),
    };
    await db.collection("reset_tokens").doc(tokenHash).set(tokenDoc);
    return tokenDoc;
  },

  async getResetToken(tokenHash: string): Promise<any> {
    if (!tokenHash) return null;
    const db = getAuthoritativeFirestore();
    const snap = await db.collection("reset_tokens").doc(tokenHash).get();
    if (!snap.exists) return null;
    return { tokenHash: snap.id, ...snap.data() };
  },

  async markResetTokenUsed(tokenHash: string): Promise<void> {
    if (!tokenHash) return;
    const db = getAuthoritativeFirestore();
    await db.collection("reset_tokens").doc(tokenHash).set({
      usedAt: new Date().toISOString(),
    }, { merge: true });
  },

  // --- ADMIN & LOGS ---
  async createLoginLog(data: {
    userId?: string;
    email: string;
    businessSlug?: string;
    provider: string;
    userAgent?: string;
  }): Promise<any> {
    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const logDoc: Record<string, any> = {
      id,
      userId: data.userId || "",
      email: data.email.toLowerCase().trim(),
      businessSlug: data.businessSlug || "",
      provider: data.provider,
      userAgent: (data.userAgent || "").substring(0, 150),
      timestamp: new Date().toISOString(),
    };

    const db = getAuthoritativeFirestore();
    const cleanDoc = { ...logDoc };
    delete cleanDoc.id;
    await db.collection("login_logs").doc(id).set(cleanDoc);
    return logDoc;
  },

  async listUsers(limit = 200): Promise<any[]> {
    const db = getAuthoritativeFirestore();
    const snap = await db.collection("users").limit(limit).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async listBusinesses(limit = 200): Promise<any[]> {
    const db = getAuthoritativeFirestore();
    const snap = await db.collection("businesses").limit(limit).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  async listLoginLogs(limit = 150): Promise<any[]> {
    const db = getAuthoritativeFirestore();
    const snap = await db.collection("login_logs").limit(limit).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
};

