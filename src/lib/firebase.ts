import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App | undefined;
let firestoreInstance: Firestore | null = null;

/**
 * Checks whether server-side Firebase Admin credentials are fully configured
 */
export function isFirebaseAdminConfigured(): boolean {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  return Boolean(projectId && clientEmail && privateKey);
}

/**
 * Initializes and returns the authoritative Firebase Admin Firestore instance if credentials exist.
 * Returns null gracefully if service account credentials are not configured, allowing fallback to FirestoreREST.
 */
export function getAuthoritativeFirestore(): Firestore | null {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  // Handle newlines and surrounding quotes from environment variables
  privateKey = privateKey.replace(/^["']|["']$/g, "").replace(/\\n/g, "\n");

  try {
    if (getApps().length === 0) {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
    } else {
      app = getApps()[0];
    }

    firestoreInstance = getFirestore(app);
    return firestoreInstance;
  } catch (err: any) {
    console.warn("Firebase Admin SDK initialization note:", err?.message || err);
    return null;
  }
}

/**
 * Returns { firestore } for backwards compatibility
 */
export function getFirebaseAdmin(): { firestore: Firestore | null } {
  return { firestore: getAuthoritativeFirestore() };
}

export { firestoreInstance as firestore };
