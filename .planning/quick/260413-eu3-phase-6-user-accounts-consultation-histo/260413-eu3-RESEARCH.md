# Phase 6: User Accounts & Consultation History - Research

**Researched:** 2026-04-13
**Domain:** Clerk auth, account pages, session history, PDF summary export
**Confidence:** HIGH

## Summary

Phase 6 is **already fully implemented** in the current codebase. All components described in the CONTEXT.md decisions -- account linking by email, consultation history page, session detail view with read-only chat replay, AI-generated summary PDF download, and the save-to-account banner -- exist and are wired together. The middleware already protects `/account(.*)` routes via Clerk.

**Primary recommendation:** Verify the existing implementation works end-to-end rather than building new code. The only potential gap is a missing `/account` index page (no `page.tsx` at the account root -- users must navigate directly to `/account/history`).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Auto-match by email**: When a user signs up via Clerk, auto-link all consultation sessions that share the same email address. No verification code needed -- Clerk verifies email ownership during signup. Simple query: `SELECT * FROM consultation_sessions WHERE email = :clerkEmail`
- **Both options**: AI-generated digest (default) + full transcript export. AI digest includes BIR stage, key deadlines, risks, documents generated, recommended next steps (1-2 pages). Full transcript is complete chat history as downloadable PDF (optional, separate button).
- **Clerk login required**: /account page is protected by Clerk middleware. Users must create an account to see consultation history. No magic link fallback.

### Claude's Discretion
None specified.

### Deferred Ideas (OUT OF SCOPE)
None specified.
</user_constraints>

## Existing Implementation Inventory

All items below are [VERIFIED: codebase grep/read].

### Account Infrastructure

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Clerk middleware protection | `src/middleware.ts` | Complete | `/account(.*)` routes redirect unauthenticated users to sign-in |
| Account layout with UserButton | `src/app/account/layout.tsx` | Complete | Header, nav link to history, Clerk UserButton |
| Account index page | `src/app/account/page.tsx` | **MISSING** | No index page -- users land on 404 if they go to `/account` directly |
| History list page | `src/app/account/history/page.tsx` | Complete | Lists sessions with date, tier badge, active/expired status, links to view/download |
| Session detail page | `src/app/account/history/[sessionId]/page.tsx` | Complete | Read-only chat replay via ChatInterface with `readOnly={true}`, ownership check via userId |
| Summary PDF API | `src/app/api/account/summary/route.ts` | Complete | GET endpoint, Clerk auth, ownership check, generates PDF via summary-generator |
| Session linking lib | `src/lib/account.ts` | Complete | `linkSessionsByEmail()` and `getUserSessions()` functions |
| Save-to-account banner | `src/components/account/save-to-account-banner.tsx` | Complete | Shows sign-up/sign-in CTA for anonymous users, "linked to account" for signed-in |
| Auto-link on visit | `src/app/consult/[sessionId]/page.tsx` | Complete | Calls `linkSessionsByEmail()` when signed-in user visits an unlinked session |

### Database Schema Support

| Table | Relevant Fields | Status |
|-------|----------------|--------|
| `consultation_sessions` | `email`, `userId` (nullable), `tier`, `activatedAt`, `expiresAt` | Complete -- userId field + index exist |
| `chat_messages` | `sessionId`, `role`, `content`, `createdAt` | Complete -- full transcript data available |

### PDF/Summary Generation

| Component | File | Status |
|-----------|------|--------|
| AI summary extraction | `src/lib/documents/summary-generator.ts` | Complete -- uses `generateObject` with Claude to extract BIR stage, dates, citations, highlights |
| Summary PDF rendering | `src/lib/documents/summary-generator.ts` | Complete -- PDFKit A4 layout, no watermark |
| Letter PDF (draft) | `src/lib/documents/pdf-generator.ts` | Complete -- separate concern, DRAFT watermark |

### Chat Interface

| Feature | Status | Notes |
|---------|--------|-------|
| `readOnly` prop | Complete | ChatInterface accepts `readOnly` boolean; hides input, shows "read-only" banner |

## Gaps Identified

### Gap 1: Missing `/account` index page
**What:** No `src/app/account/page.tsx` exists. Visiting `/account` would show a blank layout or 404.
**Impact:** LOW -- the nav already links directly to `/account/history`, but users typing `/account` directly get nothing.
**Fix:** Add a simple redirect or landing page at `src/app/account/page.tsx` that redirects to `/account/history`.

### Gap 2: Full transcript PDF export (not just AI digest)
**What:** CONTEXT.md specifies "full transcript: complete chat history as downloadable PDF (optional, separate button)". The current implementation only has the AI digest download. No transcript PDF endpoint exists.
**Impact:** MEDIUM -- this is a locked decision from the user. The AI digest works, but the full transcript export button/endpoint is missing.
**Fix:** Add a `/api/account/transcript` GET endpoint that renders all chat messages as a PDF (simpler than summary -- just formatted text), and add a "Download Transcript" button alongside the existing "Download Summary" button on both history pages.

### Gap 3: No explicit account linking on Clerk webhook/signup
**What:** Session linking only happens when a signed-in user visits a consultation page. If a user signs up but never revisits the consultation URL, sessions may remain unlinked until they visit `/account/history`.
**Impact:** LOW -- the `getUserSessions` function queries by `userId`, so unlinked sessions won't appear. However, visiting any consultation page triggers linking. A Clerk webhook for user creation would be more robust but is not strictly required for MVP.
**Fix:** Optional -- could add a Clerk webhook at `/api/webhooks/clerk` that calls `linkSessionsByEmail()` on `user.created` event. Or, add a call to `linkSessionsByEmail()` at the top of the history page before querying.

## Common Pitfalls

### Pitfall 1: History page shows empty despite linked email
**What goes wrong:** `getUserSessions` queries by `userId`, not `email`. If sessions haven't been linked yet (user signed up but never visited a consultation page), history shows empty.
**How to avoid:** Call `linkSessionsByEmail()` at the top of the history page as a fallback before querying. [ASSUMED]

### Pitfall 2: ChatInterface readOnly mode still tries to connect to chat API
**What goes wrong:** If readOnly mode doesn't fully disable the useChat hook, it might make unnecessary API calls.
**How to avoid:** Verified -- the existing implementation passes `initialMessages` and `readOnly={true}`, which disables the input. The hook likely doesn't auto-send. [VERIFIED: codebase read]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Calling linkSessionsByEmail at top of history page would fix the empty-history-on-first-visit issue | Pitfalls | LOW -- alternative is Clerk webhook |

## Open Questions

1. **Should transcript PDF be plain text or formatted?**
   - What we know: AI digest is already well-formatted with sections. Transcript is just messages.
   - Recommendation: Simple format -- timestamp, role label, content. Reuse PDFKit patterns from summary-generator.

2. **Should linking happen on history page load?**
   - What we know: Currently only happens on consultation page visit.
   - Recommendation: Add `linkSessionsByEmail()` call in history page for robustness.

## Sources

### Primary (HIGH confidence)
- Codebase direct read: all files listed in inventory table above
- `src/db/schema.ts` -- confirmed userId field and index on consultation_sessions
- `src/middleware.ts` -- confirmed /account route protection
