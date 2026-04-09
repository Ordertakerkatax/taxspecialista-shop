---
status: partial
phase: 01-foundation-payment-gate
source: [01-VERIFICATION.md]
started: 2026-04-09T06:30:00Z
updated: 2026-04-09T06:30:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. End-to-end GCash payment flow
expected: User selects GCash tier, enters reference number, uploads screenshot, submits — DB row created, confirmation email sent
result: [pending]

### 2. End-to-end bank transfer payment flow
expected: User selects bank transfer, enters reference number, submits — DB row created, confirmation email sent
result: [pending]

### 3. Admin approve/reject with real Clerk auth
expected: Admin user sees pending payments, can approve (creates consultation session + sends email) or reject (with reason + sends email)
result: [pending]

### 4. Session state gating with real DB rows
expected: /consult/[sessionId] shows active chat for valid session, expired message for >24h session, invalid message for bad ID
result: [pending]

### 5. Operator placeholder content
expected: GCash number, bank account details, QR code image, and CPA name replaced with real values before launch
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
