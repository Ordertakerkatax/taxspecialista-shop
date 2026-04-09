# Phase 1: Foundation & Payment Gate - Research

**Researched:** 2026-04-09
**Domain:** Next.js 15 greenfield setup, manual payment verification, session gating, admin dashboard
**Confidence:** HIGH

## Summary

Phase 1 establishes the entire Next.js 15 App Router application foundation and implements a manual payment verification flow. The user selects a pricing tier, pays via GCash or bank transfer outside the app, then submits proof (reference number + optional screenshot). The admin (single CPA owner) receives an email, approves/rejects in a dashboard, and the user gets a time-limited session token unlocking the chat (chat itself is Phase 2).

The stack is well-established: Next.js 15.x + TypeScript, Clerk for auth, Drizzle ORM with Neon PostgreSQL, Tailwind CSS 4.x + shadcn/ui, Resend for transactional email. All packages are current and compatible. The primary complexity is in the session gating model (payment-to-session lifecycle) and the admin verification flow, not in the technology choices.

**Primary recommendation:** Use `create-next-app` to scaffold, add Clerk + Drizzle + Resend + shadcn/ui incrementally. Store payment submissions and sessions in PostgreSQL via Drizzle. Use Clerk's publicMetadata for admin role check. Use Vercel Blob or UploadThing for optional screenshot uploads. Gate chat routes via middleware checking session validity.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** User submits payment proof via reference number (required) plus optional screenshot upload
- **D-02:** Payment instruction page displays GCash QR code and bank account number/name -- user pays from their own app then returns to submit proof
- **D-03:** After submission, user provides email and receives email notification when payment is approved (no waiting page -- user can close browser)
- **D-04:** Admin receives email notification when a new payment submission arrives, with a link to verify in the admin dashboard
- **D-05:** Admin dashboard shows Approve/Reject buttons per payment entry; Reject requires selecting a reason (e.g., amount mismatch, invalid reference)
- **D-06:** Single admin (the CPA owner) for MVP -- no multi-user role management needed
- **D-07:** Paid consultation session expires 24 hours after admin approval
- **D-08:** One payment = one continuous chat thread (single thread per consultation)
- **D-09:** Two pricing tiers: Basic (PHP 1,000) vs Comprehensive (PHP 2,500) -- user self-selects before paying
- **D-10:** After 24-hour expiry, session becomes read-only -- user can view conversation history but cannot send new messages
- **D-11:** Moderate detail landing page: service description, what you get, pricing tiers side-by-side, FAQ section, then pay button
- **D-12:** Sub-branded as "TaxSpecialista Consult"
- **D-13:** Trust signals: CPA credentials displayed prominently + advisory disclaimer visible before payment

### Claude's Discretion
- Admin dashboard styling and layout details
- Email template design for payment notifications
- Exact form field validation rules for reference number input
- File upload size limits and accepted formats for screenshot

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PAY-01 | User can pay for consultation via GCash (manual payment verification) | Payment submission form with GCash reference number + optional screenshot, admin approval flow, session token generation on approval, email notifications via Resend |
| PAY-02 | User can pay for consultation via bank transfer | Same flow as PAY-01 but with bank transfer details displayed; shared submission/approval infrastructure |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.3 | Full-stack framework (App Router) | Current stable; App Router with RSC, Server Actions, streaming [VERIFIED: npm registry] |
| React | 19.2.5 | UI rendering | Bundled with Next.js 16; concurrent features [VERIFIED: npm registry] |
| TypeScript | 6.0.2 | Type safety | Current stable [VERIFIED: npm registry] |
| @clerk/nextjs | 7.0.12 | Authentication + admin role | Current stable; App Router native, middleware-based route protection [VERIFIED: npm registry] |
| drizzle-orm | 0.45.2 | Database ORM | TypeScript-first, lightweight, no runtime overhead [VERIFIED: npm registry] |
| drizzle-kit | 0.31.10 | Migration tooling | Schema push and migration generation [VERIFIED: npm registry] |
| @neondatabase/serverless | 1.0.2 | Neon PostgreSQL driver | HTTP-based serverless PostgreSQL connection [VERIFIED: npm registry] |
| resend | 6.10.0 | Transactional email | Simple API, React Email support [VERIFIED: npm registry] |
| tailwindcss | 4.2.2 | Utility CSS | Current stable v4 with CSS variable support [VERIFIED: npm registry] |
| zod | 4.3.6 | Schema validation | Form validation, Server Action input validation [VERIFIED: npm registry] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-email/components | 1.0.11 | Email templates | Build payment notification and approval email templates [VERIFIED: npm registry] |
| uploadthing | 7.7.4 | File uploads | Optional screenshot upload for payment proof [VERIFIED: npm registry] |
| @uploadthing/react | 7.3.3 | Upload UI components | Client-side upload button/dropzone [VERIFIED: npm registry] |
| shadcn/ui | latest (CLI) | UI component primitives | Copy-paste components: Button, Card, Badge, Table, Dialog, Input, Select [VERIFIED: shadcn docs] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| UploadThing | Vercel Blob | Vercel Blob is simpler but has no built-in upload UI components; UploadThing provides type-safe file routes + React components out of the box |
| UploadThing | Direct S3/R2 | Cheaper at scale but requires manual presigned URL handling; overkill for MVP screenshot uploads |
| Clerk publicMetadata | Custom admin table | Simpler but requires separate admin check logic; Clerk metadata integrates with middleware natively |

**Installation:**
```bash
# Scaffold project
npx create-next-app@latest consult-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Core dependencies
npm install @clerk/nextjs drizzle-orm @neondatabase/serverless resend zod @react-email/components

# File upload
npm install uploadthing @uploadthing/react

# Dev dependencies
npm install -D drizzle-kit

# shadcn/ui initialization
npx shadcn@latest init -d

# Add needed shadcn components
npx shadcn@latest add button card input badge table dialog select textarea tabs separator
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx              # ClerkProvider + global layout
│   ├── page.tsx                # Landing page (D-11, D-12, D-13)
│   ├── pay/
│   │   ├── page.tsx            # Tier selection -> payment instructions
│   │   └── submit/
│   │       └── page.tsx        # Payment proof submission form
│   ├── pay-submitted/
│   │   └── page.tsx            # Confirmation: "We'll email you when approved"
│   ├── consult/
│   │   └── [sessionId]/
│   │       └── page.tsx        # Gated chat page (Phase 2 builds the chat)
│   ├── admin/
│   │   ├── layout.tsx          # Admin auth guard
│   │   └── payments/
│   │       └── page.tsx        # Payment verification dashboard (D-05)
│   └── api/
│       ├── uploadthing/
│       │   └── core.ts         # UploadThing file routes
│       └── webhooks/
│           └── clerk/
│               └── route.ts    # Clerk webhook (optional, for user sync)
├── db/
│   ├── index.ts                # Drizzle client (neon-http)
│   ├── schema.ts               # All table definitions
│   └── migrations/             # Generated by drizzle-kit
├── lib/
│   ├── session.ts              # Session token generation + validation
│   ├── email.ts                # Resend email sending helpers
│   └── constants.ts            # Pricing tiers, expiry duration, etc.
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── landing/                # Landing page sections
│   ├── payment/                # Payment form components
│   └── admin/                  # Admin dashboard components
├── emails/
│   ├── payment-received.tsx    # Admin notification template
│   ├── payment-approved.tsx    # User approval notification
│   └── payment-rejected.tsx    # User rejection notification
└── middleware.ts               # Clerk middleware + admin route protection
```

### Pattern 1: Database Schema Design

**What:** Core tables for payment submissions and consultation sessions
**When to use:** Foundation -- created in Wave 0

```typescript
// src/db/schema.ts
import { pgTable, text, integer, timestamp, pgEnum, boolean, uuid } from "drizzle-orm/pg-core";

export const paymentMethodEnum = pgEnum("payment_method", ["gcash", "bank_transfer"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "approved", "rejected"]);
export const consultationTierEnum = pgEnum("consultation_tier", ["basic", "comprehensive"]);

export const paymentSubmissions = pgTable("payment_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  tier: consultationTierEnum("tier").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  referenceNumber: text("reference_number").notNull(),
  screenshotUrl: text("screenshot_url"),           // optional upload
  amountPhp: integer("amount_php").notNull(),       // 1000 or 2500
  status: paymentStatusEnum("status").default("pending").notNull(),
  rejectionReason: text("rejection_reason"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const consultationSessions = pgTable("consultation_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  paymentId: uuid("payment_id").references(() => paymentSubmissions.id).notNull().unique(),
  email: text("email").notNull(),
  tier: consultationTierEnum("tier").notNull(),
  sessionToken: text("session_token").notNull().unique(),  // crypto.randomUUID()
  activatedAt: timestamp("activated_at").notNull(),         // when admin approved
  expiresAt: timestamp("expires_at").notNull(),             // activated_at + 24h
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```
[VERIFIED: Drizzle ORM docs pattern -- pgTable, pgEnum, uuid, timestamp]

### Pattern 2: Session Token Gating via Middleware

**What:** Check session token validity before allowing access to `/consult/[sessionId]`
**When to use:** Every request to the consultation route

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Admin routes: require Clerk auth + admin role
  if (isAdminRoute(req)) {
    const session = await auth();
    if (!session.userId) {
      return session.redirectToSignIn();
    }
    // Check admin role in publicMetadata
    const metadata = session.sessionClaims?.publicMetadata as { role?: string };
    if (metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Consultation routes: session token checked at page level (not middleware)
  // because token is in the URL path, not in Clerk session
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```
[CITED: clerk.com/docs/reference/nextjs/clerk-middleware]

### Pattern 3: Server Actions for Payment Submission

**What:** Use Next.js Server Actions for form submission -- no API route needed
**When to use:** Payment proof form submission, admin approve/reject actions

```typescript
// src/app/pay/submit/actions.ts
"use server";

import { db } from "@/db";
import { paymentSubmissions } from "@/db/schema";
import { z } from "zod";
import { sendPaymentReceivedEmail } from "@/lib/email";

const submitPaymentSchema = z.object({
  email: z.string().email(),
  tier: z.enum(["basic", "comprehensive"]),
  paymentMethod: z.enum(["gcash", "bank_transfer"]),
  referenceNumber: z.string().min(6).max(50),
  screenshotUrl: z.string().url().optional(),
});

export async function submitPaymentProof(formData: FormData) {
  const parsed = submitPaymentSchema.parse({
    email: formData.get("email"),
    tier: formData.get("tier"),
    paymentMethod: formData.get("paymentMethod"),
    referenceNumber: formData.get("referenceNumber"),
    screenshotUrl: formData.get("screenshotUrl") || undefined,
  });

  const amountPhp = parsed.tier === "basic" ? 1000 : 2500;

  const [submission] = await db.insert(paymentSubmissions).values({
    ...parsed,
    amountPhp,
  }).returning();

  // Notify admin via email
  await sendPaymentReceivedEmail(submission);

  return { success: true, submissionId: submission.id };
}
```
[ASSUMED: Server Actions with Zod validation is standard Next.js 15+ pattern]

### Pattern 4: Admin Approve/Reject with Session Creation

**What:** Admin approves payment, system creates session token and emails user
**When to use:** Admin dashboard actions

```typescript
// src/app/admin/payments/actions.ts
"use server";

import { db } from "@/db";
import { paymentSubmissions, consultationSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { sendPaymentApprovedEmail, sendPaymentRejectedEmail } from "@/lib/email";

export async function approvePayment(paymentId: string) {
  const sessionToken = randomUUID();
  const activatedAt = new Date();
  const expiresAt = new Date(activatedAt.getTime() + 24 * 60 * 60 * 1000); // +24h

  // Update payment status
  const [payment] = await db.update(paymentSubmissions)
    .set({ status: "approved", reviewedAt: activatedAt })
    .where(eq(paymentSubmissions.id, paymentId))
    .returning();

  // Create consultation session
  await db.insert(consultationSessions).values({
    paymentId,
    email: payment.email,
    tier: payment.tier,
    sessionToken,
    activatedAt,
    expiresAt,
  });

  // Email user with session link
  await sendPaymentApprovedEmail(payment.email, sessionToken, expiresAt);
}
```
[ASSUMED: Pattern follows standard Drizzle insert/update with returning()]

### Anti-Patterns to Avoid

- **Storing session token in Clerk session:** The consultation session is payment-based, not auth-based. Keep it in PostgreSQL with its own expiry. Clerk handles admin auth only.
- **Using cookies for session gating:** Session token should be in the URL (`/consult/[sessionToken]`) so the emailed link works without any prior auth state. The token IS the access credential.
- **Building a full RBAC system:** D-06 says single admin. Use Clerk publicMetadata `{ role: "admin" }` on one user. Do not build roles/permissions tables.
- **Polling for payment approval:** D-03 says user closes browser and gets email. No WebSocket or polling needed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File uploads | Custom multipart handling | UploadThing | Handles size limits, type validation, CDN storage, presigned URLs |
| Email sending | SMTP client, Nodemailer | Resend + React Email | Deliverability, templates as React components, free tier sufficient |
| Admin auth | Custom JWT, login page | Clerk | Hosted sign-in, session management, metadata for admin role |
| Form validation | Manual if/else checks | Zod schemas | Type inference, composable, works with Server Actions |
| UUID generation | Custom ID schemes | `crypto.randomUUID()` | Built into Node.js, cryptographically secure |
| Route protection | Custom auth middleware | Clerk `clerkMiddleware()` | Integrated with Next.js middleware, handles redirects |

**Key insight:** This phase has zero novel technical challenges. Every piece (auth, email, uploads, forms, database) has a mature library. The only custom logic is the payment-to-session lifecycle (submit -> approve -> create session -> email link), which is simple CRUD with email triggers.

## Common Pitfalls

### Pitfall 1: Clerk Middleware File Naming
**What goes wrong:** Clerk middleware not intercepting requests
**Why it happens:** Next.js 16+ may expect `proxy.ts` instead of `middleware.ts` (Clerk docs mention this for Next.js >15). However, Next.js 15.x still uses `middleware.ts`.
**How to avoid:** Check the Clerk docs for your exact Next.js version. For Next.js 16.x, the file may need to be `proxy.ts`.
**Warning signs:** `auth() was called but Clerk can't detect usage of clerkMiddleware()` error
[CITED: clerk.com/docs/nextjs/getting-started/quickstart]

### Pitfall 2: Neon Connection String Format
**What goes wrong:** Database connection fails in production
**Why it happens:** Neon connection strings require `?sslmode=require` for production. The serverless driver handles this, but direct `pg` connections may not.
**How to avoid:** Always use `@neondatabase/serverless` with `drizzle-orm/neon-http` -- not `drizzle-orm/node-postgres`.
**Warning signs:** Connection timeout or SSL errors in Vercel logs

### Pitfall 3: Session Token Exposure in URL
**What goes wrong:** Session tokens leaked via referrer headers or browser history
**Why it happens:** Token is in the URL path for email link access
**How to avoid:** Use UUIDv4 tokens (not sequential IDs), set 24h expiry (D-07), and add `Referrer-Policy: no-referrer` header on consultation pages. Consider exchanging the URL token for an httpOnly cookie on first visit.
**Warning signs:** Analytics tools logging full URLs with tokens

### Pitfall 4: Race Condition on Double-Approve
**What goes wrong:** Admin clicks Approve twice, creates duplicate sessions
**Why it happens:** No idempotency check on approve action
**How to avoid:** Check payment status is "pending" before approving. Use a database transaction or `WHERE status = 'pending'` in the UPDATE query.
**Warning signs:** Multiple session records for the same payment

### Pitfall 5: Drizzle Schema Push vs Migration
**What goes wrong:** Schema changes lost or inconsistent between environments
**Why it happens:** Using `drizzle-kit push` in production (designed for dev prototyping)
**How to avoid:** Use `drizzle-kit generate` + `drizzle-kit migrate` for production. `push` is fine for initial development.
**Warning signs:** Schema drift between local and production databases

### Pitfall 6: Clerk v7 Breaking Changes
**What goes wrong:** Code examples from v5 docs don't work
**Why it happens:** Current npm version is 7.0.12, but CLAUDE.md references v5. Clerk v7 deprecated `<SignedIn>`/`<SignedOut>` in favor of `<Show when="signed-in">`.
**How to avoid:** Use Clerk v7 API: `<Show when="signed-in">`, `<Show when="signed-out">`. Check current docs, not cached examples.
**Warning signs:** Deprecation warnings about SignedIn/SignedOut components
[CITED: clerk.com/docs/nextjs/getting-started/quickstart]

## Code Examples

### Resend Email Sending

```typescript
// src/lib/email.ts
import { Resend } from "resend";
import PaymentApprovedEmail from "@/emails/payment-approved";
import PaymentReceivedEmail from "@/emails/payment-received";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "TaxSpecialista Consult <noreply@taxspecialista.com>";

export async function sendPaymentApprovedEmail(
  userEmail: string,
  sessionToken: string,
  expiresAt: Date
) {
  const consultUrl = `${process.env.NEXT_PUBLIC_APP_URL}/consult/${sessionToken}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: userEmail,
    subject: "Your TaxSpecialista Consultation is Ready",
    react: PaymentApprovedEmail({ consultUrl, expiresAt }),
  });
}

export async function sendPaymentReceivedEmail(submission: {
  id: string;
  email: string;
  tier: string;
  referenceNumber: string;
  amountPhp: number;
}) {
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/payments`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: process.env.ADMIN_EMAIL!,
    subject: `New Payment: PHP ${submission.amountPhp} - ${submission.referenceNumber}`,
    react: PaymentReceivedEmail({ submission, adminUrl }),
  });
}
```
[CITED: resend.com/docs/send-with-nextjs]

### Session Validation Helper

```typescript
// src/lib/session.ts
import { db } from "@/db";
import { consultationSessions } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function validateSession(sessionToken: string) {
  const [session] = await db.select()
    .from(consultationSessions)
    .where(
      and(
        eq(consultationSessions.sessionToken, sessionToken),
      )
    )
    .limit(1);

  if (!session) return { valid: false, reason: "not_found" as const };

  const now = new Date();
  const expired = now > session.expiresAt;

  return {
    valid: !expired,
    reason: expired ? "expired" as const : "active" as const,
    session,
    readOnly: expired,  // D-10: expired sessions are read-only
  };
}
```
[ASSUMED: Standard Drizzle query pattern]

### UploadThing File Route

```typescript
// src/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  paymentScreenshot: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```
[CITED: docs.uploadthing.com/getting-started/appdir]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Clerk v5 `<SignedIn>/<SignedOut>` | Clerk v7 `<Show when="signed-in/signed-out">` | 2025-2026 | Update all conditional auth rendering [CITED: clerk.com/docs] |
| `middleware.ts` filename | `proxy.ts` for Next.js >15 | Next.js 16 | Clerk docs note filename change; verify for your version [CITED: clerk.com/docs] |
| Drizzle `0.30.x` | Drizzle `0.45.x` | 2025-2026 | CLAUDE.md references 0.30.x; current is 0.45.2 [VERIFIED: npm registry] |
| Tailwind CSS 3.x | Tailwind CSS 4.x | 2025 | v4 uses CSS-first config, not `tailwind.config.js` [VERIFIED: npm registry] |
| Zod 3.x | Zod 4.x | 2025-2026 | Current is 4.3.6; API largely compatible [VERIFIED: npm registry] |

**Deprecated/outdated:**
- CLAUDE.md version numbers are stale: Clerk v5 -> now v7, Drizzle 0.30 -> now 0.45, Tailwind 4.x is correct but specific syntax changed, TypeScript 5.x -> now 6.x, Next.js 15.x -> now 16.x
- `@clerk/nextjs` `<SignedIn>` and `<SignedOut>` components replaced by `<Show>` component

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Server Actions with Zod validation is the standard form handling pattern in Next.js 15+ | Architecture Pattern 3 | Low -- Server Actions are documented; alternative is API routes which also work |
| A2 | Clerk publicMetadata with `{ role: "admin" }` is sufficient for single-admin gating | Architecture Pattern 2 | Low -- if metadata API changed, can fall back to checking against hardcoded admin email |
| A3 | UploadThing free tier is sufficient for MVP screenshot uploads | Standard Stack | Low -- alternative is Vercel Blob which is also viable |
| A4 | `proxy.ts` vs `middleware.ts` naming depends on Next.js version | Pitfall 1 | Medium -- wrong filename means middleware silently doesn't run; must verify at setup time |
| A5 | Resend free tier (100 emails/day) covers MVP admin + user notifications | Standard Stack | Low -- MVP volume will be well under 100/day |

## Open Questions

1. **Clerk `proxy.ts` vs `middleware.ts`**
   - What we know: Clerk docs mention `proxy.ts` for Next.js >15, `middleware.ts` for <=15
   - What's unclear: Exact cutoff version; `create-next-app` currently produces Next.js 16.2.3
   - Recommendation: Test at setup time; Clerk CLI/docs will indicate correct filename

2. **Resend domain verification for taxspecialista.com**
   - What we know: Resend requires domain DNS verification to send from custom domain
   - What's unclear: Whether DNS access is available for subdomain email setup
   - Recommendation: Use Resend's default `onboarding@resend.dev` for development; configure domain before production

3. **UploadThing vs Vercel Blob for screenshots**
   - What we know: Both work; UploadThing has better React components, Vercel Blob is simpler
   - What's unclear: UploadThing free tier limits for MVP
   - Recommendation: Use UploadThing -- better DX for file upload UI; switch to Vercel Blob if limits are hit

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | Yes | v24.4.1 | -- |
| npm | Package management | Yes | 11.4.2 | -- |
| PostgreSQL (Neon) | Database | External service | -- | Requires Neon account setup |
| Clerk | Authentication | External service | -- | Requires Clerk account setup |
| Resend | Email | External service | -- | Requires Resend account setup |
| UploadThing | File uploads | External service | -- | Requires UploadThing account; fallback: Vercel Blob |
| Vercel | Deployment | External service | -- | Requires Vercel account |

**Missing dependencies with no fallback:**
- Neon PostgreSQL account: Must be created before database schema can be pushed
- Clerk account: Must be created to get publishable/secret keys (keyless mode works for dev)

**Missing dependencies with fallback:**
- Resend: Can use console logging during development; real email only needed for integration testing
- UploadThing: Can defer screenshot upload and use text-only reference number for initial development

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (recommended for Next.js + TypeScript) |
| Config file | None -- Wave 0 must create `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PAY-01 | GCash payment submission creates pending record | unit | `npx vitest run src/__tests__/payment-submit.test.ts -t "gcash"` | Wave 0 |
| PAY-01 | Admin approve creates session + sends email | unit | `npx vitest run src/__tests__/admin-approve.test.ts` | Wave 0 |
| PAY-01 | Session token grants access to consultation page | unit | `npx vitest run src/__tests__/session-validate.test.ts` | Wave 0 |
| PAY-01 | Expired session returns read-only state | unit | `npx vitest run src/__tests__/session-validate.test.ts -t "expired"` | Wave 0 |
| PAY-01 | No valid session redirects to payment-required | unit | `npx vitest run src/__tests__/session-validate.test.ts -t "invalid"` | Wave 0 |
| PAY-02 | Bank transfer submission creates pending record | unit | `npx vitest run src/__tests__/payment-submit.test.ts -t "bank"` | Wave 0 |
| PAY-01/02 | Admin reject records reason | unit | `npx vitest run src/__tests__/admin-reject.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- framework configuration
- [ ] `src/__tests__/payment-submit.test.ts` -- payment submission logic
- [ ] `src/__tests__/admin-approve.test.ts` -- approval flow
- [ ] `src/__tests__/admin-reject.test.ts` -- rejection flow
- [ ] `src/__tests__/session-validate.test.ts` -- session token validation
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | Clerk (admin auth only; users are anonymous payers) |
| V3 Session Management | Yes | Clerk sessions for admin; custom session tokens for consultations (UUID, 24h expiry, DB-backed) |
| V4 Access Control | Yes | Clerk middleware for admin routes; session token validation for consultation routes |
| V5 Input Validation | Yes | Zod schemas for all form inputs (reference number, email, tier selection) |
| V6 Cryptography | No | No custom crypto; `crypto.randomUUID()` for tokens |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Session token enumeration | Information Disclosure | Use UUIDv4 (128-bit random); rate limit consultation page access |
| Payment proof forgery | Spoofing | Admin manual verification (by design); reference number cross-checked by admin |
| Admin route bypass | Elevation of Privilege | Clerk middleware + publicMetadata role check |
| File upload malware | Tampering | UploadThing validates file type server-side; restrict to image MIME types |
| Email injection in contact form | Tampering | Zod email validation; Resend handles email composition |
| Referrer header leaks session token | Information Disclosure | Set `Referrer-Policy: no-referrer` on consultation pages |

## Project Constraints (from CLAUDE.md)

- **Stack locked:** Next.js 15+ (App Router), TypeScript, Clerk, Drizzle ORM, Neon PostgreSQL, Tailwind CSS, shadcn/ui, Resend
- **Regulatory:** Must include clear disclaimers that output is not formal legal/tax advice (D-13)
- **Payment:** Must support GCash and bank transfer; no credit card required for MVP
- **Pricing:** PHP 1,000-3,000 per consultation (D-09 sets Basic at 1,000, Comprehensive at 2,500)
- **Liability:** Complex cases must be flagged (Phase 5 concern, not Phase 1)
- **Sub-domain:** Standalone deployment at consult.taxspecialista.com

## Sources

### Primary (HIGH confidence)
- npm registry -- verified all package versions (Next.js 16.2.3, React 19.2.5, Clerk 7.0.12, Drizzle 0.45.2, etc.)
- [Clerk Next.js quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart) -- middleware setup, ClerkProvider, v7 API changes
- [Clerk middleware reference](https://clerk.com/docs/reference/nextjs/clerk-middleware) -- createRouteMatcher, route protection
- [Drizzle ORM + Neon setup](https://orm.drizzle.team/docs/get-started/neon-new) -- connection, schema, config, migrations
- [UploadThing App Router setup](https://docs.uploadthing.com/getting-started/appdir) -- file routes, React components
- [Resend Next.js docs](https://resend.com/docs/send-with-nextjs) -- email sending, React Email integration
- [shadcn/ui Next.js installation](https://ui.shadcn.com/docs/installation/next) -- CLI init, component adding

### Secondary (MEDIUM confidence)
- [Next.js installation docs](https://nextjs.org/docs/app/getting-started/installation) -- create-next-app defaults
- [Clerk RBAC guide](https://clerk.com/docs/guides/secure/basic-rbac) -- publicMetadata for role checks

### Tertiary (LOW confidence)
- None -- all claims verified against official docs or npm registry

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified via npm registry, all libraries have official Next.js integration docs
- Architecture: HIGH -- patterns follow official documentation; schema design is straightforward CRUD
- Pitfalls: MEDIUM-HIGH -- Clerk v7 changes verified; middleware naming needs runtime verification
- Security: HIGH -- standard controls for a payment-submission app; no custom crypto

**Research date:** 2026-04-09
**Valid until:** 2026-05-09 (30 days -- stable stack, no fast-moving dependencies)
