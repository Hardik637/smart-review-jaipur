import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "review_saas_session";
const PROTECTED_ROUTES = [
  "/dashboard",
  "/settings",
  "/qr-studio",
  "/feedback",
  "/onboarding",
  "/admin-vault",
  "/admin",
];
const AUTH_ROUTES = ["/login", "/signup"];

function base64UrlToBytes(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlDecodeUtf8(str: string): string {
  const bytes = base64UrlToBytes(str);
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

async function verifyMiddlewareSession(sessionCookie: string): Promise<boolean> {
  try {
    if (!sessionCookie || !sessionCookie.includes(".")) return false;
    const dotIndex = sessionCookie.indexOf(".");
    const base64Data = sessionCookie.slice(0, dotIndex);
    const signature = sessionCookie.slice(dotIndex + 1);
    if (!base64Data || !signature) return false;

    // Web Crypto API HMAC verification (Edge Runtime compatible)
    const secret = process.env.JWT_SECRET || "dev_secret_key_only_for_local_testing_2026";
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    const expectedSigBytes = await crypto.subtle.sign(
      "HMAC",
      keyMaterial,
      encoder.encode(base64Data)
    );

    // Convert base64url signature from cookie back to bytes safely with RFC 4648 padding
    const sigBytes = base64UrlToBytes(signature);

    // Constant-time comparison
    if (expectedSigBytes.byteLength !== sigBytes.byteLength) return false;
    const expBytes = new Uint8Array(expectedSigBytes);
    let mismatch = 0;
    for (let i = 0; i < expBytes.length; i++) {
      mismatch |= expBytes[i] ^ sigBytes[i];
    }
    if (mismatch !== 0) return false;

    // Verify payload fields with UTF-8 decoding
    const payload = JSON.parse(base64UrlDecodeUtf8(base64Data));
    if (!payload.userId) return false;
    if (payload.exp && Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // 1. If user is already authenticated and visits /login or /signup, redirect straight to /dashboard
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  if (isAuthRoute) {
    if (sessionCookie && (await verifyMiddlewareSession(sessionCookie))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 2. Protected dashboard routes require valid session
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  if (!isProtected) return NextResponse.next();

  if (!sessionCookie || !(await verifyMiddlewareSession(sessionCookie))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const res = NextResponse.redirect(loginUrl);
    if (sessionCookie) {
      res.cookies.delete(SESSION_COOKIE_NAME);
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/qr-studio/:path*",
    "/feedback/:path*",
    "/onboarding/:path*",
    "/admin-vault/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
