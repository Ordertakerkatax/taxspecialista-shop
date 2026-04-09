# Phase 2: Chat Core & Advisory - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

A taxpayer with a valid paid session can describe their BIR situation through a conversational AI chat and receive legally-grounded, stage-specific guidance. The AI conducts a guided intake to extract case facts, identifies the BIR stage, and provides actionable advice with NIRC/RMO/RR citations. Scope is LOA-stage-only for this phase; other stages get basic guidance with a flag. No document generation (Phase 4), no escalation queue (Phase 5), no user accounts (Phase 6).

</domain>

<decisions>
## Implementation Decisions

### Conversation Flow
- **D-01:** Guided intake first — AI asks structured questions one-by-one (document type, dates, amounts, prior actions) before providing advisory guidance. Ensures a complete picture before responding.
- **D-02:** Stage identification is AI-inferred — after intake questions, the AI determines which BIR stage the taxpayer is in (LOA, PAN, FAN, FDDA, SDT, collection) from the taxpayer's descriptions. Shows the identified stage for confirmation before proceeding.
- **D-03:** For stages beyond LOA (PAN, FAN, FDDA, SDT, collection): provide basic general-direction guidance (e.g., "you should file a protest within 30 days") but flag it as limited coverage and recommend professional CPA consultation. Do not refuse to help entirely.
- **D-04:** One payment = one continuous chat thread (carried from Phase 1 D-08). 24-hour expiry after admin approval (Phase 1 D-07). After expiry, session becomes read-only (Phase 1 D-10).

### Legal Citation Delivery
- **D-05:** Footnote-style references — advice text has numbered superscripts, citations listed at the bottom of each AI message. Cleaner reading flow with references accessible on demand.
- **D-06:** Citation depth is section number + 1-line summary (e.g., "NIRC Section 228 — Assessment Notice Requirements"). Not full text excerpts.

### Knowledge Base Approach
- **D-07:** System prompt with curated knowledge for MVP — hand-craft a comprehensive system prompt containing key NIRC sections, RMOs, and RRs relevant to LOA stage. No RAG/pgvector infrastructure for Phase 2.
- **D-08:** Claude compiles the LOA-relevant legal framework from research — the user (CPA) will not provide pre-curated content. The research agent should compile accurate NIRC sections, RMOs, and RRs for LOA proceedings.

### Chat UI & Session UX
- **D-09:** Messaging app style — WhatsApp/iMessage-like bubbles with user messages on right, AI responses on left. Streaming response with typing indicator. Familiar to Philippine users.
- **D-10:** Advisory disclaimer appears in the AI's first message as part of the greeting before intake begins. No persistent banner.

### Tier Differentiation
- **D-11:** Claude's Discretion — determine the best approach to differentiate Basic (PHP 1,000) vs Comprehensive (PHP 2,500) tiers in the chat experience. Options include message limits, depth of analysis, or model selection. Research should inform this decision.

### Claude's Discretion
- Tier differentiation approach (D-11)
- Chat message persistence model (in DB vs in-memory)
- Exact intake question sequence and flow
- Streaming UX details (typing indicator style, message animation)
- Error handling for AI failures mid-conversation

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Requirements
- `.planning/REQUIREMENTS.md` — INTK-01 through INTK-03 (intake), ADV-01 through ADV-04 (advisory)
- `.planning/PROJECT.md` — Constraints on advisory disclaimers, LOA-only scope, Claude model selection

### Technology Stack
- `CLAUDE.md` §Technology Stack — Vercel AI SDK 4.x (`useChat` hook, `streamText`), `@ai-sdk/anthropic`, Claude claude-sonnet-4-5 as primary model, Claude claude-opus-4-5 reserved for complex cases

### Phase 1 Foundation
- `.planning/phases/01-foundation-payment-gate/01-CONTEXT.md` — Payment flow decisions, session gating model, tier pricing
- `src/db/schema.ts` — consultationSessions table (session token, tier, expiry)
- `src/lib/session.ts` — validateSession function (active/expired/invalid states)
- `src/app/consult/[sessionId]/page.tsx` — Session gate page (Phase 2 builds the chat inside the "active" state)

### Legal Knowledge (for research agent to compile)
- Philippine NIRC (National Internal Revenue Code) — especially Sections 6, 228, 229 on LOA and assessment
- BIR RMO 44-2010 (LOA guidelines)
- BIR RMO 19-2007 (consolidated audit procedures)
- Relevant Revenue Regulations on LOA scope and authority

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/session.ts` — validateSession() already handles active/expired/invalid. Chat page builds on the "active" branch.
- `src/components/ui/` — shadcn Card, Badge, Button, Dialog components available
- `src/lib/constants.ts` — PRICING_TIERS with tier names and amounts
- `src/lib/email.ts` — Resend email helpers (may be needed for session-related notifications)

### Established Patterns
- Server components for data fetching, client components for interactivity (Phase 1 pattern)
- Tailwind CSS 4 + shadcn/ui for styling
- Server Actions for mutations (e.g., submitPaymentProof, approvePayment)
- Drizzle ORM for database access

### Integration Points
- `/consult/[sessionId]/page.tsx` — Chat UI renders inside the "active session" branch of this existing page
- `consultationSessions` table — needs new columns or related table for chat message storage
- Vercel AI SDK `useChat` hook — primary integration point for streaming chat
- `@ai-sdk/anthropic` — Claude provider for `streamText` API route

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for chat UI and AI integration patterns. The key constraint is that the system prompt must contain curated LOA-stage legal knowledge compiled through research, not relying on Claude's training knowledge alone.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-chat-core-advisory*
*Context gathered: 2026-04-09*
