---
phase: 01-foundation-payment-gate
plan: "03"
subsystem: admin-dashboard, consultation-gate
tags: [admin, payment-verification, session-gate, server-actions, next.js]
dependency_graph:
  requires: ["01-01"]
  provides: ["admin-payments-dashboard", "consultation-session-gate"]
  affects: ["02-chat-core"]
tech_stack:
  added: []
  patterns:
    - "Server Actions with defense-in-depth Clerk auth check"
    - "force-dynamic on DB-dependent pages to prevent static generation at build"
    - "buttonVariants + Link for type-safe styled link buttons (base-ui Button has no asChild)"
    - "DATABASE_URL build-time fallback in next.config.ts env block"
key_files:
  created:
    - src/app/admin/layout.tsx
    - src/app/admin/payments/page.tsx
    - src/app/admin/payments/actions.ts
    - src/components/admin/payment-table.tsx
    - src/components/admin/reject-dialog.tsx
    - src/app/consult/[sessionId]/page.tsx
  modified:
    - next.config.ts
decisions:
  - "Used buttonVariants + Link instead of Button asChild — base-ui Button primitive has no asChild prop"
  - "Added force-dynamic export to DB-dependent pages to prevent Next.js static generation at build"
  - "Added DATABASE_URL build-time fallback in next.config.ts so neon() module-level init does not fail during page data collection"
metrics:
  duration_minutes: 35
  completed_date: "2026-04-09"
  tasks_completed: 2
  files_created: 6
  files_modified: 1
---

# Phase 01 Plan 03: Admin Payment Verification Dashboard and Consultation Gate Summary

**One-liner:** Admin approve/reject payment dashboard with Clerk server-side auth, 24h session creation, and three-state consultation gate page (active/expired/invalid) with referrer-policy token protection.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Admin payment verification dashboard with approve/reject | f689e241 | src/app/admin/payments/page.tsx, actions.ts, src/components/admin/payment-table.tsx, reject-dialog.tsx |
| 2 | Consultation gate page with valid/expired/invalid states | 52f13297 | src/app/consult/[sessionId]/page.tsx |

## What Was Built

### Task 1: Admin Payment Verification Dashboard

`/admin/payments` is a server-rendered page (protected by Clerk middleware + admin role check) showing a filterable table of all payment submissions.

**Components:**
- `src/app/admin/layout.tsx` — layout wrapper with page title metadata and 1200px max-width container
- `src/app/admin/payments/page.tsx` — server component reading `searchParams.status` filter, querying `paymentSubmissions` with `orderBy(desc(createdAt))`, rendering tab nav links and passing payments to `PaymentTable`
- `src/app/admin/payments/actions.ts` — two server actions:
  - `approvePayment`: verifies Clerk session, generates UUID session token, calculates 24h expiry (`activatedAt + SESSION_EXPIRY_HOURS * 60 * 60 * 1000`), updates payment status only if `status = "pending"` (double-approve prevention per T-01-14), inserts `consultationSessions` record, sends approval email
  - `rejectPayment`: verifies Clerk session, updates payment with rejection reason and `reviewedAt`, guards on pending status, sends rejection email
- `src/components/admin/payment-table.tsx` — client component with desktop `<Table>` and mobile card list (responsive at 640px breakpoint); action buttons carry `aria-label="Approve payment from {email}"` and `aria-label="Reject payment from {email}"` per accessibility contract
- `src/components/admin/reject-dialog.tsx` — shadcn Dialog with base-ui Select populated from `REJECTION_REASONS`; confirm button disabled until reason selected; calls `rejectPayment` via server action on confirm

### Task 2: Consultation Gate Page

`/consult/[sessionId]` is a server component that calls `validateSession(sessionId)` from `src/lib/session.ts` and branches on three states:

- **Active (`reason === "active"`)** — Card with "Your Consultation is Ready" heading, `MessageCircle` icon, tier badge from `PRICING_TIERS`, session email, static expiry timestamp, Phase 2 placeholder copy
- **Expired (`reason === "expired"`)** — Amber banner (`bg-amber-50 border-amber-200`), "Session Expired" card with read-only copy per D-10, chat history placeholder, "Start a New Consultation" CTA
- **Invalid (`reason === "not_found"`)** — `AlertCircle` icon in red-500, "Consultation Access Required" heading, payment-required copy, support email link, "Start a New Consultation" CTA

`Referrer-Policy: no-referrer` applied via `metadata.other.referrerPolicy` to prevent session token leakage through browser referrer header (T-01-13).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Button `asChild` prop not supported by base-ui Button**
- **Found during:** Task 2 TypeScript compilation
- **Issue:** The shadcn Button component in this project wraps `@base-ui/react/button` which does not support the `asChild` (Radix Slot) pattern. Using `<Button asChild>` caused TS2322 errors.
- **Fix:** Used `buttonVariants()` from `@/components/ui/button` + Next.js `<Link>` directly, applying the variant class string via `cn(buttonVariants(...), ...)`. Same visual output, no asChild needed.
- **Files modified:** `src/app/consult/[sessionId]/page.tsx`
- **Commit:** 52f13297

**2. [Rule 3 - Blocking] Next.js build fails: neon() called at module load without DATABASE_URL**
- **Found during:** Task 1/2 build verification
- **Issue:** `src/db/index.ts` calls `neon(process.env.DATABASE_URL!)` at module evaluation time. During `npm run build`, Next.js collects page configuration by importing modules — no DB env var is set in CI/build, causing "No database connection string was provided" error and build failure.
- **Fix 1:** Added `export const dynamic = "force-dynamic"` to both `src/app/admin/payments/page.tsx` and `src/app/consult/[sessionId]/page.tsx` — this opts the pages out of static generation but does not prevent module evaluation during page data collection.
- **Fix 2:** Added a `DATABASE_URL` build-time fallback in `next.config.ts` via the `env` block: `DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://build-placeholder:..."`. This satisfies `neon()` at build time without a real connection; runtime uses the actual env var.
- **Files modified:** `next.config.ts`, `src/app/admin/payments/page.tsx`, `src/app/consult/[sessionId]/page.tsx`
- **Commit:** f689e241 (next.config.ts, admin page), 52f13297 (consult page)

**3. [Rule 2 - Missing] Select `onValueChange` handler null-safety**
- **Found during:** Task 1 TypeScript compilation
- **Issue:** base-ui Select passes `string | null` to `onValueChange` but `setReason` expected `SetStateAction<string>`. Auto-fixed by linter to `(value) => setReason(value ?? "")`.
- **Files modified:** `src/components/admin/reject-dialog.tsx` (linter auto-fixed)
- **Commit:** f689e241

## Known Stubs

| Stub | File | Line | Reason |
|------|------|------|--------|
| Chat history placeholder | `src/app/consult/[sessionId]/page.tsx` | ~116 | Intentional — Phase 2 (Chat Core) wires the actual conversation history. The expired state needs the UI container to be present for Phase 2 to populate. |
| Phase 2 placeholder copy | `src/app/consult/[sessionId]/page.tsx` | ~80 | Intentional — plan spec explicitly states "Placeholder body: Chat functionality is coming in Phase 2." |

## Threat Flags

No new threat surface introduced beyond what was specified in the plan's threat model. All four STRIDE threats (T-01-11 through T-01-14) mitigated:

- T-01-11 (EoP): Both server actions call `auth()` from `@clerk/nextjs/server` — Clerk session verified server-side regardless of middleware
- T-01-12 (Repudiation): `reviewedAt` timestamp set on every approve/reject
- T-01-13 (Info Disclosure): `Referrer-Policy: no-referrer` via metadata; UUID session tokens
- T-01-14 (DoS/double-approve): `WHERE status = 'pending'` guard in both update queries

## Self-Check: PASSED

Files verified present:
- FOUND: src/app/admin/layout.tsx
- FOUND: src/app/admin/payments/page.tsx
- FOUND: src/app/admin/payments/actions.ts
- FOUND: src/components/admin/payment-table.tsx
- FOUND: src/components/admin/reject-dialog.tsx
- FOUND: src/app/consult/[sessionId]/page.tsx

Commits verified:
- FOUND: f689e241 feat(01-03): admin payment verification dashboard
- FOUND: 52f13297 feat(01-03): consultation gate page

Build: `npm run build` passes — both routes marked ƒ (Dynamic server-rendered on demand).
