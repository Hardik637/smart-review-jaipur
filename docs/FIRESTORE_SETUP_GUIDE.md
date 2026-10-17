# SmartReview — Independent Firestore Setup Guide

This guide details the database architecture, Firestore collections, recommended composite indexes, and security rules for your independent SmartReview deployment.

---

## 1. Architecture Overview

- **Server-Side Access (Authoritative):**
  All Next.js API route handlers connect to Firestore via the **Firebase Admin SDK** (`src/lib/firebase.ts` & `src/lib/firestore-db.ts`).
  The Admin SDK uses your service account (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`), giving full administrative access securely on the server without exposing credentials to the client.

- **Client-Side Auth (Separated):**
  Client-side Google Sign-In and password reset use the Firebase Web SDK (`src/lib/firebase-client.ts`) configured with `NEXT_PUBLIC_FIREBASE_*`. This project handles identity, while your independent Firestore project handles data storage.

---

## 2. Collections Schema

| Collection | Document ID | Purpose | Key Fields |
| :--- | :--- | :--- | :--- |
| **`users`** | `usr_<id>` or `<email>` | Registered users | `email`, `passwordHash`, `name`, `businessSlug`, `businessId`, `isPro`, `planName`, `createdAt`, `updatedAt` |
| **`businesses`** | `<slug>` | Business profile & funnel settings | `slug`, `name`, `userId`, `category`, `location`, `googleReviewUrl`, `brandColor`, `isPro`, `planName`, `monthlyAiQuota`, `aiCallsThisMonth`, `topics`, `services`, `createdAt` |
| **`user_businesses`** | `<userId>` | Fast O(1) user-to-business lookup | `userId`, `businessSlug`, `businessId`, `name`, `isPro`, `updatedAt` |
| **`feedback`** | `fb_<timestamp>_<rand>` | Private customer feedback (1–3 star interception) | `businessSlug`, `customerName`, `customerPhone`, `customerEmail`, `message`, `issueTopics`, `status` (`"unread"` \| `"resolved"`), `createdAt` |
| **`reviews`** | `rev_<timestamp>_<rand>` | Generated 5-star review sessions | `businessSlug`, `rating`, `selectedTopics`, `selectedServices`, `customerComment`, `generatedReview`, `tone`, `status`, `createdAt` |
| **`analytics`** | `evt_<timestamp>_<rand>` | Event tracking (scans, clicks, shares) | `businessSlug`, `eventType`, `metadata`, `createdAt` |
| **`orders`** | `ord_<timestamp>_<rand>` or `<razorpayOrderId>` | Razorpay payment orders & audit log | `razorpayOrderId`, `razorpayPaymentId`, `amount`, `currency`, `status` (`"created"` \| `"paid"`), `planType`, `userId`, `userEmail`, `businessSlug`, `createdAt` |
| **`reset_tokens`** | `<tokenHash>` | Secure SHA-256 password reset tokens | `tokenHash`, `userId`, `email`, `expiresAt`, `usedAt`, `createdAt` |
| **`login_logs`** | `<timestamp>_<rand>` | Audit trail of user logins | `email`, `ip`, `userAgent`, `timestamp` |
| **`promo_redemptions`**| `<userId>_<codeChar>` | Prevents duplicate promo code usage | `userId`, `email`, `code`, `redeemedAt` |

---

## 3. Required Firestore Composite Indexes

While simple queries (`where("slug", "==", slug)`) work automatically with single-field indexes, sorting queries on large collections benefit from the following composite indexes:

1. **`feedback` Collection:**
   - Field 1: `businessSlug` (Ascending)
   - Field 2: `createdAt` (Descending)
   - Query scope: Collection

2. **`reviews` Collection:**
   - Field 1: `businessSlug` (Ascending)
   - Field 2: `createdAt` (Descending)
   - Query scope: Collection

3. **`analytics` Collection:**
   - Field 1: `businessSlug` (Ascending)
   - Field 2: `createdAt` (Descending)
   - Query scope: Collection

> **Note:** Because the backend application uses Firebase Admin SDK and client-side sorting in `FirestoreDB` as an optimization, queries work out-of-the-box even prior to index build completion. Adding these indexes in Firebase Console optimizes queries for high-volume deployments.

---

## 4. Recommended Security Rules (`firestore.rules`)

Because all application read/write operations pass securely through server-side Next.js API routes with Firebase Admin SDK, direct browser-side Firestore access can be safely locked down:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deny all direct client-side reads and writes by default
    // All operations are handled securely via Server-Side Firebase Admin SDK
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

This ensures complete server-side authorization enforcement, tenant data isolation, and prevents any unauthorized client tampering.
