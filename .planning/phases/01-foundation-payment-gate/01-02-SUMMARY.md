---
phase: 01-foundation-payment-gate
plan: "02"
subsystem: user-facing payment flow
tags: [landing-page, payment-form, server-action, uploadthing, zod-validation]
requirements: [PAY-01, PAY-02]

dependency_graph:
  requires: ["01-01"]
  provides: ["landing-page", "payment-form", "payment-proof-submission", "pay-submitted-confirmation"]
  affects: ["01-03"]

tech_stack:
  added: []
  patterns:
    - "useActionState for Server Action form state management"
    - "Tabs (base-ui) for payment method switching"
    - "UploadDropzone (UploadThing) for optional screenshot upload"
    - "Zod schema validation in Server Action with fieldErrors flattening"
    - "redirect() inside Server Action after successful DB insert"

key_files:
  created:
    - src/app/page.tsx
    - src/components/landing/header.tsx
    - src/components/landing/hero.tsx
    - src/components/landing/how-it-works.tsx
    - src/components/landing/pricing-tiers.tsx
    - src/components/landing/trust-signals.tsx
    - src/components/landing/faq.tsx
    - src/components/landing/footer.tsx
    - src/app/pay/page.tsx
    - src/app/pay/submit/actions.ts
    - src/app/pay-submitted/page.tsx
    - src/components/payment/payment-form.tsx
    - src/components/payment/tier-summary.tsx
  modified: []

decisions:
  - "PaymentForm uses useActionState (React 19 hook) rather than useFormState for server action state binding"
  - "GCash QR and bank details shown as placeholder text -- user fills in actual payment details before going live"
  - "UploadDropzone onUploadComplete reads ufsUrl (UploadThing v7 field name) into hidden screenshotUrl input"
  - "Pay page validates tier via Object.keys(PRICING_TIERS) and redirect() if invalid -- no 404 page needed"

metrics:
  duration: "~45 minutes"
  completed: "2026-04-09"
  tasks_completed: 2
  files_created: 13
---

# Phase 1 Plan 02: User-Facing Payment Flow Summary

**One-liner:** Landing page with BIR dispute advisory CTA and per-tier pricing + GCash/bank payment form with Zod-validated Server Action writing to payment_submissions table.

---

## What Was Built

### Task 1: Landing Page (commit `146bb240`)

All landing page sections implemented as server components (except `PricingTiers` which is client):

- **Header** (`header.tsx`): "TaxSpecialista Consult" wordmark, Inter 600, max-w-5xl centered
- **Hero** (`hero.tsx`): Display heading matching UI-SPEC exactly, "Start Consultation" CTA scrolling to `#pricing`
- **HowItWorks** (`how-it-works.tsx`): 3 shadcn Cards with teal-600 step number circles, responsive grid
- **PricingTiers** (`pricing-tiers.tsx`): Client component with `useState` for tier selection, `border-teal-600` selected state, "Pay Now" CTA navigating to `/pay?tier={tierKey}`
- **TrustSignals** (`trust-signals.tsx`): CPA credentials + advisory disclaimer "not formal legal or tax advice", Separator dividers
- **FAQ** (`faq.tsx`): Accordion with 7 questions covering service, disclaimer, payment, BIR scope
- **Footer** (`footer.tsx`): `support@taxspecialista.com`, copyright, disclaimer text

### Task 2: Payment Flow (commit `58a201fc`)

- **TierSummary** (`tier-summary.tsx`): Server component showing tier name + "PHP X,XXX" Badge
- **PaymentForm** (`payment-form.tsx`): Client component with GCash/Bank Transfer Tabs, UploadDropzone for screenshot, reference number + email inputs with `aria-describedby` error wiring, `useActionState` binding to Server Action
- **submitPaymentProof** (`pay/submit/actions.ts`): `"use server"` with Zod schema validating email format, tier enum, paymentMethod enum, referenceNumber 6-50 chars, optional screenshotUrl URL. Inserts to `payment_submissions`, calls `sendPaymentReceivedEmail`, redirects to `/pay-submitted`
- **/pay page** (`pay/page.tsx`): Reads `searchParams.tier`, validates against `PRICING_TIERS` keys, `redirect("/")` if invalid
- **/pay-submitted page** (`pay-submitted/page.tsx`): Lucide `CheckCircle` (green-500, 48px), "Payment Submitted Successfully" heading, email display, "safely close this page" instruction

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed `onValueChange` type mismatch in reject-dialog (pre-existing from plan 01)**
- **Found during:** Task 1 first build
- **Issue:** `Select.onValueChange` from `@base-ui/react/select` passes `string | null` but `setReason` expected `string`
- **Fix:** Wrapped in `(value) => setReason(value ?? "")` handler
- **Files modified:** `src/components/admin/reject-dialog.tsx`
- **Commit:** included in plan 01 scope, fixed inline during Task 1 build

**2. [Rule 1 - Bug] Fixed `asChild` prop on Button not supported by @base-ui/react/button (pre-existing from plan 01)**
- **Found during:** Task 1 build attempt
- **Issue:** `Button asChild` pattern from shadcn-radix is not available in base-ui Button
- **Fix:** Parallel agent fixed using `buttonVariants` + `Link` with `cn()` pattern
- **Files modified:** `src/app/consult/[sessionId]/page.tsx`
- **Note:** Parallel agent (plan 01 or 03) fixed this concurrently

**3. [Rule 3 - Blocking] `export const dynamic = "force-dynamic"` missing on consult page (pre-existing from plan 01)**
- **Found during:** Task 1 build — Neon DB connection attempted at static page generation with no DATABASE_URL
- **Fix:** Parallel agent added `force-dynamic` to `src/app/consult/[sessionId]/page.tsx`
- **Note:** Fixed concurrently by parallel agent

---

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| GCash number "09XX-XXX-XXXX" | `src/components/payment/payment-form.tsx` | Real GCash number must be configured by operator before launch |
| Bank account "XXXX-XXXX-XX" and "BDO / BPI" | `src/components/payment/payment-form.tsx` | Real bank details must be configured by operator before launch |
| GCash QR image `/assets/gcash-qr.png` | `src/components/payment/payment-form.tsx` | Placeholder path; operator provides actual QR image |
| CPA name "[CPA Name]" and experience "[X] years" | `src/components/landing/trust-signals.tsx` | Intentional placeholder; operator fills real CPA credentials |

These stubs are known and intentional for v1 — the operator fills in real payment details before going live. They do not block the plan's goal (flow is wired end-to-end; only content is placeholder).

---

## Threat Coverage

Mitigations from plan threat model applied:

| Threat | Mitigation Applied |
|--------|--------------------|
| T-01-07: Tampering via form data | Zod schema in Server Action validates all fields server-side |
| T-01-08: Spoofing tier/amount | Amount derived server-side from `PRICING_TIERS[tier]`, never from client input |
| T-01-09: Screenshot upload tampering | UploadThing restricts to image MIME types, 4MB max, validated in file router |
| T-01-10: Email in URL disclosure | Accepted risk per threat model; email appears in confirmation URL only |

---

## Self-Check: PASSED

- [x] `src/app/page.tsx` exists and imports all landing components
- [x] `src/components/landing/hero.tsx` contains "Get Expert Guidance on Your BIR Tax Dispute"
- [x] `src/components/landing/pricing-tiers.tsx` has `"use client"`, `PRICING_TIERS`, `/pay?tier=`, `border-teal-600`
- [x] `src/components/landing/trust-signals.tsx` contains "not formal legal or tax advice"
- [x] `src/components/landing/faq.tsx` uses `Accordion` component
- [x] `src/components/landing/footer.tsx` contains "support@taxspecialista.com"
- [x] `src/app/pay/page.tsx` reads and validates `searchParams.tier`
- [x] `src/components/payment/payment-form.tsx` has `"use client"`, `Tabs`, `UploadDropzone`, `referenceNumber`, `email`
- [x] `src/app/pay/submit/actions.ts` has `"use server"`, `z.string().email()`, `.insert(paymentSubmissions)`, `sendPaymentReceivedEmail`, `redirect("/pay-submitted`
- [x] `src/app/pay-submitted/page.tsx` contains "Payment Submitted Successfully"
- [x] `npm run build` completes successfully (all 7 routes generated)
- [x] Commits exist: `146bb240` (Task 1), `58a201fc` (Task 2)
