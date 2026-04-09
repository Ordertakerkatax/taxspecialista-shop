---
phase: "02"
plan: "01"
subsystem: chat-backend
tags: [ai, streaming, chat, schema, session-validation, system-prompt]
dependency_graph:
  requires:
    - 01-03 (consultationSessions table, validateSession, PRICING_TIERS)
  provides:
    - chatMessages table (for Phase 2 Plan 02 chat UI)
    - /api/chat POST endpoint (streaming, session-gated)
    - buildSystemPrompt() function (LOA legal knowledge base)
  affects:
    - src/db/schema.ts
    - src/app/api/chat/route.ts
tech_stack:
  added:
    - ai@6.x (Vercel AI SDK — streamText, toTextStreamResponse)
    - "@ai-sdk/anthropic" (Claude provider adapter)
  patterns:
    - TDD (RED-GREEN cycle for route and system prompt tests)
    - Next.js App Router route handler for streaming
    - Drizzle ORM insert for message persistence
key_files:
  created:
    - src/lib/ai/system-prompt.ts
    - src/lib/ai/chat-config.ts
    - src/app/api/chat/route.ts
    - src/__tests__/chat-api.test.ts
  modified:
    - src/db/schema.ts
    - package.json (added ai, @ai-sdk/anthropic)
decisions:
  - "Use toTextStreamResponse() — Vercel AI SDK v6 removed toDataStreamResponse()"
  - "CHAT_MODEL set to claude-sonnet-4-5-20241022 per CLAUDE.md stack recommendation"
  - "Message limits: 30 (basic) / 100 (comprehensive) implement D-11 tier differentiation"
  - "onFinish callback persists assistant response after stream completes"
metrics:
  duration: "3 minutes"
  completed_date: "2026-04-09"
  tasks_completed: 2
  files_changed: 6
---

# Phase 02 Plan 01: Chat Backend — Schema, System Prompt, and API Route Summary

**One-liner:** Streaming /api/chat route with session-gated LOA legal advisory system prompt, chatMessages DB table, and Vercel AI SDK v6 integration.

## What Was Built

### Task 1: chatMessages table added to schema.ts
- `messageRoleEnum` pgEnum with `["user", "assistant"]` values
- `chatMessages` table with `id`, `sessionId` (FK to consultationSessions), `role`, `content`, `createdAt`
- Exported `ChatMessage` and `NewChatMessage` TypeScript types
- Schema push attempted (non-blocking — no DATABASE_URL in dev environment)

### Task 2: LOA system prompt, chat config, and streaming API route
- `buildSystemPrompt(tier)` returns full LOA-stage legal advisory prompt with:
  - Guided intake (6 sequential questions: document type, date, tax type/period, amount, prior actions, concerns)
  - Stage identification flow with taxpayer confirmation
  - Full LOA legal knowledge: NIRC Sections 6(A), 228, 229; RMO 44-2010; RMO 19-2007; RR 12-99
  - LOA validity checklist (6 items: signatory authority, scope, one-LOA rule, 120-day validity, named officer, proper service)
  - Common defense grounds and key deadlines
  - Footnote citation format `[1]`, `[2]`, `[3]` with references section
  - Disclaimer in first message: "does not constitute formal legal or tax advice"
  - Tier differentiation: Basic = concise guidance; Comprehensive = in-depth multi-strategy analysis
- `chat-config.ts` exports Anthropic provider, CHAT_MODEL constant, and message limits
- `/api/chat` POST route:
  - Returns 401 when sessionToken missing or not a string
  - Returns 403 for expired sessions (reason: "expired")
  - Returns 403 for not-found sessions (reason: "not_found")
  - Returns 429 when message limit reached for tier
  - Saves user message to chatMessages before streaming
  - Saves assistant response in onFinish callback after stream completes
  - Streams Claude response via `streamText` + `toTextStreamResponse()`

### Tests (9 passing)
- Session validation: 401 (no token), 403 (expired), 403 (not found)
- System prompt: contains NIRC Section 228, RMO 44-2010, footnote format [1], disclaimer text
- Tier differentiation: COMPREHENSIVE and BASIC text in respective prompt branches

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] API method toDataStreamResponse() does not exist in AI SDK v6**
- **Found during:** Task 2 GREEN phase — npm run build TypeScript check
- **Issue:** Plan specified `result.toDataStreamResponse()` but Vercel AI SDK v6 removed this method; only `toTextStreamResponse()` exists in v6
- **Fix:** Changed route.ts to use `result.toTextStreamResponse()` — functionally equivalent for streaming text responses
- **Files modified:** src/app/api/chat/route.ts
- **Commit:** c286c57c

## Threat Mitigations Applied

All T-02-xx threats from plan threat model addressed:
- T-02-01: sessionToken validated via validateSession() — 401/403 on failure
- T-02-02: Only latest user message persisted; system prompt is server-side only
- T-02-03: All messages persisted with timestamps (insert-only)
- T-02-04: ANTHROPIC_API_KEY in env var, never sent to client
- T-02-06: Message count limit enforced (30 basic / 100 comprehensive) — returns 429

## Environment Variable Required

`ANTHROPIC_API_KEY` must be set in `.env.local` for the `/api/chat` route to function at runtime. Not present in the development environment — must be added before testing the live chat.

## Known Stubs

None — all data flows are wired. The API route reads real session data from DB and streams real Claude responses.

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/db/schema.ts | FOUND |
| src/lib/ai/system-prompt.ts | FOUND |
| src/lib/ai/chat-config.ts | FOUND |
| src/app/api/chat/route.ts | FOUND |
| src/__tests__/chat-api.test.ts | FOUND |
| Commit c55ef305 (schema) | FOUND |
| Commit abd305fb (tests RED) | FOUND |
| Commit c286c57c (implementation GREEN) | FOUND |
