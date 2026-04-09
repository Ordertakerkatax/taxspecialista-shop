---
phase: 01-foundation-payment-gate
plan: 01
subsystem: foundation
tags: [next.js, clerk, drizzle, neon, resend, uploadthing, vitest, shadcn]
dependency_graph:
  requires: []
  provides:
    - src/db/schema.ts (paymentSubmissions, consultationSessions tables)
    - src/lib/session.ts (validateSession)
    - src/lib/email.ts (sendPaymentReceivedEmail, sendPaymentApprovedEmail, sendPaymentRejectedEmail)
    - src/lib/constants.ts (PRICING_TIERS, SESSION_EXPIRY_HOURS, REJECTION_REASONS)
    - src/middleware.ts (clerkMiddleware admin route protection)
  affects:
    - 01-02 (payment form, submit action, admin dashboard depend on schema + email + constants)
    - 01-03 (landing page depends on PRICING_TIERS from constants)
tech_stack:
  added:
    - Next.js 16.2.3 (App Router)
    - React 19.2.5
    - TypeScript 6.0.2
    - "@clerk/nextjs 7.0.12"
    - drizzle-orm 0.45.2
    - "@neondatabase/serverless 1.0.2"
    - resend 6.10.0
    - zod 4.3.6
    - "@react-email/components 1.0.11"
    - uploadthing 7.7.4
    - "@uploadthing/react 7.3.3"
    - tailwindcss 4.2.2
    - shadcn/ui (button, card, input, badge, table, dialog, select, textarea, tabs, separator, accordion, label)
    - vitest 4.1.3
  patterns:
    - Drizzle neon-http driver for serverless PostgreSQL
    - Clerk publicMetadata role check for admin gating
    - Session token in URL path (not cookie) for email-link access
    - React Email templates for all transactional emails
    - vi.mock + top-level await import for ESM test mocking
key_files:
  created:
    - src/db/schema.ts
    - src/db/index.ts
    - src/lib/constants.ts
    - src/lib/session.ts
    - src/lib/email.ts
    - src/middleware.ts
    - src/app/layout.tsx
    - src/app/api/uploadthing/core.ts
    - src/app/api/uploadthing/route.ts
    - src/lib/uploadthing.ts
    - src/emails/payment-received.tsx
    - src/emails/payment-approved.tsx
    - src/emails/payment-rejected.tsx
    - vitest.config.ts
    - src/__tests__/session-validate.test.ts
    - src/__tests__/payment-submit.test.ts
    - src/__tests__/admin-actions.test.ts
    - drizzle.config.ts
    - .env.example
    - .gitignore
  modified:
    - src/app/layout.tsx (ClerkProvider, Inter font, TaxSpecialista metadata)
decisions:
  - "Used proxy.ts convention is warned by Next.js 16 but middleware.ts still works; noted for future migration"
  - "vi.mock with top-level await import needed for ESM module mocking in vitest"
  - "drizzle-kit push to Neon requires user-provided DATABASE_URL (external service gate)"
metrics:
  duration_minutes: 10
  completed_date: "2026-04-09"
  tasks_completed: 3
  tasks_total: 3
  files_created: 20
  tests_passing: 22
---

# Phase 1 Plan 1: Foundation Scaffold Summary

**One-liner:** Next.js 16 app scaffolded with Clerk admin auth, Drizzle+Neon schema, Resend email templates, UploadThing file routes, and 22 passing vitest tests covering session validation, payment submission, and admin actions.

## What Was Built

The complete foundation layer for the TaxSpecialista Consult app:

1. **Next.js 16 app** with TypeScript, Tailwind CSS 4, App Router, and shadcn/ui components (12 components installed)
2. **Clerk authentication middleware** in `src/middleware.ts` protecting `/admin/*` routes with `publicMetadata.role === "admin"` check
3. **Drizzle database schema** with `payment_submissions` and `consultation_sessions` tables, three PostgreSQL enums (payment_method, payment_status, consultation_tier), and a UUID primary key pattern
4. **Session validation helper** (`validateSession`) returning typed union: `active | expired | not_found` with `readOnly` flag for expired sessions (D-10 compliance)
5. **Email helpers** for all three notification types: admin receives payment proof notification, user receives session link on approval, user receives reason on rejection
6. **React Email templates** for all three email types, branded as "TaxSpecialista Consult"
7. **UploadThing file routes** for payment screenshot uploads (4MB max, image only)
8. **22 passing vitest tests** covering session validation edge cases, payment form Zod validation, and admin approve/reject business rules

## Authentication Gate

`drizzle-kit push` (schema push to Neon) requires `DATABASE_URL` in `.env.local`. This is a user setup step:
- Go to [neon.tech](https://neon.tech), create a project
- Copy the connection string to `DATABASE_URL` in `.env.local`
- Run `npx drizzle-kit push` to create the tables

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ESM module mocking in session-validate.test.ts**
- **Found during:** Task 3 (test run)
- **Issue:** Initial test used `require("@/db")` in `beforeEach` after `vi.mock("@/db")`, causing "Cannot find module" error — ESM modules cannot be required after mocking in vitest
- **Fix:** Rewrote test to use top-level `await import("@/db")` pattern after `vi.mock()` declarations
- **Files modified:** `src/__tests__/session-validate.test.ts`
- **Result:** All 3 session validation tests now pass

**2. [Rule 2 - Missing Critical] Added .gitignore**
- **Found during:** Post-commit status check
- **Issue:** No `.gitignore` in project — `.next/`, `node_modules/`, `.env.local` would be tracked on next git add
- **Fix:** Created comprehensive `.gitignore` covering Next.js, node_modules, env files, build artifacts
- **Files created:** `.gitignore`
- **Commit:** 303ee415

### Known Deviations

**Next.js 16 middleware filename warning**
- `src/middleware.ts` produces deprecation warning: "The 'middleware' file convention is deprecated. Please use 'proxy' instead."
- Build still succeeds and middleware functions correctly
- This is Pitfall 1 from the research — will need to be renamed to `proxy.ts` in a future plan when upgrading conventions
- Logged to deferred-items

## Known Stubs

None — all files are complete implementations. The `drizzle-kit push` is blocked by missing DATABASE_URL (user setup gate, not a stub).

## Threat Surface Scan

All implemented surfaces were in the plan's threat model:

| Component | Threat ID | Mitigation |
|-----------|-----------|------------|
| `src/middleware.ts` | T-01-01 | Clerk middleware + publicMetadata.role check implemented |
| `src/db/schema.ts` | T-01-03 | UUID session tokens, expiresAt 24h |
| `src/app/api/uploadthing/core.ts` | T-01-04 | Image only, 4MB max, 1 file |

No new threat surface introduced beyond plan scope.

## Self-Check: PASSED

All 18 created files verified present on disk. All 4 task commits found in git history:
- 361f46b4: feat(01-01): scaffold Next.js app with Clerk, Drizzle, shadcn, UploadThing
- 0d183710: feat(01-01): database schema, session validation, email helpers, and email templates
- b029ecaf: feat(01-01): vitest config and test scaffolds for session, payment, and admin actions
- 303ee415: chore(01-01): add .gitignore for Next.js project

22 tests passing. Build succeeds. TypeScript clean.
