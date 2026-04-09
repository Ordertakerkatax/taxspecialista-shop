# Architecture Patterns

**Project:** BIR Tax Dispute Advisory Chatbot (consult.taxspecialista.com)
**Researched:** 2026-04-09
**Confidence:** MEDIUM — AI legal advisory chatbot architecture is well-established; Philippine-specific payment integration details are training-data-level

---

## Recommended Architecture

A layered, session-gated application where payment unlocks a stateful consultation session. The system is composed of seven distinct components with clear boundaries.

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT BROWSER                    │
│  Chat Interface (Next.js) + Payment UI              │
└───────────────────┬─────────────────────────────────┘
                    │ HTTPS / SSE
┌───────────────────▼─────────────────────────────────┐
│              API LAYER (Next.js API Routes)         │
│  Session Auth · Payment Webhook · Chat Endpoint     │
│  Document Generation · Escalation Trigger           │
└──┬────────────┬──────────────┬──────────────────────┘
   │            │              │
┌──▼──┐    ┌───▼───┐    ┌─────▼─────┐
│ RAG │    │Claude │    │ Payment   │
│ Pipe│    │  API  │    │ Gateway   │
│ line│    │(Anthro│    │(GCash/    │
│     │    │  pic) │    │ Maya/BPI) │
└──┬──┘    └───────┘    └─────┬─────┘
   │                          │
┌──▼──────────────────────────▼─────────────────────┐
│                  DATABASE LAYER                    │
│  PostgreSQL: sessions, cases, users, payments      │
│  pgvector / Pinecone: BIR document embeddings     │
└────────────────────────────────────────────────────┘
                    │
          ┌─────────▼──────────┐
          │   ADMIN DASHBOARD  │
          │  (CPA Review Queue)│
          └────────────────────┘
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Chat Interface** | Conversational UI, session state display, document viewer | API Layer (HTTP/SSE stream) |
| **API Layer** | Request routing, session auth, orchestration | All backend components |
| **Claude API Integration** | LLM reasoning, prompt construction, response streaming | API Layer → Claude (outbound) |
| **RAG Pipeline** | Embed query, retrieve relevant BIR docs, inject context | API Layer, Vector DB, Document Store |
| **Payment Gateway** | GCash/Maya/bank transfer initiation, webhook confirmation | API Layer (webhook inbound) |
| **Database Layer** | Session persistence, case records, payment records, user accounts | API Layer |
| **Admin Dashboard** | CPA review queue, escalation management, case notes | API Layer (authenticated) |
| **Document Generation** | Templated letter assembly (protest, reply, compliance) | API Layer, Claude API |

---

## Data Flow

### Happy Path: User Gets Advisory

```
1. User lands on consult.taxspecialista.com
2. User selects consultation tier (e.g., LOA Review, PHP 1,500)
3. Payment Gateway creates payment link → user pays via GCash/Maya
4. Payment webhook fires → API Layer creates Session (UUID, tier, expiry)
5. Session token returned to browser via redirect/cookie
6. User begins chat → Chat Interface sends message + session token
7. API Layer validates session (paid, not expired)
8. RAG Pipeline: embed user message → vector search → retrieve top-K BIR docs
9. Prompt assembled: system prompt + retrieved docs + conversation history + user message
10. Claude API called with assembled prompt → streaming response
11. API Layer streams response to browser via SSE
12. API Layer persists message pair to Database (case record)
13. Claude response includes complexity signal → if HIGH, set escalation flag
14. User receives advisory with citations; escalation flag queued for CPA review
```

### Escalation Path

```
1. Claude response includes structured signal: { complexity: "high", reason: "..." }
2. API Layer reads signal → writes escalation record to DB
3. Admin Dashboard surfaces escalation with full conversation transcript
4. CPA reviews, annotates, optionally sends supplemental guidance via dashboard
5. User notified (email/in-app) that CPA has reviewed their case
```

### Document Generation Path

```
1. User requests draft letter (e.g., "Generate my protest letter")
2. API Layer confirms: session is valid, case details are sufficient
3. Document Generation service assembles template slots from case record
4. Claude API called with letter-generation prompt (structured output requested)
5. Output formatted as PDF or downloadable DOCX
6. Document stored in Database, download link returned to user
```

---

## Patterns to Follow

### Pattern 1: Session-Gated Chat (Pay-Before-Chat)

**What:** Payment creates a session token. All chat endpoints require a valid, unexpired session token. No payment = no chat access.

**When:** MVP and beyond — enforces the business model cleanly.

**Example:**
```typescript
// Middleware check on /api/chat
async function requirePaidSession(req: Request) {
  const session = await db.sessions.findUnique({
    where: { token: req.headers['x-session-token'] }
  })
  if (!session || session.expiresAt < new Date() || session.status !== 'active') {
    throw new UnauthorizedError('Valid paid session required')
  }
  return session
}
```

### Pattern 2: RAG with Structured Retrieval Context

**What:** Embed the user's message, retrieve the top-K most relevant BIR documents from the vector store, inject them into the Claude prompt with explicit citation markers so the LLM cites source and section number.

**When:** Every chat turn once RAG corpus has content. For MVP (LOA-only), can start with a curated system prompt containing the most relevant NIRC sections and RMOs, then add vector retrieval incrementally.

**Example prompt structure:**
```
System: You are a Philippine tax dispute advisor...
[RETRIEVED DOCUMENTS]
Document 1 [Source: RR 18-2013, Section 3.1.1]:
<content>
Document 2 [Source: NIRC Section 228]:
<content>
[END RETRIEVED DOCUMENTS]
User conversation history: ...
User: [current message]
```

### Pattern 3: Structured Output for Complexity Signaling

**What:** Instruct Claude to return a JSON envelope alongside its advisory response, containing a complexity assessment and reason. The API layer reads this to decide whether to trigger escalation.

**When:** Every response in the advisory flow.

**Example:**
```typescript
// Claude response parsed
interface AdvisoryResponse {
  message: string          // markdown advisory content
  complexity: 'low' | 'medium' | 'high'
  escalation_reason?: string
  cited_sources: string[]  // NIRC sections, RMOs, RRs
  deadlines_identified?: string[]
}
```

### Pattern 4: Webhook-Confirmed Payment Before Session Creation

**What:** Never create a paid session on client-side confirmation. Only create it after the payment gateway fires a server-side webhook with a confirmed status. This prevents session fraud.

**When:** All payment flows.

**Example flow:**
```
Client POSTs to /api/payment/initiate
  → create pending payment record (DB)
  → return payment URL to client
Client redirected to GCash/Maya
  → user pays
GCash/Maya POSTs webhook to /api/payment/webhook (server-to-server)
  → verify signature
  → update payment record to 'confirmed'
  → create session record
  → mark session as 'active'
Client polls or receives redirect with session token
```

### Pattern 5: Conversation History with Rolling Window

**What:** Store full conversation in DB but only send the last N turns to Claude (e.g., last 10 exchanges). Prepend a case-context summary generated from the intake phase. This manages token cost and keeps the prompt focused.

**When:** Sessions longer than 5-6 exchanges.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Streaming Entire RAG Context to Client

**What:** Sending retrieved document text directly to the browser.

**Why bad:** Exposes your proprietary BIR document corpus to clients; bloats bandwidth; not what users need (they need the synthesized advice, not raw regulatory text).

**Instead:** Keep retrieved documents server-side. Only return the Claude-synthesized advisory with inline citations.

### Anti-Pattern 2: Stateless Chat (No Session Persistence)

**What:** Each message treated independently; no conversation history maintained.

**Why bad:** BIR dispute cases have multi-step context. A user saying "what's the deadline for that?" requires knowing what was discussed. Stateless chat produces useless responses.

**Instead:** Persist conversation history in DB, reconstruct context for each turn.

### Anti-Pattern 3: Monolithic Prompt (No RAG, All Context Hardcoded)

**What:** Stuffing all BIR regulations into a massive system prompt.

**Why bad:** Context window costs, stale content (can't update without code deploy), poor retrieval precision (LLM must find relevant section in wall of text).

**Instead:** Start lean (curated LOA-specific system prompt for MVP), then add RAG incrementally. The system prompt sets persona and behavior; RAG provides dynamic document context.

### Anti-Pattern 4: Trust Client-Reported Payment Status

**What:** Client sends "payment_status: paid" and server creates session.

**Why bad:** Trivially bypassed. Any user can fake this header or parameter.

**Instead:** Always use server-side webhook confirmation before creating sessions.

### Anti-Pattern 5: Unbounded Claude Calls Per Session

**What:** No limit on how many Claude calls a single paid session can make.

**Why bad:** Users could abuse a single PHP 1,500 payment for hundreds of queries. Token costs will exceed revenue.

**Instead:** Define per-session limits (e.g., max 20 exchanges or max 50K total tokens), display remaining balance to user, offer upsell for extended session.

---

## Component Build Order (Dependencies)

Build order is dictated by what must exist before the next component can be tested.

```
Phase 1: Foundation
  Database schema (sessions, cases, payments, messages) 
    → no dependencies

Phase 2: Payment Gateway
  Payment initiation + webhook handling + session creation
    → requires: Database
    → blocks: everything else (no paid session = no chat)

Phase 3: Chat Core (Claude Integration)
  API endpoint + Claude API call + streaming response
    → requires: Database (session auth), Claude API key
    → can start with hardcoded system prompt (no RAG yet)

Phase 4: Chat Interface
  Next.js chat UI + streaming display + session management
    → requires: Chat Core API to be functional

Phase 5: RAG Pipeline
  Document ingestion + embedding + vector search + context injection
    → requires: Chat Core (to inject retrieved context)
    → can be built in parallel with Phase 4

Phase 6: Document Generation
  Letter templates + Claude structured output + PDF/DOCX export
    → requires: Chat Core (for generation calls), Database (for case data)

Phase 7: Escalation + Admin Dashboard
  Complexity signaling + CPA review queue + case annotation
    → requires: Chat Core (signal parsing), Database (escalation records)

Phase 8: User Accounts (Optional)
  Registration + login + case history
    → requires: Database (extend schema), all above components
    → truly optional; sessions can be anonymous for MVP
```

---

## Scalability Considerations

| Concern | MVP (1-50 consultations/day) | Growth (500/day) | Scale (5K+/day) |
|---------|------------------------------|------------------|-----------------|
| Claude API cost | Direct API, no caching | Response caching for identical queries | Semantic cache (e.g., GPTCache) |
| Vector DB | pgvector (PostgreSQL extension) | pgvector with tuned indexes | Pinecone or Weaviate dedicated |
| Session storage | PostgreSQL | PostgreSQL + Redis for active sessions | Redis primary for session lookups |
| Streaming | SSE via Next.js API routes | SSE, Vercel edge functions | WebSocket with dedicated WS server |
| Document generation | Synchronous (in-request) | Background job queue (BullMQ) | Queue + worker pool |
| Database | Single Postgres instance | Read replicas | Sharding or PlanetScale |

---

## Technology Anchors

These are the high-confidence technology choices implied by the architecture. (See STACK.md for full justification.)

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend + API | Next.js 14+ (App Router) | SSE streaming support, API routes, single deployment unit |
| LLM | Anthropic Claude API (claude-3-5-sonnet or claude-opus-4) | Legal reasoning, citation following, structured output |
| Vector DB (MVP) | pgvector (PostgreSQL extension) | Zero new infrastructure; good enough for <100K document chunks |
| Primary DB | PostgreSQL (Supabase or Railway) | Relational data, pgvector colocated, managed hosting |
| Payment | PayMongo | Philippine GCash + Maya + bank transfer in one SDK; webhook support |
| Hosting | Vercel (frontend/API) | SSE streaming works; zero-config Next.js |
| PDF generation | Puppeteer or @react-pdf/renderer | Server-side PDF from HTML/React templates |

---

## Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js monorepo (API + UI) | Simplifies deployment; avoids separate backend service for MVP scale |
| Pay-before-chat (not post-pay) | Eliminates billing disputes; user arrives committed |
| pgvector over Pinecone (MVP) | Avoids operational complexity of a separate vector service; revisit at scale |
| Async escalation (queue, not live chat) | Scopes CPA involvement without real-time availability requirement |
| Structured output from Claude | Enables reliability: complexity signals, deadline extraction, source citation — not dependent on prompt heuristics |
| Session expiry (72hr window) | Balances user flexibility vs. resource abuse; consultation = time-boxed service |

---

## Sources

- Architecture derived from established patterns in AI legal chatbot systems (training data, August 2025 cutoff)
- Philippine payment gateway: PayMongo documentation patterns (HIGH confidence — PayMongo is the established GCash/Maya aggregator for Philippine developers)
- Next.js SSE streaming: Next.js App Router documentation patterns (HIGH confidence)
- pgvector: PostgreSQL extension for vector similarity search (HIGH confidence — production-ready, used by Supabase)
- Claude structured output: Anthropic documentation for tool use / JSON mode (HIGH confidence)

**Confidence note:** External search was unavailable during research. Architecture patterns are well-established and training-data confidence is MEDIUM-HIGH for this domain. Philippine-specific payment gateway options (PayMongo vs. direct GCash/Maya APIs) should be verified against current PayMongo docs before implementation.
