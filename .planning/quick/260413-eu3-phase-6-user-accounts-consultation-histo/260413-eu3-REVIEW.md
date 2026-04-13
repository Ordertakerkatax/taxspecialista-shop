---
phase: 260413-eu3
reviewed: 2026-04-13T00:00:00Z
depth: quick
files_reviewed: 5
files_reviewed_list:
  - src/app/account/page.tsx
  - src/app/account/history/page.tsx
  - src/app/account/history/[sessionId]/page.tsx
  - src/app/api/account/transcript/route.ts
  - src/lib/account.ts
findings:
  critical: 0
  warning: 2
  info: 1
  total: 3
status: issues_found
---

# Phase 260413-eu3: Code Review Report

**Reviewed:** 2026-04-13T00:00:00Z
**Depth:** quick
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Reviewed four account/history pages and their supporting account library. No secrets, dangerous functions, debug artifacts, or empty catch blocks were found. Two warnings were identified: an unchecked array access on `emailAddresses[0]` that crashes if a Clerk user has no email address, and a missing `sessionToken` field in the `getUserSessions` query (the history list page references it indirectly; the detail page avoids this by doing its own full `select()`). One info item covers the `getUserSessions` ordering direction inconsistency — sessions are ordered ascending by `createdAt`, which surfaces oldest consultations first rather than the expected most-recent-first default for a history view.

## Warnings

### WR-01: Unchecked `emailAddresses[0]` access crashes if user has no email

**File:** `src/app/account/history/page.tsx:16`
**Issue:** `user.emailAddresses[0].emailAddress` is accessed without a guard. Clerk users authenticated via OAuth providers that do not expose an email address (or edge cases during account creation) can have an empty `emailAddresses` array, causing a runtime TypeError that crashes the Server Component and returns a 500 to the user.
**Fix:**
```typescript
const primaryEmail = user.emailAddresses[0]?.emailAddress;
if (primaryEmail) {
  await linkSessionsByEmail(user.id, primaryEmail);
}
```
Or use Clerk's `primaryEmailAddress` property which is already nullable-safe:
```typescript
const primaryEmail = user.primaryEmailAddress?.emailAddress;
if (primaryEmail) {
  await linkSessionsByEmail(user.id, primaryEmail);
}
```

### WR-02: `getUserSessions` orders ascending — history page shows oldest first

**File:** `src/lib/account.ts:41`
**Issue:** `getUserSessions` orders results by `createdAt` ascending (default Drizzle order when no `desc()` wrapper is used). A history list conventionally shows newest consultations first. This is a functional bug — a user with many consultations must scroll to the bottom to find their most recent one.
**Fix:**
```typescript
import { eq, desc } from "drizzle-orm";

// Change the orderBy clause:
.orderBy(desc(consultationSessions.createdAt))
```

## Info

### IN-01: `session.tier` cast to string in transcript PDF is fragile

**File:** `src/app/api/account/transcript/route.ts:87`
**Issue:** The tier label is rendered via `tier === "comprehensive" ? "Comprehensive" : "Basic"`, which silently falls through to "Basic" for any unexpected tier value (e.g. a future `"premium"` tier). This is a minor defensiveness concern but could confuse users if tier values are expanded.
**Fix:** Add an explicit exhaustive mapping or default label:
```typescript
const tierLabel: Record<string, string> = {
  comprehensive: "Comprehensive",
  basic: "Basic",
};
doc.text(`Tier: ${tierLabel[tier] ?? tier}`);
```
This ensures unknown future tiers display their raw value rather than silently mislabeling as "Basic".

---

_Reviewed: 2026-04-13T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: quick_
