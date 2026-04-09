# Phase 1: Foundation & Payment Gate - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-09
**Phase:** 01-foundation-payment-gate
**Areas discussed:** Payment submission UX, Admin verification flow, Session gating model, Landing & pricing page

---

## Payment Submission UX

### Q1: How should users submit their GCash/bank transfer payment proof?

| Option | Description | Selected |
|--------|-------------|----------|
| Reference number only | User enters the GCash/bank reference number. Simpler, faster, less friction | |
| Screenshot upload | User uploads a screenshot of payment confirmation. More verifiable | |
| Both options | Reference number required + optional screenshot upload | ✓ |

**User's choice:** Both options
**Notes:** Reference number is required, screenshot is optional extra proof

### Q2: What payment details should the user see on the payment instruction page?

| Option | Description | Selected |
|--------|-------------|----------|
| Show QR + account details | Display GCash QR code and bank account number/name directly on the page | ✓ |
| Deep link to GCash/Maya | Link that opens GCash/Maya app with pre-filled amount | |
| Simple text instructions | Plain text instructions for payment | |

**User's choice:** Show QR + account details

### Q3: After submitting payment proof, what should the user experience?

| Option | Description | Selected |
|--------|-------------|----------|
| Waiting page with status | Auto-refreshing page showing payment review status | |
| Email notification | User provides email, gets notified when approved | ✓ |
| Both (page + email) | Waiting page for those who stay, email for those who leave | |

**User's choice:** Email notification

---

## Admin Verification Flow

### Q4: How should admin be notified of new payments?

| Option | Description | Selected |
|--------|-------------|----------|
| Email notification | Email with payment details and link to verify | ✓ |
| Dashboard only | Check dashboard manually, badge for new payments | |
| Email + dashboard badge | Both email alert and dashboard badge | |

**User's choice:** Email notification

### Q5: What should the admin verification action look like?

| Option | Description | Selected |
|--------|-------------|----------|
| Approve/Reject buttons | Two-button action, reject requires a reason | ✓ |
| Approve/Reject + notes | Same buttons plus free-text notes field | |
| Approve only | Only approve button, invalid submissions ignored | |

**User's choice:** Approve/Reject buttons

### Q6: How many admins will verify payments for MVP?

| Option | Description | Selected |
|--------|-------------|----------|
| Just me (single admin) | Only one verifier, simple auth | ✓ |
| Me + 1 assistant | Two people, basic multi-user admin | |
| Team (3+) | Multiple verifiers, needs assignment system | |

**User's choice:** Just me (single admin)

---

## Session Gating Model

### Q7: How long should a paid consultation session last?

| Option | Description | Selected |
|--------|-------------|----------|
| 24 hours | Expires 24 hours after approval | ✓ |
| 72 hours (3 days) | More generous window | |
| No time limit | Never expires | |

**User's choice:** 24 hours

### Q8: Single thread or multiple threads per payment?

| Option | Description | Selected |
|--------|-------------|----------|
| Single thread | One continuous conversation per payment | ✓ |
| Single thread + follow-up | Main thread plus follow-up questions | |
| You decide | Claude's discretion | |

**User's choice:** Single thread

### Q9: Flat rate or tiered pricing?

| Option | Description | Selected |
|--------|-------------|----------|
| Flat rate (one price) | Single price point for all consultations | |
| 2 tiers by complexity | Basic (PHP 1,000) vs Comprehensive (PHP 2,500) | ✓ |
| You decide | Claude's discretion | |

**User's choice:** 2 tiers by complexity

### Q10: What happens when session expires?

| Option | Description | Selected |
|--------|-------------|----------|
| Read-only access | User can view history but can't send new messages | ✓ |
| Full lockout | Session completely locked | |
| Read-only + summary | View history plus auto-generated summary | |

**User's choice:** Read-only access

---

## Landing & Pricing Page

### Q11: How much detail on the landing page?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal — straight to pay | Brief description and pay button | |
| Moderate — explain the value | Service description, what you get, pricing tiers, FAQ, pay button | ✓ |
| Full sales page | Detailed value proposition, how it works, comparison, testimonials | |

**User's choice:** Moderate — explain the value

### Q12: Branding approach?

| Option | Description | Selected |
|--------|-------------|----------|
| TaxSpecialista branded | Uses existing branding | |
| Sub-brand | "TaxSpecialista Consult" — connected but distinct | ✓ |
| You decide | Claude's discretion | |

**User's choice:** Sub-brand

### Q13: Trust signals for Philippine market?

| Option | Description | Selected |
|--------|-------------|----------|
| CPA credentials + disclaimer | CPA license info + advisory disclaimer | |
| Credentials + sample output | CPA info + anonymized consultation preview | |
| Credentials + BIR context | CPA info + educational BIR process content | ✓ |

**User's choice:** Credentials + BIR context

---

## Claude's Discretion

- Admin dashboard styling and layout
- Email template design
- Form validation rules
- File upload limits and formats

## Deferred Ideas

None — discussion stayed within phase scope
