---
phase: "02"
plan: "02"
subsystem: chat-frontend
tags: [chat-ui, streaming, useChat, ai-sdk-v6, consultation-page, whatsapp-style]
dependency_graph:
  requires:
    - 02-01 (chatMessages table, /api/chat POST route, toTextStreamResponse)
  provides:
    - ChatInterface component (streaming chat with useChat v6 hook)
    - MessageBubble component (WhatsApp-style with citation splitting)
    - CitationFooter component (footnote [1][2] citation renderer)
    - ChatInput component (textarea with Enter-to-send)
    - /consult/[sessionId] updated page (active: live chat, expired: read-only, invalid: payment screen)
  affects:
    - src/components/chat/ (new directory, 4 components)
    - src/app/consult/[sessionId]/page.tsx
    - src/app/api/chat/route.ts (bug fix for v6 UIMessage format)
tech_stack:
  added:
    - "@ai-sdk/react" (useChat hook — in AI SDK v6, hook is not in main 'ai' package)
    - TextStreamChatTransport (from 'ai' — required for toTextStreamResponse() routes)
  patterns:
    - AI SDK v6 useChat with TextStreamChatTransport (not DefaultChatTransport)
    - UIMessage.parts[] for text extraction (v6 dropped .content string)
    - convertToModelMessages() for UIMessage -> ModelMessage conversion in route
    - Managed input state (useState) — v6 useChat does not expose input/handleSubmit
    - status === "submitted" || "streaming" as isLoading equivalent
key_files:
  created:
    - src/components/chat/citation-footer.tsx
    - src/components/chat/message-bubble.tsx
    - src/components/chat/chat-input.tsx
    - src/components/chat/chat-interface.tsx
  modified:
    - src/app/consult/[sessionId]/page.tsx
    - src/app/api/chat/route.ts
decisions:
  - "Use TextStreamChatTransport (not DefaultChatTransport) because route returns toTextStreamResponse() — DefaultChatTransport expects UIMessageChunk JSON event stream"
  - "useChat from @ai-sdk/react v6 does not expose input/setInput/handleSubmit — manage input with useState, submit with sendMessage({ text })"
  - "Install @ai-sdk/react separately — ai v6 main package does not export useChat"
  - "Derive isLoading from status === 'submitted' || status === 'streaming'"
metrics:
  duration: "15 minutes"
  completed_date: "2026-04-09"
  tasks_completed: 2
  files_changed: 6
---

# Phase 02 Plan 02: Chat Frontend — UI Components and Consultation Page Summary

**One-liner:** WhatsApp-style chat UI with streaming via AI SDK v6 TextStreamChatTransport, footnote citations, and read-only expired session mode wired into the consultation page.

## What Was Built

### Task 1: Four chat UI components in src/components/chat/

**citation-footer.tsx**
- Parses citation text using regex `/\[(\d+)\]\s*(.+)/g`
- Renders each `[1]`, `[2]` citation as a compact `text-xs text-gray-500` footnote line
- Teal-colored citation number, trimmed citation text
- Returns null if no citations found (handles messages without references)

**message-bubble.tsx**
- WhatsApp/iMessage style: user messages right-aligned `bg-teal-600 text-white rounded-br-sm`, AI messages left-aligned `bg-white border rounded-bl-sm`
- Splits content on `---\n**References:**` regex to extract citation footer
- Inline formatting: bold `**text**` -> `<strong>`, citation markers `[1]` -> `<sup class="text-teal-600">`, numbered lists -> `<ol>`
- `isStreaming` prop shows pulsing cursor `|` at end of content
- CitationFooter only rendered for assistant messages (not user)

**chat-input.tsx**
- Textarea (not single-line) for multi-line messages
- `SendHorizontal` icon from `lucide-react` on send button
- Enter submits, Shift+Enter inserts newline
- Disabled when `isLoading` or `disabled` prop (expired sessions)
- Teal send button (`bg-teal-600 hover:bg-teal-700`)

**chat-interface.tsx**
- Uses `useChat` from `@ai-sdk/react` (separate package from `ai`)
- Configured with `TextStreamChatTransport` pointing to `/api/chat` with `body: { sessionToken }`
- Converts DB messages to v6 `UIMessage` format (with `parts[]`) for `initialMessages`
- Manages own `input` state with `useState` (v6 useChat does not expose input helpers)
- `isLoading` derived from `status === "submitted" || status === "streaming"`
- Text extracted from `message.parts.find(p => p.type === "text")?.text`
- Auto-scroll to bottom via `useRef` + `useEffect` on message changes
- Typing indicator: three bouncing dots shown when `isLoading && last message is user`
- Tier badge in header (Basic / Comprehensive), Read Only amber badge for expired sessions
- Amber banner at bottom for read-only mode instead of input

### Task 2: Consultation page updated

Replaced Phase 1 placeholder with live chat for all session states:

- **Active session:** Queries `chatMessages` ordered by `createdAt asc`, renders `<ChatInterface readOnly={false}>`
- **Expired session:** Queries same message history, renders `<ChatInterface readOnly={true}>`
- **Invalid/not-found:** Unchanged payment-required card with "Consultation Access Required"

Removed: "Chat functionality is coming in Phase 2" placeholder message
Kept: `export const dynamic = "force-dynamic"`, `referrerPolicy: "no-referrer"` metadata, `formatExpiry` function (kept for future use)

### Task 3: Human verification checkpoint

**Status: PENDING** — Requires `ANTHROPIC_API_KEY` and `DATABASE_URL` environment variables to test live chat flow. Cannot be verified programmatically.

Verification steps for human tester:
1. Start dev server: `npm run dev`
2. Navigate to an active consultation session URL: `/consult/[valid-session-token]`
3. Verify: Chat interface loads with WhatsApp-style layout and tier badge at top
4. Verify: AI sends first message with disclaimer text ("not constitute formal legal or tax advice")
5. Type "I received a Letter of Authority" — verify teal bubble on right
6. Verify: Bouncing dots typing indicator while AI responds
7. Verify: AI response streams in on left in white bubble with legal citations
8. Verify: After intake questions, AI identifies LOA stage and provides footnote citations
9. Refresh page — verify messages reload from database
10. Navigate to expired session — verify read-only mode with amber "Read Only" badge and no input
11. Navigate to invalid session — verify payment-required screen still shows

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] AI SDK v6 UIMessage format incompatible with route's `.content` access**
- **Found during:** Task 1 — researching v6 `useChat` API
- **Issue:** AI SDK v6 client sends `UIMessage[]` with `parts[]` array (not `.content` string). The Plan 01 API route used `messages[messages.length-1].content` for DB persistence and passed `messages` directly to `streamText`. Both fail silently or throw with v6 format.
- **Fix:** Updated `route.ts` to (1) extract user message text from `parts.find(p => p.type === "text")?.text`, (2) call `await convertToModelMessages(messages)` before passing to `streamText`
- **Files modified:** `src/app/api/chat/route.ts`
- **Commit:** 01227616

**2. [Rule 3 - Blocking] `useChat` not exported from `ai` package in v6**
- **Found during:** Task 1 — checking package exports
- **Issue:** Plan specified `import { useChat } from "ai/react"` but AI SDK v6 does not export `useChat` from `ai` at all. It's in `@ai-sdk/react` (separate package).
- **Fix:** Installed `@ai-sdk/react`, changed import to `import { useChat } from "@ai-sdk/react"`
- **Files modified:** `package.json`, `package-lock.json`
- **Commit:** 01227616

**3. [Rule 1 - Bug] `useChat` v6 API does not expose `input`, `setInput`, `handleSubmit`, or `isLoading`**
- **Found during:** Task 1 — reading `@ai-sdk/react` type definitions
- **Issue:** Plan's `ChatInterface` code used `const { messages, input, setInput, handleSubmit, isLoading, error } = useChat(...)`. v6 hook returns `{ messages, sendMessage, status, error, stop, setMessages }` only.
- **Fix:** Added `const [input, setInput] = useState("")`, derived `isLoading` from `status`, used `sendMessage({ text: input })` and manually cleared input after send
- **Files modified:** `src/components/chat/chat-interface.tsx`
- **Commit:** 01227616

**4. [Rule 1 - Bug] `DefaultChatTransport` incompatible with `toTextStreamResponse()` route**
- **Found during:** Task 1 — researching transport types
- **Issue:** `DefaultChatTransport` expects the server to return JSON event stream (UIMessageChunk format). Our route uses `toTextStreamResponse()` which returns plain text stream. Using `DefaultChatTransport` would fail to parse the response.
- **Fix:** Used `TextStreamChatTransport` instead, which wraps the text stream in `transformTextToUiMessageStream`
- **Files modified:** `src/components/chat/chat-interface.tsx`
- **Commit:** 01227616

**5. [Rule 1 - Bug] `useChat` body and api options require transport constructor, not direct ChatInit props**
- **Found during:** Task 1 — researching v6 `ChatInit` type
- **Issue:** Plan's `useChat({ api: "/api/chat", body: { sessionToken } })` pattern. In v6, `ChatInit` does not accept `api` or `body` directly — these are `HttpChatTransportInitOptions` and must be passed via `transport` instance.
- **Fix:** Used `transport: new TextStreamChatTransport({ api: "/api/chat", body: { sessionToken } })`
- **Files modified:** `src/components/chat/chat-interface.tsx`
- **Commit:** 01227616

## Known Stubs

None — all data flows wired. Chat loads real messages from DB (server-side), sends to real `/api/chat` route, which streams from real Claude API (requires `ANTHROPIC_API_KEY`).

## Threat Mitigations Applied

- T-02-09: Chat history loaded server-side scoped to `eq(chatMessages.sessionId, session.id)` — no cross-session leak
- T-02-10: `sessionToken` passed from URL param (server component) through to client; re-validated on every API request in route.ts

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/components/chat/citation-footer.tsx | FOUND |
| src/components/chat/message-bubble.tsx | FOUND |
| src/components/chat/chat-input.tsx | FOUND |
| src/components/chat/chat-interface.tsx | FOUND |
| src/app/consult/[sessionId]/page.tsx | MODIFIED |
| src/app/api/chat/route.ts | MODIFIED (bug fix) |
| Commit 01227616 (Task 1 components + route fix) | FOUND |
| Commit eeb6ebfb (Task 2 consultation page) | FOUND |
| npm run build | PASSED |
| Task 3 | PENDING (human verification) |
