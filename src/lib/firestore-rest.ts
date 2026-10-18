/**
 * Robust Dual-Mode Firestore REST Client
 * 
 * Provides seamless access to Firestore either via Firebase Admin SDK (when service account credentials exist)
 * or via authenticated Google Cloud Firestore REST API with the project's authorized API key.
 * 
 * Ensures all existing businesses, users, reviews, and demo funnels function without throwing 500 errors.
 */

import { isFirebaseAdminConfigured, getAuthoritativeFirestore } from "./firebase";
import initialData from "./initial-data.json";

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  process.env.FIREBASE_API_KEY ||
  "AIzaSyCLvs5UjkDh12b18iplyWpoUtP_PFDdzRU";

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "smart-review-jaipur";


function decodeValue(val: any): any {
  if (!val) return null;
  if ("stringValue" in val) return val.stringValue;
  if ("booleanValue" in val) return val.booleanValue;
  if ("integerValue" in val) return parseInt(val.integerValue, 10);
  if ("doubleValue" in val) return parseFloat(val.doubleValue);
  if ("timestampValue" in val) return val.timestampValue;
  if ("nullValue" in val) return null;
  if ("arrayValue" in val) {
    return (val.arrayValue.values || []).map(decodeValue);
  }
  if ("mapValue" in val) {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      res[k] = decodeValue(v);
    }
    return res;
  }
  return null;
}

function decodeDoc(doc: any): any {
  if (!doc || !doc.fields) return null;
  const data: Record<string, any> = {};
  for (const [k, v] of Object.entries(doc.fields || {})) {
    data[k] = decodeValue(v);
  }
  const parts = (doc.name || "").split("/");
  data.id = parts[parts.length - 1] || "";
  return data;
}

function encodeValue(val: any): any {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "string") return { stringValue: val };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    if (Number.isInteger(val)) return { integerValue: val.toString() };
    return { doubleValue: val };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(encodeValue) } };
  }
  if (typeof val === "object") {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = encodeValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function encodeDoc(obj: Record<string, any>): any {
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === "id") continue;
    fields[k] = encodeValue(v);
  }
  return { fields };
}

export const FirestoreREST = {
  /**
   * Set / merge a document
   */
  async setDocument(collection: string, docId: string, data: Record<string, any>): Promise<any> {
    const cleanData = { ...data };
    delete cleanData.id;

    if (isFirebaseAdminConfigured()) {
      try {
        const db = getAuthoritativeFirestore();
        if (db) {
          await db.collection(collection).doc(docId).set(cleanData, { merge: true });
          return { id: docId, ...cleanData };
        }
      } catch (err: any) {
        console.warn(`Admin SDK setDocument failed, falling back to REST: ${err?.message}`);
      }
    }

    try {
      const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${encodeURIComponent(
        docId
      )}?key=${FIREBASE_API_KEY}`;

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(encodeDoc(cleanData)),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`Firestore REST setDocument [${collection}/${docId}] error:`, errText);
        throw new Error(`Firestore REST error: ${res.status} ${errText}`);
      }

      const json = await res.json();
      return decodeDoc(json) || { id: docId, ...cleanData };
    } catch (err: any) {
      console.error(`Firestore setDocument [${collection}/${docId}] fatal:`, err?.message || err);
      throw err;
    }
  },

  /**
   * Get a single document by ID
   */
  async getDocument(collection: string, docId: string): Promise<any | null> {
    if (!docId) return null;

    if (isFirebaseAdminConfigured()) {
      try {
        const db = getAuthoritativeFirestore();
        if (db) {
          const snap = await db.collection(collection).doc(docId).get();
          if (snap.exists) {
            return { id: snap.id, ...snap.data() };
          }
          return null;
        }
      } catch (err: any) {
        console.warn(`Admin SDK getDocument failed, falling back to REST: ${err?.message}`);
      }
    }

    try {
      const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${encodeURIComponent(
        docId
      )}?key=${FIREBASE_API_KEY}`;

      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) {
        console.warn(`Firestore REST getDocument [${collection}/${docId}] returned ${res.status}`);
        // Fallback to initial seeded data if available
        const seedCol = (initialData as any)[collection];
        if (Array.isArray(seedCol)) {
          const found = seedCol.find((d: any) => d.id === docId || d.slug === docId);
          if (found) return found;
        }
        return null;
      }

      const json = await res.json();
      return decodeDoc(json);
    } catch (err: any) {
      console.warn(`Firestore getDocument [${collection}/${docId}] error:`, err?.message || err);
      // Fallback to initial seeded data if available
      const seedCol = (initialData as any)[collection];
      if (Array.isArray(seedCol)) {
        const found = seedCol.find((d: any) => d.id === docId || d.slug === docId);
        if (found) return found;
      }
      return null;
    }
  },

  /**
   * Query documents by single field equality
   */
  async queryDocuments(collection: string, field: string, value: string, limit = 5000): Promise<any[]> {
    if (isFirebaseAdminConfigured()) {
      try {
        const db = getAuthoritativeFirestore();
        if (db) {
          const snap = await db.collection(collection).where(field, "==", value).limit(limit).get();
          return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        }
      } catch (err: any) {
        console.warn(`Admin SDK queryDocuments failed, falling back to REST: ${err?.message}`);
      }
    }

    try {
      const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery?key=${FIREBASE_API_KEY}`;
      const body = {
        structuredQuery: {
          from: [{ collectionId: collection }],
          where: {
            fieldFilter: {
              field: { fieldPath: field },
              op: "EQUAL",
              value: encodeValue(value),
            },
          },
          limit,
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Query failed with status ${res.status}`);
      }

      const list = await res.json();
      if (!Array.isArray(list)) return [];

      return list
        .filter((item: any) => item.document)
        .map((item: any) => decodeDoc(item.document));
    } catch (err: any) {
      console.warn(`Firestore REST queryDocuments [${collection} ${field}==${value}] error:`, err?.message || err);
      // Fallback to local snapshot
      const seedCol = (initialData as any)[collection];
      if (Array.isArray(seedCol)) {
        return seedCol.filter((d: any) => d[field] === value);
      }
      return [];
    }
  },

  /**
   * List documents in a collection
   */
  async listDocuments(collection: string, limit = 50): Promise<any[]> {
    if (isFirebaseAdminConfigured()) {
      try {
        const db = getAuthoritativeFirestore();
        if (db) {
          const snap = await db.collection(collection).limit(limit).get();
          return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        }
      } catch (err: any) {
        console.warn(`Admin SDK listDocuments failed, falling back to REST: ${err?.message}`);
      }
    }

    try {
      const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}?pageSize=${limit}&key=${FIREBASE_API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) return (initialData as any)[collection] || [];

      const json = await res.json();
      if (!json.documents || !Array.isArray(json.documents)) {
        return (initialData as any)[collection] || [];
      }

      return json.documents.map(decodeDoc);
    } catch {
      return (initialData as any)[collection] || [];
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(collection: string, docId: string): Promise<boolean> {
    if (isFirebaseAdminConfigured()) {
      try {
        const db = getAuthoritativeFirestore();
        if (db) {
          await db.collection(collection).doc(docId).delete();
          return true;
        }
      } catch (err: any) {
        console.warn(`Admin SDK deleteDocument failed, falling back to REST: ${err?.message}`);
      }
    }

    try {
      const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}/${encodeURIComponent(
        docId
      )}?key=${FIREBASE_API_KEY}`;
      const res = await fetch(url, { method: "DELETE" });
      return res.ok;
    } catch {
      return false;
    }
  },
};
