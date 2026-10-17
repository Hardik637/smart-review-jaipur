import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "review_saas_session";

function getSecretKey(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL: JWT_SECRET environment variable is missing in production.");
    }
    return "dev_secret_key_only_for_local_testing_2026";
  }
  return secret;
}

export interface SessionData {
  userId: string;
  email: string;
  businessId?: string;
  businessSlug?: string;
  exp?: number;
  iat?: number;
}

/**
 * Secure HMAC-SHA256 Session Token Signer with Expiration
 */
export function createSessionPayload(data: Omit<SessionData, "exp" | "iat">, maxAgeSeconds: number = 60 * 60 * 24 * 90): string {
  const now = Date.now();
  const payload: SessionData = {
    ...data,
    iat: now,
    exp: now + maxAgeSeconds * 1000,
  };

  const secret = getSecretKey();
  const json = JSON.stringify(payload);
  const base64Data = Buffer.from(json).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(base64Data).digest("base64url");
  return `${base64Data}.${signature}`;
}

/**
 * Secure HMAC-SHA256 Verification & Session Parser
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return verifySessionToken(sessionToken);
  } catch {
    return null;
  }
}

/**
 * Standalone Token Verifier (used by middleware and routes)
 */
export function verifySessionToken(sessionToken?: string): SessionData | null {
  if (!sessionToken || typeof sessionToken !== "string" || !sessionToken.includes(".")) {
    return null;
  }

  const [base64Data, signature] = sessionToken.split(".");
  if (!base64Data || !signature) {
    return null;
  }

  try {
    const secret = getSecretKey();
    const expectedSignature = crypto.createHmac("sha256", secret).update(base64Data).digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expSigBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expSigBuf.length || !crypto.timingSafeEqual(sigBuf, expSigBuf)) {
      return null; // Signature mismatch or tampering
    }

    const decoded = JSON.parse(Buffer.from(base64Data, "base64url").toString("utf-8")) as SessionData;

    // Check expiration timestamp
    if (decoded.exp && Date.now() > decoded.exp) {
      return null; // Token expired
    }

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Secure Password Hasher using scrypt with dynamic salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Timing-Safe Password Verification
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (!storedHash || !storedHash.includes(":")) {
      // Legacy single salt fallback for existing pre-hashed entries
      const legacySecret = getSecretKey();
      const legacySalt = crypto.createHmac("sha256", legacySecret).update("salt_for_passwords").digest("hex").slice(0, 16);
      const legacyKey = crypto.scryptSync(password, legacySalt, 32).toString("hex");
      if (storedHash.length === legacyKey.length && crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(legacyKey))) {
        return true;
      }
      return false;
    }

    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;

    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, keyBuffer.length);

    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

export { SESSION_COOKIE_NAME };

export const IMPERSONATE_COOKIE_NAME = "welurik_impersonate_slug";

/**
 * Super Admin Authorization Checker
 * Configured via the ADMIN_EMAILS environment variable (comma-separated list)
 */
export function checkIsSuperAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(normalized);
}


