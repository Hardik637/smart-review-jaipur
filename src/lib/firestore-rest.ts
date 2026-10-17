/**
 * Authoritative Firestore Service Adapter
 * 
 * Replaces legacy hardcoded REST calls with direct Firebase Admin SDK operations,
 * ensuring all database queries and mutations target your authoritative Firestore project.
 */

import { getAuthoritativeFirestore } from "./firebase";

export const FirestoreREST = {
  async setDocument(collection: string, docId: string, data: Record<string, any>): Promise<any> {
    try {
      const db = getAuthoritativeFirestore();
      const cleanData = { ...data };
      delete cleanData.id;
      await db.collection(collection).doc(docId).set(cleanData, { merge: true });
      return { id: docId, ...cleanData };
    } catch (err: any) {
      console.error(`Firestore setDocument [${collection}/${docId}] error:`, err?.message || err);
      throw err;
    }
  },

  async getDocument(collection: string, docId: string): Promise<any | null> {
    try {
      const db = getAuthoritativeFirestore();
      const snap = await db.collection(collection).doc(docId).get();
      if (!snap.exists) return null;
      return { id: snap.id, ...snap.data() };
    } catch (err: any) {
      console.error(`Firestore getDocument [${collection}/${docId}] error:`, err?.message || err);
      throw err;
    }
  },

  async queryDocuments(collection: string, field: string, value: string, limit = 5000): Promise<any[]> {
    try {
      const db = getAuthoritativeFirestore();
      const snap = await db.collection(collection).where(field, "==", value).limit(limit).get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (err: any) {
      console.error(`Firestore queryDocuments [${collection} where ${field}==${value}] error:`, err?.message || err);
      throw err;
    }
  },

  async listDocuments(collection: string, limit = 50): Promise<any[]> {
    try {
      const db = getAuthoritativeFirestore();
      const snap = await db.collection(collection).limit(limit).get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (err: any) {
      console.error(`Firestore listDocuments [${collection}] error:`, err?.message || err);
      throw err;
    }
  },

  async deleteDocument(collection: string, docId: string): Promise<boolean> {
    try {
      const db = getAuthoritativeFirestore();
      await db.collection(collection).doc(docId).delete();
      return true;
    } catch (err: any) {
      console.error(`Firestore deleteDocument [${collection}/${docId}] error:`, err?.message || err);
      throw err;
    }
  },
};

