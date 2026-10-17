import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App | undefined;
let firestoreInstance: Firestore | null = null;

/**
 * Checks whether server-side Firebase Admin credentials are configured
 */
export function isFirebaseAdminConfigured(): boolean {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  return Boolean(projectId && clientEmail && privateKey);
}

/**
 * Initializes and returns the authoritative Firebase Admin Firestore instance.
 * Throws a descriptive error if environment credentials are not configured.
 */
export function getAuthoritativeFirestore(): Firestore {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Authoritative Firestore is not configured. Missing required environment variables: " +
      [
        !projectId && "FIREBASE_PROJECT_ID",
        !clientEmail && "FIREBASE_CLIENT_EMAIL",
        !privateKey && "FIREBASE_PRIVATE_KEY",
      ].filter(Boolean).join(", ") +
      ". Please configure your Firebase Service Account credentials."
    );
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
    console.error("Failed to initialize Firebase Admin SDK:", err);
    throw new Error(`Firebase Admin initialization failed: ${err.message || err}`);
  }
}

/**
 * Returns { firestore } for backwards compatibility, returning null if not configured
 */
export function getFirebaseAdmin(): { firestore: Firestore | null } {
  try {
    const fs = getAuthoritativeFirestore();
    return { firestore: fs };
  } catch {
    return { firestore: null };
  }
}

export { firestoreInstance as firestore };

