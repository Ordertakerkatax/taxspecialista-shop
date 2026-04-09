# Technology Stack

**Project:** BIR Tax Dispute Advisory Chatbot (consult.taxspecialista.com)
**Researched:** 2026-04-09
**Research mode:** Training knowledge only (all external search tools disabled)
**Overall confidence:** MEDIUM — core web/AI stack is well-established; Philippine payment gateway specifics marked individually

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 15.x (App Router) | Full-stack web framework | App Router's React Server Components reduce client bundle size; built-in API routes handle Claude streaming without a separate backend; Vercel deployment is zero-config; mature ecosystem for auth, payments, middleware |
| React | 19.x | UI rendering | Bundled with Next.js 15; concurrent features improve streaming chat UX |
| TypeScript | 5.x | Type safety | Catches prompt/response shape errors at compile time; critical when LLM responses drive business logic |

**Why Next.js over alternatives:**
- **Not Remix:** Remix has no built-in streaming AI SDK integration; smaller ecosystem for auth/payments
- **Not SvelteKit:** Vercel AI SDK React hooks don't work in Svelte without adapters; unnecessary complexity
- **Not plain Express + Vite:** Requires wiring streaming, SSR, and routing manually — no benefit for this project size

---

### AI Integration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vercel AI SDK (`ai`) | 4.x | Streaming chat, tool calls, structured output | The de-facto standard for Next.js + Claude integration; `useChat` hook handles streaming state, message history, and error states out of the box; `streamText` and `generateObject` cover both conversational and structured generation patterns |
| `@ai-sdk/anthropic` | 1.x | Claude API provider adapter | Maintained by Vercel alongside the SDK; provides type-safe Claude model selection; handles API key, retries, and error normalization |
| Claude claude-sonnet-4-5 (claude-sonnet-4-5) | API | Primary reasoning model | Best cost/quality balance for legal advisory tasks; 200K context window handles long document citations; faster and cheaper than claude-opus-4-5 for per-consultation billing |
| Claude claude-opus-4-5 (claude-opus-4-5) | API | Escalation/complex cases | Reserve for flagged complex cases where maximum reasoning quality matters; ~5x cost vs Sonnet justifies only for edge cases |

**Confidence:** MEDIUM — Vercel AI SDK 4.x and claude-sonnet-4-5 model were current as of August 2025; verify exact model IDs and SDK version at https://sdk.vercel.ai and https://docs.anthropic.com before coding.

**Why Claude over GPT-4o:**
- Better at structured legal citation and following formatting instructions precisely
- Anthropic's Constitutional AI training makes it more cautious about dispensing advice without caveats — appropriate for advisory disclaimer requirement
- Project.md already specifies Claude; validated choice

---

### RAG (Retrieval-Augmented Generation)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| PostgreSQL + pgvector | PostgreSQL 16, pgvector 0.7+ | Vector storage and similarity search | Avoids a separate vector database service; single database for both relational data (users, consultations, payments) and vector embeddings; pgvector's HNSW indexing handles the scale of BIR issuances without managed service costs |
| Vercel AI SDK `embed()` / `embedMany()` | 4.x | Generate embeddings | Built into the same SDK; use with `text-embedding-3-small` (OpenAI) or Voyage AI for embedding generation |
| Voyage AI `voyage-law-2` | API | Legal-domain embeddings | Voyage's law-specialized embedding model outperforms general embeddings on legal document retrieval — measurably better chunk recall for statute text. Alternative: `text-embedding-3-large` (OpenAI) as fallback |
| LangChain.js document loaders | 0.3.x | PDF/document ingestion pipeline | Handles BIR issuance PDFs (RMOs, RRs, CTA decisions) with chunking strategies; RecursiveCharacterTextSplitter with overlap handles legal document structure |

**Confidence:** MEDIUM — pgvector + PostgreSQL is the established pattern for Next.js RAG at this scale. Voyage AI law model recommendation is based on general knowledge of domain-specific embeddings; verify at https://docs.voyageai.com before committing.

**Why pgvector over Pinecone:**
- No additional managed service cost or vendor lock-in
- Relational joins work natively (e.g., "give me all chunks from RMO 19-2007")
- Supabase or Neon provide pgvector-enabled PostgreSQL with no self-hosting
- Pinecone adds cost and operational complexity for a knowledge base that starts small and grows incrementally

**Why not Weaviate or Chroma:**
- Weaviate: operationally heavy for a greenfield solo-built project
- Chroma: good for local dev/prototyping but not production-ready at the persistence level needed

---

### Database

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| PostgreSQL (via Neon or Supabase) | 16.x | Primary database — users, consultations, payments, RAG vectors | Neon provides serverless PostgreSQL with pgvector support and free tier; scales with traffic spikes (per-consultation means bursty load); Supabase is an alternative with built-in auth |
| Drizzle ORM | 0.30.x | Database access layer | Lightweight, TypeScript-first, excellent Next.js App Router compatibility; generates migrations; faster query building than Prisma for simple schemas; no runtime overhead |

**Why Drizzle over Prisma:**
- Prisma's query engine adds ~40MB binary and cold start latency on serverless — problematic for Vercel Edge/Serverless Functions
- Drizzle is SQL-first; BIR document metadata queries benefit from explicit SQL control
- Drizzle's schema is TypeScript, giving type safety without a separate `.prisma` DSL

**Why not Supabase JS client directly:**
- Supabase client is fine but ties you to Supabase specifically; Drizzle works with any PostgreSQL host

---

### Authentication

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Clerk | Latest (v5) | User authentication and session management | Best DX for Next.js App Router; handles email/password, magic links, social login; built-in Philippines-compatible (no regional restrictions); free tier covers MVP scale; dashboard for user management without building admin UI |

**Confidence:** MEDIUM — Clerk v5 with Next.js App Router was the recommended pattern as of mid-2025.

**Why Clerk over NextAuth (now Auth.js):**
- Auth.js v5 is still in beta as of mid-2025 and has App Router adapter rough edges
- Clerk provides a hosted user database — no schema design for auth tables
- Optional accounts (PROJECT.md says "optional") means a fast, low-config auth solution is preferred

**Why not Supabase Auth:**
- Tightly coupled to Supabase — if hosting moves, auth moves too
- Clerk's UI components are more polished for a paid product

---

### Payment Integration (Philippine Market)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| PayMongo | API v1 | GCash, Maya, bank transfer, credit cards | **Primary recommendation for Philippine market.** PayMongo is the dominant Philippine payment gateway with direct GCash and Maya e-wallet links, OTC payment options, and bank transfers. Merchant registration is straightforward for Philippine businesses. Per-link payment model fits the per-consultation billing pattern perfectly |
| PayMongo `@paymongo/paymongo.js` or REST API | Latest | SDK or direct REST | PayMongo's Node.js SDK or direct REST calls from Next.js API routes; Payment Links API creates a hosted payment page — no PCI DSS complexity |

**Confidence:** MEDIUM — PayMongo was the leading Philippine payment gateway as of 2025 with confirmed GCash and Maya support. Verify current merchant onboarding requirements at https://paymongo.com before integrating.

**Why PayMongo over alternatives:**
- **Not Stripe:** Stripe does not support GCash or Maya directly in the Philippines; requires workarounds
- **Not Dragonpay:** Older gateway, worse DX, primarily OTC-focused
- **Not direct GCash/Maya API:** Both require enterprise agreements and heavy merchant onboarding; PayMongo abstracts this

**Payment flow for per-consultation model:**
1. User describes case (free intake)
2. AI determines complexity tier → presents PHP 1,000 / 1,500 / 2,000 / 3,000 price
3. PayMongo Payment Link created via API → user redirected to hosted payment page
4. Webhook confirms payment → consultation session unlocked
5. AI delivers full advisory response

---

### Chat UI

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vercel AI SDK `useChat` hook | 4.x | Streaming chat state management | Handles message array, input state, streaming updates, and error states; reduces ~200 lines of custom streaming code to ~20 lines; works with Next.js App Router streaming |
| Tailwind CSS | 4.x | Styling | Zero-runtime CSS; fast to build custom chat bubble UI without fighting component library opinions; Tailwind v4 has improved performance and CSS variable support |
| shadcn/ui | Latest | Component primitives | Not a dependency — copy-paste components; Dialog, Sheet, ScrollArea, Badge used for chat UI without locking into a component library release cycle |

**Why not a pre-built chat UI library (e.g., react-chatbot-kit):**
- Legal advisory chat has custom requirements: citation callouts, document type badges, deadline highlights, escalation banners
- Pre-built chat UIs are too opinionated and hard to extend for domain-specific rendering

---

### Document Processing (RAG Ingestion Pipeline)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `pdf-parse` or `pdfjs-dist` | Latest | Extract text from BIR PDF issuances | BIR publishes RMOs, RRs, and revenue memoranda as PDFs; `pdf-parse` is lighter for server-side Node.js; `pdfjs-dist` handles complex layouts better |
| LangChain.js `RecursiveCharacterTextSplitter` | 0.3.x | Chunk legal documents for embedding | Legal documents need overlap-aware chunking to avoid splitting mid-statute; 512-1024 token chunks with 10-20% overlap is the standard legal RAG pattern |
| Node.js cron job or Vercel Cron | — | Periodic ingestion of new BIR issuances | Run the ingestion pipeline as a scheduled job when new RMOs/RRs are published |

**Confidence:** MEDIUM — document processing libraries are stable and unlikely to have changed significantly.

---

### Infrastructure and Deployment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vercel | Latest | Hosting and deployment | Zero-config Next.js deployment; automatic preview URLs; serverless functions scale to zero between consultations (cost-efficient for bursty traffic); built-in CDN for Philippine users |
| Neon | Latest | Serverless PostgreSQL with pgvector | Free tier sufficient for MVP; scales automatically; pgvector extension available; connection pooling via PgBouncer included |
| Vercel Blob or Cloudflare R2 | — | Storage for uploaded BIR documents | Users may need to upload their LOA or assessment notice; R2 is cheaper at scale; Vercel Blob is simpler for MVP |
| Resend | Latest | Transactional email | Payment confirmations, escalation notifications, case history emails; best DX for Next.js; free tier covers MVP |

**Why Vercel over Railway or Render:**
- Native Next.js streaming support without configuration
- Edge middleware works without setup for auth guards
- Automatic deployment from git

**Why Neon over Supabase PostgreSQL:**
- Neon's branching feature allows database branches for dev/staging that match code branches
- Lower cold start for serverless — important when consultation sessions start from zero
- Supabase is also valid if you want the full platform (auth + storage + DB in one)

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 15 | SvelteKit | Vercel AI SDK React hooks don't work natively; smaller hiring pool |
| AI SDK | Vercel AI SDK | LangChain.js | LangChain.js is powerful but complex; Vercel AI SDK covers 90% of needs with 10% of the complexity |
| Vector DB | pgvector | Pinecone | Extra service cost and complexity for a knowledge base starting small |
| Auth | Clerk | Auth.js v5 | Auth.js v5 still in beta; App Router rough edges |
| Payments | PayMongo | Stripe | Stripe lacks native GCash/Maya support |
| ORM | Drizzle | Prisma | Prisma cold start penalty on Vercel serverless |
| Styling | Tailwind CSS | Chakra UI / MUI | Runtime CSS-in-JS adds bundle weight; too opinionated for custom chat UI |
| Embeddings | Voyage AI law-2 | OpenAI text-embedding-3-large | Legal domain embeddings improve retrieval accuracy for statute text |

---

## Installation

```bash
# Core framework
npx create-next-app@latest consult-taxspecialista --typescript --tailwind --app

# AI
npm install ai @ai-sdk/anthropic

# Database
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Auth
npm install @clerk/nextjs

# Payment (PayMongo — REST API, no official npm package needed; use fetch)
# OR if a community SDK exists:
# npm install paymongo

# Document processing / RAG
npm install @langchain/core @langchain/community langchain
npm install pdf-parse

# Email
npm install resend

# UI components (shadcn — copy-paste, not installed as dependency)
npx shadcn-ui@latest init
```

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Next.js + Vercel AI SDK + Claude | MEDIUM-HIGH | Well-established stack; SDK versions may have minor updates since Aug 2025 |
| pgvector for RAG | MEDIUM | Pattern is established; verify pgvector HNSW index syntax with current docs |
| Clerk auth | MEDIUM | v5 was current mid-2025; verify App Router compatibility |
| PayMongo (Philippine payments) | MEDIUM | Confirmed GCash/Maya support as of 2025; verify merchant onboarding requirements haven't changed |
| Voyage AI law embeddings | LOW-MEDIUM | Promising but less battle-tested than OpenAI embeddings; verify model availability |
| Drizzle ORM | MEDIUM-HIGH | Stable, widely adopted; API is unlikely to have breaking changes |

---

## Sources

- Training knowledge (Claude Sonnet 4.6, cutoff August 2025)
- Verify before implementation:
  - Vercel AI SDK: https://sdk.vercel.ai/docs
  - Anthropic API: https://docs.anthropic.com/en/api
  - PayMongo: https://developers.paymongo.com
  - Clerk Next.js: https://clerk.com/docs/quickstarts/nextjs
  - Neon + pgvector: https://neon.tech/docs/extensions/pgvector
  - Voyage AI: https://docs.voyageai.com
  - Drizzle ORM: https://orm.drizzle.team/docs
