# 🛡️ Welurik Review SaaS — Production Pre-Deployment Protocol

To safeguard our live production environment (`https://review.welurik.com`), **NO CODE MAY BE DEPLOYED** without passing the multi-agent inspection and automated audit suite.

---

## 🤖 The 5 Specialized Pre-Deployment Subagents

| Subagent Name | Specialized Role | Primary Audit Responsibilities |
| :--- | :--- | :--- |
| **`frontend_auditor`** | Frontend & UI Quality Auditor | • Mobile (320px–430px), tablet, and desktop layout audits<br>• Hero video player state (must remain paused on load with "Watch Live Demo 🔊")<br>• Pricing consistency (strictly "₹1,999 only")<br>• Hydration error prevention, button/modal interactions |
| **`backend_auditor`** | Backend & API Security Auditor | • Next.js API route handlers (/api/*) validation<br>• JWT authentication, cookie flags (`httpOnly`, `secure`, `sameSite`)<br>• Google OAuth, login, signup, and password reset flows<br>• Razorpay webhook signature verification (HMAC SHA-256) |
| **`database_auditor`** | Firestore & Data Integrity Auditor | • Multi-tenant data isolation (no cross-tenant leakage)<br>• Pro license state tracking (`isPro: true` and Revoke Pro logic)<br>• Firestore collection schemas, null fallbacks, query bounds |
| **`e2e_tester`** | End-to-End QA Engineer | • Merchant onboarding and QR standee studio generation<br>• 5-star Google review AI generation flow (/api/ai/generate)<br>• 1–3 star private feedback capture flow<br>• Razorpay checkout flow and Admin Vault operations |
| **`bug_finder_auditor`** | Bug Hunter & Code Quality Auditor | • TypeScript static type checks (`tsc --noEmit`)<br>• Next.js production build compilation (`npm run build`)<br>• Edge cases, null pointer risks, race condition detection<br>• Secret leak scanning (preventing private keys in client code) |

---

## ⚡ Automated Pre-Deployment Command

Before committing or pushing any change to `master`:
```bash
npm run pre-deploy
```

This automated runner executes:
1. **Critical Production Asset Audit:** Verifies all 22 core pages, API routes, video, and poster assets exist and have non-zero size.
2. **Hero Video Audit:** Asserts `<video>` has no `autoPlay` attribute and includes the interactive Play Demo overlay.
3. **Pricing Compliance Audit:** Asserts all ₹1,999 references across the codebase include the suffix `only`.
4. **Security & Secret Leak Audit:** Scans source code for leaked private keys or hardcoded API secrets.
5. **TypeScript Compiler Audit:** Runs `tsc --noEmit` to ensure zero compilation or type errors.

If any check fails, the deployment is **strictly blocked** until resolved.
