# Quick Task 260413-eu3: Phase 6 User Accounts & History - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Task Boundary

Build optional user account system with consultation history and session summary export. Users who paid can create a Clerk account to view past sessions, download AI-generated summaries, and optionally export full chat transcripts.

</domain>

<decisions>
## Implementation Decisions

### Account Linking
- **Auto-match by email**: When a user signs up via Clerk, auto-link all consultation sessions that share the same email address
- No verification code or manual claiming needed — Clerk verifies email ownership during signup
- Simple query: `SELECT * FROM consultation_sessions WHERE email = :clerkEmail`

### Summary Content
- **Both options**: AI-generated digest (default) + full transcript export
- AI digest: BIR stage identified, key deadlines, risks flagged, documents generated, recommended next steps (1-2 pages)
- Full transcript: complete chat history as downloadable PDF (optional, separate button)
- AI digest is generated at session end (or on-demand for existing sessions)

### History Access
- **Clerk login required**: /account page is protected by Clerk middleware
- Users must create an account to see consultation history
- No magic link fallback — keep it simple

</decisions>

<specifics>
## Specific Ideas

- Existing Clerk auth is already installed and configured in the project
- consultation_sessions table already has email field for matching
- chatMessages table has the full conversation history
- PDF generation infrastructure already exists (PDFKit in src/lib/documents/pdf-generator.ts)
- Summary generation may already be partially built (check src/lib/documents/summary-generator.ts)

</specifics>
