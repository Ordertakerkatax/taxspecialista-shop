# Quick Task 260413-drp: Consent gate, acknowledgment letter, scope-lock, pricing update, landing page refresh, admin polish, auto-approve

**Created:** 2026-04-13
**Status:** Completed (retroactive)

## Tasks

### Task 1: Consent gate
- **files:** `src/components/chat/consent-gate.tsx`, `src/components/chat/consultation-with-consent.tsx`, `src/app/api/consent/route.ts`, `src/app/consult/[sessionId]/page.tsx`, `src/db/schema.ts`, `src/db/migrations/add-consented-at-to-sessions.sql`
- **action:** Build consent gate with 3 disclaimers (scope, accuracy, liability), wrapper component for conditional rendering, API endpoint for timestamp storage, schema migration for consentedAt column
- **verify:** Component renders before chat, stores timestamp on accept, skips for returning users
- **done:** true

### Task 2: Acknowledgment letter tool
- **files:** `src/lib/documents/letter-types.ts`, `src/lib/documents/letter-builder.ts`, `src/lib/documents/index.ts`, `src/lib/ai/tools.ts`, `src/app/api/chat/route.ts`, `src/app/api/documents/generate/route.ts`
- **action:** Add AcknowledgmentLetterInput type, BirCorrespondenceType enum, REGLEMENTARY_PERIODS constants (LOA 120d, NIC 15d, NOD 15d, PAN 15d, FAN 30d, FDDA 30d), buildAcknowledgmentLetter builder, generateAcknowledgmentLetter AI tool, route support for acknowledgment letter type
- **verify:** Tool generates correct letter for each correspondence type with proper reglementary period and legal basis
- **done:** true

### Task 3: System prompt updates (scope + scope-lock)
- **files:** `src/lib/ai/system-prompt.ts`
- **action:** Add coverage scope section (full LOA/SDT, acknowledgment-only for assessment stages), add Phase 4 scope-lock (session stays focused on single case after advisory, redirects off-topic questions)
- **verify:** Prompt includes coverage boundaries and scope-lock instructions
- **done:** true

### Task 4: Pricing and limits update
- **files:** `src/lib/constants.ts`, `src/lib/ai/chat-config.ts`
- **action:** Update Basic to PHP 2,000 (50 msgs), Comprehensive to PHP 5,000 (100 msgs), update tier descriptions
- **verify:** Constants reflect new pricing, message limits updated
- **done:** true

### Task 5: Landing page refresh
- **files:** `src/components/landing/hero.tsx`, `src/components/landing/how-it-works.tsx`, `src/components/landing/pricing-tiers.tsx`, `src/components/landing/faq.tsx`, `src/components/landing/trust-signals.tsx`
- **action:** Rewrite all landing page copy for triage positioning: urgency-focused hero, 3-step triage flow, updated pricing features, 7 FAQs including coverage and escalation, ETM TAO trust signals
- **verify:** Landing page renders with new copy, pricing shows PHP 2,000/5,000
- **done:** true

### Task 6: Admin dashboard polish
- **files:** `src/app/admin/payments/page.tsx`, `src/components/admin/payment-table.tsx`
- **action:** Add stats summary (pending payments, active sessions, today's revenue, pending escalations), add amount mismatch indicator comparing payment amount to tier price
- **verify:** Stats cards render, mismatch shown when amount != tier price
- **done:** true

### Task 7: Auto-approve payment logic
- **files:** `src/app/pay/submit/actions.ts`, `src/app/pay-submitted/page.tsx`
- **action:** Add tryAutoApprove function (amount match, ref format validation, duplicate check, rate limit), auto-create session on pass, update confirmation page for auto-approved vs manual review messaging
- **verify:** Auto-approve triggers for valid submissions, manual queue for failures
- **done:** true
