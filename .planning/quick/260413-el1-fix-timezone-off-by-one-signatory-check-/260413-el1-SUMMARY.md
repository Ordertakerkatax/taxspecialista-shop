---
phase: quick
plan: 260413-el1
subsystem: legal-utilities
tags: [refactor, bugfix, timezone, date-helpers, waiver, tdd]
dependency_graph:
  requires: []
  provides: [src/lib/legal/date-helpers.ts]
  affects: [src/lib/legal/calculate-deadlines.ts, src/lib/legal/calculate-prescription.ts, src/lib/legal/check-waiver-validity.ts]
tech_stack:
  added: []
  patterns: [shared-helper-module, utc-date-handling, bidirectional-substring-check]
key_files:
  created:
    - src/lib/legal/date-helpers.ts
    - src/__tests__/date-helpers.test.ts
  modified:
    - src/lib/legal/calculate-deadlines.ts
    - src/lib/legal/calculate-prescription.ts
    - src/lib/legal/check-waiver-validity.ts
    - src/lib/legal/index.ts
    - src/__tests__/legal-waiver.test.ts
decisions:
  - "Signatory check uses bidirectional includes (input.includes(role) OR role.includes(input)) to handle prefixed titles like Acting/OIC without false positives from unrelated short strings"
metrics:
  duration: 8min
  completed: 2026-04-13
  tasks: 3
  files: 7
---

# Quick Task 260413-el1: Fix Timezone Off-by-One, Signatory Check, Date Helper Dedup

**One-liner:** Extracted shared UTC-correct date helpers into `date-helpers.ts`, fixing timezone off-by-one in `daysUntil`/`todayIso` (WR-01) and correcting bidirectional signatory substring check to accept prefixed titles (WR-02).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create shared date-helpers module with UTC-correct implementations | d75c2414 | src/lib/legal/date-helpers.ts, src/__tests__/date-helpers.test.ts |
| 2 | Refactor modules to use shared helpers and fix signatory check | ff1e8398 | calculate-deadlines.ts, calculate-prescription.ts, check-waiver-validity.ts, index.ts |
| 3 | Add waiver signatory edge-case tests and fix bidirectional check | 490bcb31 | src/__tests__/legal-waiver.test.ts, check-waiver-validity.ts |

## Verification Results

All plan verification checks passed:

1. `npx vitest run src/__tests__/date-helpers.test.ts` — 14 tests pass, including UTC boundary edge cases
2. `npx vitest run src/__tests__/legal-deadlines.test.ts` — 18 tests pass with shared imports
3. `npx vitest run src/__tests__/legal-prescription.test.ts` — 8 tests pass with shared imports
4. `npx vitest run src/__tests__/legal-waiver.test.ts` — 18 tests pass including Acting/OIC variants
5. Each date helper function defined exactly once in date-helpers.ts only
6. `getUTCFullYear`, `getUTCMonth`, `getUTCDate` confirmed in date-helpers.ts

**Total: 53 tests passing across 4 suites**

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Signatory check needed bidirectional includes, not unidirectional**

- **Found during:** Task 3 (when edge-case tests revealed failures)
- **Issue:** Plan's Task 2 specification to change `signatoryNormalized.includes(role)` to `role.includes(signatoryNormalized)` alone caused "Acting Regional Director" and "OIC - Regional Director" to be rejected. `role.includes(signatoryNormalized)` means the authorized role ("regional director") must contain the full input ("acting regional director") — which fails because the input is longer.
- **Fix:** Applied bidirectional check as the plan itself specified as fallback: `signatoryNormalized === role || signatoryNormalized.includes(role) || role.includes(signatoryNormalized)`. This correctly handles: exact matches, prefixed/suffixed titles where input contains the authorized role, and partial matches where the role contains the input.
- **Files modified:** src/lib/legal/check-waiver-validity.ts
- **Commit:** 490bcb31

## Known Stubs

None — all functions are fully implemented with no placeholders or hardcoded returns.

## Threat Flags

No new trust boundaries introduced. All changes are pure internal function refactoring with no new I/O, network access, or external input paths.

## Self-Check: PASSED

- src/lib/legal/date-helpers.ts: FOUND
- src/__tests__/date-helpers.test.ts: FOUND
- Commit d75c2414: FOUND
- Commit ff1e8398: FOUND
- Commit 490bcb31: FOUND
