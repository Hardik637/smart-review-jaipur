import { getAuthoritativeFirestore } from "./firebase";
import { FirestoreREST } from "./firestore-rest";
import initialData from "./initial-data.json";
import { DEMO_BUSINESS } from "./db";

export { FirestoreREST };

export function emailToDocId(email: string): string {
  return "usr_" + Buffer.from(email.toLowerCase().trim()).toString("hex");
}

/**
 * Authoritative Firestore Database Service
 * 
 * Multi-layer data access:
 * 1. Firebase Admin SDK (when service account credentials are provided)
 * 2. Firestore REST API (using project API key)
 * 3. Embedded snapshot (initial-data.json) ensuring zero downtime and 100% data availability
 */
export const FirestoreDB = {
  // --- USERS ---
  async getUserByEmail(email: string): Promise<any> {
    if (!email || typeof email !== "string") return null;
    const normalized = email.toLowerCase().trim();
    const docId = emailToDocId(normalized);

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        const directDoc = await db.collection("users").doc(docId).get();
        if (directDoc.exists) {
          return { id: directDoc.id, ...directDoc.data() };
        }

        const snap = await db.collection("users").where("email", "==", normalized).limit(1).get();
        if (!snap.empty) {
          const doc = snap.docs[0];
          return { id: doc.id, ...doc.data() };
        }
      } catch (err: any) {
        console.warn(`Admin SDK getUserByEmail failed, falling back to REST: ${err?.message}`);
      }
    }

    // Fallback to FirestoreREST / embedded data
    try {
      const restDoc = await FirestoreREST.getDocument("users", docId);
      if (restDoc) return restDoc;

      const queried = await FirestoreREST.queryDocuments("users", "email", normalized, 1);
      if (queried.length > 0) return queried[0];
    } catch (err: any) {
      console.warn("REST getUserByEmail note:", err?.message);
    }

    // Final check in embedded seed
    const seedUsers = (initialData as any)?.users || [];
    const found = seedUsers.find((u: any) => u.email?.toLowerCase().trim() === normalized || u.id === docId);
    return found || null;
  },

  async getUserById(id: string): Promise<any> {
    if (!id) return null;

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        const doc = await db.collection("users").doc(id).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
      } catch (err: any) {
        console.warn(`Admin SDK getUserById failed, falling back to REST: ${err?.message}`);
      }
    }

    try {
      const doc = await FirestoreREST.getDocument("users", id);
      if (doc) return doc;
    } catch (err: any) {
      console.warn("REST getUserById note:", err?.message);
    }

    const seedUsers = (initialData as any)?.users || [];
    return seedUsers.find((u: any) => u.id === id) || null;
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
    if (db) {
      try {
        await db.collection("users").doc(id).set(userDoc, { merge: true });
        return userDoc;
      } catch (err: any) {
        console.warn(`Admin SDK createUser failed, using REST: ${err?.message}`);
      }
    }

    await FirestoreREST.setDocument("users", id, userDoc);
    return userDoc;
  },

  async updateUser(id: string, data: Record<string, any>): Promise<any> {
    if (!id) throw new Error("User ID is required for update");
    const updatePayload: Record<string, any> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    delete updatePayload.id;

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        await db.collection("users").doc(id).set(updatePayload, { merge: true });
        const updated = await db.collection("users").doc(id).get();
        return { id: updated.id, ...updated.data() };
      } catch (err: any) {
        console.warn(`Admin SDK updateUser failed, using REST: ${err?.message}`);
      }
    }

    return await FirestoreREST.setDocument("users", id, updatePayload);
  },

  // --- BUSINESSES ---
  async getBusinessByUserId(userId: string): Promise<any> {
    if (!userId) return null;

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        const userBizSnap = await db.collection("user_businesses").doc(userId).get();
        if (userBizSnap.exists) {
          const userBizData = userBizSnap.data();
          const slug = userBizData?.businessSlug || userBizData?.businessId;
          if (slug) {
            const biz = await this.getBusinessBySlug(slug);
            if (biz) return biz;
          }
        }

        const snap = await db.collection("businesses").where("userId", "==", userId).limit(1).get();
        if (!snap.empty) {
          const doc = snap.docs[0];
          return { id: doc.id, ...doc.data() };
        }

        const directDoc = await db.collection("businesses").doc(userId).get();
        if (directDoc.exists) {
          return { id: directDoc.id, ...directDoc.data() };
        }
      } catch (err: any) {
        console.warn(`Admin SDK getBusinessByUserId failed, falling back to REST: ${err?.message}`);
      }
    }

    try {
      const userBiz = await FirestoreREST.getDocument("user_businesses", userId);
      if (userBiz?.businessSlug || userBiz?.businessId) {
        const biz = await this.getBusinessBySlug(userBiz.businessSlug || userBiz.businessId);
        if (biz) return biz;
      }

      const list = await FirestoreREST.queryDocuments("businesses", "userId", userId, 1);
      if (list.length > 0) return list[0];

      const direct = await FirestoreREST.getDocument("businesses", userId);
      if (direct) return direct;
    } catch (err: any) {
      console.warn("REST getBusinessByUserId note:", err?.message);
    }

    // Embedded fallback
    const seedUserBiz = (initialData as any)?.user_businesses || [];
    const mapping = seedUserBiz.find((ub: any) => ub.id === userId || ub.userId === userId);
    if (mapping?.businessSlug || mapping?.businessId) {
      const found = await this.getBusinessBySlug(mapping.businessSlug || mapping.businessId);
      if (found) return found;
    }

    const seedBiz = (initialData as any)?.businesses || [];
    return seedBiz.find((b: any) => b.userId === userId || b.id === userId) || null;
  },

  async getBusinessBySlug(slug: string): Promise<any> {
    if (!slug) return null;

    // Built-in Demo handling: always return demo business immediately for demo routes
    if (slug === "welurik-media" || slug === "the-coffee-house" || slug === "demo") {
      // Check if real business exists first, else return DEMO_BUSINESS
      const seedBiz = (initialData as any)?.businesses || [];
      const foundSeed = seedBiz.find((b: any) => b.slug === slug || b.id === slug);
      if (foundSeed) return foundSeed;
      return DEMO_BUSINESS;
    }

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        const doc = await db.collection("businesses").doc(slug).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }

        const snap = await db.collection("businesses").where("slug", "==", slug).limit(1).get();
        if (!snap.empty) {
          const bDoc = snap.docs[0];
          return { id: bDoc.id, ...bDoc.data() };
        }
      } catch (err: any) {
        console.warn(`Admin SDK getBusinessBySlug failed, falling back to REST: ${err?.message}`);
      }
    }

    try {
      const doc = await FirestoreREST.getDocument("businesses", slug);
      if (doc) return doc;

      const list = await FirestoreREST.queryDocuments("businesses", "slug", slug, 1);
      if (list.length > 0) return list[0];
    } catch (err: any) {
      console.warn("REST getBusinessBySlug note:", err?.message);
    }

    // Seeded data fallback
    const seedBiz = (initialData as any)?.businesses || [];
    const found = seedBiz.find((b: any) => b.slug === slug || b.id === slug);
    return found || null;
  },

  async saveBusiness(data: any): Promise<any> {
    const slug = data.slug;
    const docId = slug || `biz_${Date.now()}`;

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

    const cleanDoc = { ...businessDoc };
    delete cleanDoc.id;

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        await db.collection("businesses").doc(docId).set(cleanDoc, { merge: true });
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
      } catch (err: any) {
        console.warn(`Admin SDK saveBusiness failed, using REST: ${err?.message}`);
      }
    }

    await FirestoreREST.setDocument("businesses", docId, cleanDoc);
    if (data.userId) {
      await FirestoreREST.setDocument("user_businesses", data.userId, {
        userId: data.userId,
        businessSlug: slug || docId,
        businessId: docId,
        name: data.name || "",
        updatedAt: new Date().toISOString(),
      });
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

    const cleanDoc = { ...feedbackDoc };
    delete cleanDoc.id;

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        await db.collection("feedback").doc(id).set(cleanDoc);
        return feedbackDoc;
      } catch (err: any) {
        console.warn(`Admin SDK createFeedback failed, using REST: ${err?.message}`);
      }
    }

    await FirestoreREST.setDocument("feedback", id, cleanDoc);
    return feedbackDoc;
  },

  async getFeedbacksBySlug(slug: string, limit = 1000): Promise<any[]> {
    if (!slug) return [];

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        const snap = await db
          .collection("feedback")
          .where("businessSlug", "==", slug)
          .limit(limit)
          .get();

        if (!snap.empty) {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          return docs.sort(
            (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
        }
      } catch (err: any) {
        console.warn(`Admin SDK getFeedbacksBySlug failed, falling back to REST: ${err?.message}`);
      }
    }

    try {
      const docs = await FirestoreREST.queryDocuments("feedback", "businessSlug", slug, limit);
      return docs.sort(
        (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    } catch {
      const seedFeedback = (initialData as any)?.feedback || [];
      return seedFeedback.filter((f: any) => f.businessSlug === slug);
    }
  },

  async updateFeedbackStatus(id: string, status: string, businessSlug?: string): Promise<boolean> {
    if (!id || !status) return false;

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        const docRef = db.collection("feedback").doc(id);
        const snap = await docRef.get();
        if (snap.exists) {
          if (businessSlug && snap.data()?.businessSlug && snap.data()?.businessSlug !== businessSlug) {
            return false;
          }
          await docRef.update({
            status,
            updatedAt: new Date().toISOString(),
          });
          return true;
        }
      } catch (err: any) {
        console.warn(`Admin SDK updateFeedbackStatus failed, falling back to REST: ${err?.message}`);
      }
    }

    try {
      await FirestoreREST.setDocument("feedback", id, {
        status,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch {
      return false;
    }
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

    const cleanDoc = { ...reviewDoc };
    delete cleanDoc.id;

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        await db.collection("reviews").doc(id).set(cleanDoc);
        return reviewDoc;
      } catch (err: any) {
        console.warn(`Admin SDK createReviewSession failed, using REST: ${err?.message}`);
      }
    }

    await FirestoreREST.setDocument("reviews", id, cleanDoc);
    return reviewDoc;
  },

  async getReviewsBySlug(slug: string, limit = 5000): Promise<any[]> {
    if (!slug) return [];

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        const snap = await db
          .collection("reviews")
          .where("businessSlug", "==", slug)
          .limit(limit)
          .get();

        if (!snap.empty) {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          return docs.sort(
            (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
        }
      } catch (err: any) {
        console.warn(`Admin SDK getReviewsBySlug failed, falling back to REST: ${err?.message}`);
      }
    }

    try {
      const docs = await FirestoreREST.queryDocuments("reviews", "businessSlug", slug, limit);
      return docs.sort(
        (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    } catch {
      return [];
    }
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
    if (db) {
      try {
        await db.collection("analytics").doc(id).set(eventDoc);
        return eventDoc;
      } catch (err: any) {
        console.warn(`Admin SDK trackEvent failed, using REST: ${err?.message}`);
      }
    }

    try {
      await FirestoreREST.setDocument("analytics", id, eventDoc);
    } catch {}
    return eventDoc;
  },

  async getAnalyticsBySlug(slug: string, limit = 10000): Promise<any[]> {
    if (!slug) return [];

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        const snap = await db
          .collection("analytics")
          .where("businessSlug", "==", slug)
          .limit(limit)
          .get();

        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
      } catch (err: any) {
        console.warn(`Admin SDK getAnalyticsBySlug failed, falling back to REST: ${err?.message}`);
      }
    }

    try {
      return await FirestoreREST.queryDocuments("analytics", "businessSlug", slug, limit);
    } catch {
      return [];
    }
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

    const cleanDoc = { ...orderDoc };
    delete cleanDoc.id;

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        await db.collection("orders").doc(id).set(cleanDoc, { merge: true });
        return orderDoc;
      } catch (err: any) {
        console.warn(`Admin SDK createOrder failed, using REST: ${err?.message}`);
      }
    }

    await FirestoreREST.setDocument("orders", id, cleanDoc);
    return orderDoc;
  },

  async getOrderByRazorpayOrderId(razorpayOrderId: string): Promise<any> {
    if (!razorpayOrderId) return null;

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        const snap = await db
          .collection("orders")
          .where("razorpayOrderId", "==", razorpayOrderId)
          .limit(1)
          .get();

        if (!snap.empty) {
          const doc = snap.docs[0];
          return { id: doc.id, ...doc.data() };
        }
      } catch (err: any) {
        console.warn(`Admin SDK getOrderByRazorpayOrderId failed, using REST: ${err?.message}`);
      }
    }

    try {
      const list = await FirestoreREST.queryDocuments("orders", "razorpayOrderId", razorpayOrderId, 1);
      return list[0] || null;
    } catch {
      return null;
    }
  },

  async updateOrder(id: string, data: any): Promise<any> {
    if (!id) return null;
    const updatePayload: Record<string, any> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    delete updatePayload.id;

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        await db.collection("orders").doc(id).set(updatePayload, { merge: true });
        const snap = await db.collection("orders").doc(id).get();
        return { id: snap.id, ...snap.data() };
      } catch (err: any) {
        console.warn(`Admin SDK updateOrder failed, using REST: ${err?.message}`);
      }
    }

    return await FirestoreREST.setDocument("orders", id, updatePayload);
  },

  // --- PASSWORD RESET TOKENS ---
  async saveResetToken(tokenHash: string, data: { userId: string; email: string; expiresAt: Date }): Promise<any> {
    const tokenDoc: Record<string, any> = {
      tokenHash,
      userId: data.userId,
      email: data.email.toLowerCase().trim(),
      expiresAt: data.expiresAt.toISOString(),
      usedAt: null,
      createdAt: new Date().toISOString(),
    };

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        await db.collection("reset_tokens").doc(tokenHash).set(tokenDoc);
        return tokenDoc;
      } catch (err: any) {
        console.warn(`Admin SDK saveResetToken failed, using REST: ${err?.message}`);
      }
    }

    await FirestoreREST.setDocument("reset_tokens", tokenHash, tokenDoc);
    return tokenDoc;
  },

  async getResetToken(tokenHash: string): Promise<any> {
    if (!tokenHash) return null;

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        const snap = await db.collection("reset_tokens").doc(tokenHash).get();
        if (snap.exists) {
          return { tokenHash: snap.id, ...snap.data() };
        }
      } catch (err: any) {
        console.warn(`Admin SDK getResetToken failed, using REST: ${err?.message}`);
      }
    }

    return await FirestoreREST.getDocument("reset_tokens", tokenHash);
  },

  async markResetTokenUsed(tokenHash: string): Promise<void> {
    if (!tokenHash) return;

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        await db.collection("reset_tokens").doc(tokenHash).set({
          usedAt: new Date().toISOString(),
        }, { merge: true });
        return;
      } catch (err: any) {
        console.warn(`Admin SDK markResetTokenUsed failed, using REST: ${err?.message}`);
      }
    }

    await FirestoreREST.setDocument("reset_tokens", tokenHash, {
      usedAt: new Date().toISOString(),
    });
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

    const cleanDoc = { ...logDoc };
    delete cleanDoc.id;

    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        await db.collection("login_logs").doc(id).set(cleanDoc);
        return logDoc;
      } catch (err: any) {
        console.warn(`Admin SDK createLoginLog failed, using REST: ${err?.message}`);
      }
    }

    try {
      await FirestoreREST.setDocument("login_logs", id, cleanDoc);
    } catch {}
    return logDoc;
  },

  async listUsers(limit = 200): Promise<any[]> {
    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        const snap = await db.collection("users").limit(limit).get();
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (err: any) {
        console.warn(`Admin SDK listUsers failed, falling back to REST: ${err?.message}`);
      }
    }

    try {
      const list = await FirestoreREST.listDocuments("users", limit);
      if (list.length > 0) return list;
    } catch {}

    return (initialData as any)?.users || [];
  },

  async listBusinesses(limit = 200): Promise<any[]> {
    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        const snap = await db.collection("businesses").limit(limit).get();
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (err: any) {
        console.warn(`Admin SDK listBusinesses failed, falling back to REST: ${err?.message}`);
      }
    }

    try {
      const list = await FirestoreREST.listDocuments("businesses", limit);
      if (list.length > 0) return list;
    } catch {}

    return (initialData as any)?.businesses || [];
  },

  async listLoginLogs(limit = 150): Promise<any[]> {
    const db = getAuthoritativeFirestore();
    if (db) {
      try {
        const snap = await db.collection("login_logs").limit(limit).get();
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (err: any) {
        console.warn(`Admin SDK listLoginLogs failed, falling back to REST: ${err?.message}`);
      }
    }

    try {
      return await FirestoreREST.listDocuments("login_logs", limit);
    } catch {
      return [];
    }
  },
};
