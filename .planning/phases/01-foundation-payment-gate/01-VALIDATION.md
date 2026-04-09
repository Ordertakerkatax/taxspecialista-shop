---
phase: 1
slug: foundation-payment-gate
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-09
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (recommended for Next.js + TypeScript) |
| **Config file** | None — Wave 0 must create `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 0 | PAY-01 | — | N/A | setup | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | PAY-01 | T-1-01 | UUIDv4 session tokens prevent enumeration | unit | `npx vitest run src/__tests__/payment-submit.test.ts -t "gcash"` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 1 | PAY-02 | T-1-01 | UUIDv4 session tokens prevent enumeration | unit | `npx vitest run src/__tests__/payment-submit.test.ts -t "bank"` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 1 | PAY-01 | T-1-03 | Clerk middleware blocks non-admin | unit | `npx vitest run src/__tests__/admin-approve.test.ts` | ❌ W0 | ⬜ pending |
| 1-03-02 | 03 | 1 | PAY-01/02 | T-1-02 | Rejection requires reason | unit | `npx vitest run src/__tests__/admin-reject.test.ts` | ❌ W0 | ⬜ pending |
| 1-04-01 | 04 | 2 | PAY-01 | T-1-01 | Expired session returns read-only | unit | `npx vitest run src/__tests__/session-validate.test.ts -t "expired"` | ❌ W0 | ⬜ pending |
| 1-04-02 | 04 | 2 | PAY-01 | T-1-01 | No valid session redirects to payment-required | unit | `npx vitest run src/__tests__/session-validate.test.ts -t "invalid"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — framework configuration
- [ ] `src/__tests__/payment-submit.test.ts` — payment submission logic stubs
- [ ] `src/__tests__/admin-approve.test.ts` — approval flow stubs
- [ ] `src/__tests__/admin-reject.test.ts` — rejection flow stubs
- [ ] `src/__tests__/session-validate.test.ts` — session token validation stubs
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| GCash QR code displays correctly | PAY-01 | Visual verification of QR image | Navigate to payment page, verify QR renders and is scannable |
| Email delivery to user | PAY-01/02 | Requires email service integration | Submit payment, approve, check inbox for notification |
| Admin email notification on new submission | PAY-01/02 | Requires email service integration | Submit payment, check admin inbox |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
