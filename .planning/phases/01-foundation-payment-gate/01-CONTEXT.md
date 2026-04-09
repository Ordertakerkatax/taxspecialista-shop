# Phase 1: Foundation & Payment Gate - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

A taxpayer can pay for a consultation (GCash or bank transfer) and receive a gated session that unlocks the advisory chat. This phase delivers the Next.js app foundation, database schema, Clerk auth setup, manual payment submission and verification flow, session token gating, and a single-admin dashboard for payment approval. No chat functionality — that's Phase 2.

</domain>

<decisions>
## Implementation Decisions

### Payment Submission UX
- **D-01:** User submits payment proof via reference number (required) plus optional screenshot upload
- **D-02:** Payment instruction page displays GCash QR code and bank account number/name — user pays from their own app then returns to submit proof
- **D-03:** After submission, user provides email and receives email notification when payment is approved (no waiting page — user can close browser)

### Admin Verification Flow
- **D-04:** Admin receives email notification when a new payment submission arrives, with a link to verify in the admin dashboard
- **D-05:** Admin dashboard shows Approve/Reject buttons per payment entry; Reject requires selecting a reason (e.g., amount mismatch, invalid reference)
- **D-06:** Single admin (the CPA owner) for MVP — no multi-user role management needed

### Session Gating Model
- **D-07:** Paid consultation session expires 24 hours after admin approval
- **D-08:** One payment = one continuous chat thread (single thread per consultation)
- **D-09:** Two pricing tiers: Basic (PHP 1,000) vs Comprehensive (PHP 2,500) — user self-selects before paying
- **D-10:** After 24-hour expiry, session becomes read-only — user can view conversation history but cannot send new messages

### Landing & Pricing Page
- **D-11:** Moderate detail landing page: service description, what you get (legal citations, actionable steps, deadlines), pricing tiers side-by-side, FAQ section, then pay button
- **D-12:** Sub-branded as "TaxSpecialista Consult" (or similar) — connected to but distinct from the main TaxSpecialista digital shop
- **D-13:** Trust signals: CPA credentials displayed prominently + educational BIR process context that positions the operator as an authority. Advisory disclaimer ("not formal legal/tax advice") visible before payment

### Claude's Discretion
- Admin dashboard styling and layout details
- Email template design for payment notifications
- Exact form field validation rules for reference number input
- File upload size limits and accepted formats for screenshot

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above and in these project files:

### Project Requirements
- `.planning/REQUIREMENTS.md` — PAY-01 (GCash manual verification), PAY-02 (bank transfer)
- `.planning/PROJECT.md` — Constraints on payment methods, pricing range, regulatory disclaimers
- `CLAUDE.md` §Technology Stack — Full stack decisions (Next.js 15, Clerk, Drizzle, Neon, Resend, Tailwind, shadcn/ui)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield Next.js project. Existing repo contains only static HTML files (index.html, about.html, contact.html, terms.html) from the current TaxSpecialista shop, plus Snipcart templates. These are the EXISTING shop, not the consultation app.

### Established Patterns
- No established patterns yet — this phase sets them.

### Integration Points
- `consult.taxspecialista.com` subdomain — standalone deployment, not embedded in existing shop
- Clerk for authentication (optional user accounts come in Phase 6, but Clerk is set up here)
- Resend for transactional email (payment approved/rejected notifications)
- Neon PostgreSQL for payment submissions, sessions, admin data

</code_context>

<specifics>
## Specific Ideas

- Two pricing tiers with self-selection: Basic (PHP 1,000) and Comprehensive (PHP 2,500)
- Sub-brand identity: "TaxSpecialista Consult" — visually connected but distinct product
- BIR educational content on landing page as trust-building mechanism (not just marketing copy)
- QR code display for GCash — standard in Philippine e-wallet payments

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-payment-gate*
*Context gathered: 2026-04-09*
