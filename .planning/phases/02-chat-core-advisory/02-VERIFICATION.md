---
phase: 02-chat-core-advisory
verified: 2026-04-09T14:26:45Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Active session shows interactive chat with streaming AI responses"
    expected: "Chat interface loads, AI sends first message with disclaimer, guided intake proceeds, streaming response visible with bouncing dots typing indicator"
    why_human: "Requires ANTHROPIC_API_KEY env var and live DATABASE_URL; streaming behavior cannot be verified without running the dev server"
  - test: "AI conducts guided intake and identifies BIR stage"
    expected: "AI asks document type, date, tax type, amount, prior actions, concerns — one question at a time — then states the identified BIR stage and asks for confirmation"
    why_human: "LLM behavior verification; system prompt instructs this flow but adherence requires live interaction"
  - test: "Advisory response contains footnote citations ([1], [2]) linking to NIRC/RMO sources"
    expected: "After stage identification, AI response text contains [1], [2] superscripts and a References: section at the bottom of the message bubble, rendered by CitationFooter"
    why_human: "Citation rendering depends on LLM output format matching the system prompt instructions; requires live interaction to confirm"
  - test: "Disclaimer appears in AI's first message"
    expected: "First message contains 'does not constitute formal legal or tax advice' before the first intake question"
    why_human: "LLM compliance with system prompt instruction; must be observed in live interaction"
  - test: "Messages persist and reload on page refresh"
    expected: "After sending messages, refresh the /consult/[sessionId] page and see the same messages loaded from the database"
    why_human: "Requires live DATABASE_URL and a valid session to test persistence round-trip"
  - test: "Expired session shows read-only chat history with amber badge"
    expected: "Read Only badge visible in header; amber banner shown at bottom instead of input; chat bubbles visible but no text input field"
    why_human: "Requires a valid expired session in the database to navigate to"
  - test: "Invalid session token shows payment-required screen"
    expected: "Consultation Access Required card with 'Start a New Consultation' link; no chat interface visible"
    why_human: "Requires verifying the not_found branch in a running app"
---

# Phase 2: Chat Core & Advisory Verification Report

**Phase Goal:** A taxpayer with a valid session can describe their BIR situation and receive legally-grounded, stage-specific guidance
**Verified:** 2026-04-09T14:26:45Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can converse with the AI and have their case details (document type, dates, tax type/amount, prior actions) extracted through dialogue | VERIFIED | system-prompt.ts lines 23-29: 6-question guided intake with all required fields |
| 2 | System correctly identifies which BIR stage the taxpayer is in (LOA, PAN, FAN, FDDA, SDT, collection) | VERIFIED | system-prompt.ts lines 31-35: Phase 2 of conversation flow explicitly instructs stage identification with confirmation |
| 3 | System checks and communicates LOA validity issues (authority, scope, dates, proper issuance) | VERIFIED | system-prompt.ts lines 100-106: 6-item LOA validity checklist (signatory authority, scope, one-LOA rule, 120-day, named officer, proper service) |
| 4 | Every advisory response cites specific NIRC sections, RMOs, or RRs applicable to the situation | VERIFIED | system-prompt.ts lines 57-65: footnote citation format defined; lines 67-122: LOA knowledge base includes NIRC 6(A), 228, 229, RMO 44-2010, RMO 19-2007, RR 12-99 |
| 5 | Response includes a disclaimer that output is not formal legal or tax advice before final guidance is shown | VERIFIED | system-prompt.ts lines 11-17: first message template contains "does not constitute formal legal or tax advice" |

**Score:** 5/5 truths verified (programmatic checks pass; live behavioral checks pending human verification)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/db/schema.ts` | chatMessages table definition | VERIFIED | Lines 32-43: messageRoleEnum, chatMessages table with sessionId FK, role, content, createdAt; ChatMessage and NewChatMessage types exported |
| `src/lib/ai/system-prompt.ts` | LOA advisory system prompt with legal knowledge | VERIFIED | 132 lines; contains NIRC Section 228, RMO 44-2010, RMO 19-2007, RR 12-99, disclaimer, citation format, 6 intake questions |
| `src/lib/ai/chat-config.ts` | Anthropic provider config | VERIFIED | createAnthropic with ANTHROPIC_API_KEY, CHAT_MODEL constant, message limits (30 basic / 100 comprehensive) |
| `src/app/api/chat/route.ts` | Streaming chat API endpoint | VERIFIED | POST handler with session validation (401/403), message persistence (user before stream, assistant in onFinish), streamText with buildSystemPrompt, toTextStreamResponse() |
| `src/components/chat/chat-interface.tsx` | Main chat container with useChat integration | VERIFIED | useChat from @ai-sdk/react with TextStreamChatTransport pointing to /api/chat; initialMessages in UIMessage v6 format; typing indicator; read-only mode |
| `src/components/chat/message-bubble.tsx` | WhatsApp-style message bubble | VERIFIED | User right teal (bg-teal-600 rounded-br-sm), AI left white (rounded-bl-sm); content split on References: separator; CitationFooter rendered for assistant |
| `src/components/chat/citation-footer.tsx` | Footnote citation renderer | VERIFIED | Regex /\[(\d+)\]\s*(.+)/g parses citation text; teal-600 numbered labels; returns null if no citations |
| `src/components/chat/chat-input.tsx` | Text input with send button | VERIFIED | Textarea with Enter-to-send (Shift+Enter for newline); SendHorizontal icon; disabled state for expired sessions |
| `src/app/consult/[sessionId]/page.tsx` | Consultation page with live chat | VERIFIED | Active: ChatInterface readOnly=false; Expired: ChatInterface readOnly=true; Invalid: payment-required card unchanged |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| src/app/api/chat/route.ts | src/lib/ai/system-prompt.ts | import buildSystemPrompt | WIRED | Line 3: `import { buildSystemPrompt } from "@/lib/ai/system-prompt"`, called at line 69 |
| src/app/api/chat/route.ts | src/db/schema.ts | chatMessages persistence | WIRED | Line 6: `import { chatMessages }`, used for count check (line 41) and inserts (lines 61, 79) |
| src/app/api/chat/route.ts | src/lib/session.ts | validateSession | WIRED | Line 4: `import { validateSession }`, called at line 20 |
| src/components/chat/chat-interface.tsx | /api/chat | TextStreamChatTransport | WIRED | Lines 47-49: `new TextStreamChatTransport({ api: "/api/chat", body: { sessionToken } })` |
| src/app/consult/[sessionId]/page.tsx | src/components/chat/chat-interface.tsx | import ChatInterface | WIRED | Line 13: `import { ChatInterface }`, rendered at lines 60-71 (active) and 85-96 (expired) |
| src/components/chat/chat-interface.tsx | src/components/chat/message-bubble.tsx | renders messages | WIRED | Line 6: `import { MessageBubble }`, rendered in messages.map() at line 103 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| chat-interface.tsx | messages | useChat hook from @ai-sdk/react | Yes — TextStreamChatTransport fetches from /api/chat which calls Claude API | FLOWING |
| chat-interface.tsx | initialMessages | DB query in page.tsx (chatMessages table) | Yes — server component queries real DB scoped to sessionId | FLOWING |
| route.ts | session | validateSession(sessionToken) | Yes — queries consultationSessions table by sessionToken | FLOWING |
| route.ts | modelMessages | convertToModelMessages(messages) | Yes — converts UIMessage[] to ModelMessage[] for Claude API | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Build passes without errors | npm run build | All 8 routes compiled, no TypeScript errors | PASS |
| 9 unit tests pass (session validation + system prompt content) | npx vitest run src/__tests__/chat-api.test.ts | 9/9 passing in 275ms | PASS |
| /api/chat route registered as dynamic | Build output | `ƒ /api/chat` shown as server-rendered on demand | PASS |
| /consult/[sessionId] registered as dynamic | Build output | `ƒ /consult/[sessionId]` shown as server-rendered on demand | PASS |
| Live streaming chat with AI responses | Requires dev server + ANTHROPIC_API_KEY | Cannot test without env vars | SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| INTK-01 | 02-01, 02-02 | AI conversationally extracts case details | SATISFIED | 6-question guided intake in system prompt; ChatInterface wires user messages to /api/chat |
| INTK-02 | 02-01, 02-02 | System identifies BIR stage | SATISFIED | Stage identification flow in system prompt lines 31-35 |
| INTK-03 | 02-01 | System checks LOA validity | SATISFIED | LOA validity checklist (6 items) in system prompt lines 100-106 |
| ADV-01 | 02-01, 02-02 | System cites NIRC sections, RMOs, RRs | SATISFIED | LOA knowledge base with NIRC 6(A), 228, 229; RMO 44-2010; RMO 19-2007; RR 12-99; citation format defined |
| ADV-02 | 02-02 | Step-by-step actionable items | SATISFIED | System prompt instructs numbered action steps per RESPONSE STYLE section; LOA stage handling instructs step-by-step |
| ADV-03 | 02-01, 02-02 | Advisory disclaimers displayed | SATISFIED | Disclaimer in first message template (system-prompt.ts lines 11-17) |
| ADV-04 | 02-02 | Maps facts to legal defenses | SATISFIED | Common LOA Defense Grounds section (lines 108-114) maps facts to challengeable grounds |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| chat-input.tsx | 37 | `placeholder=` | Info | Legitimate HTML placeholder attribute for input field — not a stub. Value is the UI hint text for the textarea. No impact. |

No blocker or warning anti-patterns found. The `placeholder` match is a false positive — it is the textarea placeholder text, not a stub implementation.

### Human Verification Required

All programmatic checks pass. The following must be confirmed by a human with live environment access (`ANTHROPIC_API_KEY` and `DATABASE_URL` configured):

#### 1. Live Chat Streaming Flow

**Test:** Start dev server (`npm run dev`). Navigate to an active consultation session URL (`/consult/[valid-session-token]`).
**Expected:** Chat interface loads with WhatsApp-style layout and tier badge at top. AI sends first message automatically. Disclaimer text ("does not constitute formal legal or tax advice") appears before intake questions begin.
**Why human:** Requires ANTHROPIC_API_KEY env var and live Claude API call; streaming behavior cannot be verified programmatically.

#### 2. Guided Intake and Stage Identification

**Test:** In the live chat, type "I received a Letter of Authority" and continue through intake questions (date, tax type, amount, prior actions, concerns).
**Expected:** AI asks one question at a time. After all answers, AI states: "Based on what you've described, you are at the LOA stage of BIR proceedings." and asks for confirmation. After confirmation, provides advisory with numbered steps.
**Why human:** LLM adherence to system prompt conversation flow must be observed in a live session.

#### 3. Footnote Citation Rendering

**Test:** Continue the live chat through the advisory phase.
**Expected:** Advisory response contains superscript markers like [1], [2] in the body text. A "References:" section appears at the bottom of the message bubble rendered as teal-numbered footnotes (CitationFooter component).
**Why human:** Citation rendering depends on LLM output matching the system prompt's citation format instruction. Requires live interaction to confirm.

#### 4. Message Persistence

**Test:** After sending 2-3 messages in an active session, refresh the page.
**Expected:** All sent and received messages reload from the database and appear in the chat history in the correct order.
**Why human:** Requires live DATABASE_URL with write access; server-side query needs a real session.

#### 5. Expired Session Read-Only Mode

**Test:** Navigate to a URL for an expired session token.
**Expected:** "Read Only" amber badge in header. Amber banner at bottom ("This session has expired. Your conversation history is read-only."). No text input area. Previous messages visible in bubbles.
**Why human:** Requires an expired session record in the database.

#### 6. Invalid Session Payment Screen

**Test:** Navigate to `/consult/invalid-token-xyz`.
**Expected:** "Consultation Access Required" card with AlertCircle icon and "Start a New Consultation" link. No chat interface.
**Why human:** Verifies the not_found branch renders correctly in a running app.

### Gaps Summary

No gaps found. All 5 success criteria are satisfied by substantive, wired, data-flowing implementations. The phase goal — "a taxpayer with a valid session can describe their BIR situation and receive legally-grounded, stage-specific guidance" — is architecturally complete.

The `human_needed` status reflects 6 behavioral items that require a live environment (ANTHROPIC_API_KEY + DATABASE_URL) to confirm end-to-end. These were explicitly planned as Task 3 (checkpoint:human-verify, gate: blocking) in Plan 02-02.

---

_Verified: 2026-04-09T14:26:45Z_
_Verifier: Claude (gsd-verifier)_
