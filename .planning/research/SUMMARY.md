# Research Summary: BIR Tax Dispute Advisory Chatbot

**Synthesized:** 2026-04-09
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md
**Overall Confidence:** MEDIUM

## Executive Summary

A session-gated, pay-before-chat AI advisory product for Philippine taxpayers navigating BIR dispute proceedings. Purpose-built with deep domain logic: stage identification (LOA to PAN to FAN to FDDA to collection), deterministic deadline computation, and RAG-backed legal citation.

## Recommended Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 15 (App Router) | Consistent with existing shop; SSR + API routes |
| AI SDK | Vercel AI SDK 4.x + @ai-sdk/anthropic | useChat hook eliminates custom streaming code |
| LLM | Claude Sonnet 4.5 (primary), Opus for escalation | Legal reasoning strength; 200K context for RAG |
| Database | Neon PostgreSQL + Drizzle ORM | Serverless scaling, single DB for relational + vector |
| Vector DB | pgvector (in same Postgres) | Zero new infrastructure; migrate to dedicated service at scale |
| Embeddings | Voyage AI voyage-law-2 (verify availability) | Legal domain embeddings; fallback: OpenAI text-embedding-3-large |
| Auth | Clerk | Optional accounts; hosted user management |
| Payments | PayMongo | GCash + Maya + bank transfer; Philippine aggregator |
| Email | Resend | Escalation notifications |
| Hosting | Vercel | Edge functions, streaming support |

## Key Features by Category

### Table Stakes (must have)
- Conversational case intake with stage identification
- Legal basis citations (NIRC sections, RMOs, RRs)
- Step-by-step actionable items per BIR stage
- Deadline tracking with prescription period awareness
- Advisory disclaimers (not formal legal/tax advice)
- Payment gate (pay before chat)
- Session summary with key findings

### Differentiators (competitive advantage)
- Draft protest letter generation (highest-value feature)
- Deterministic prescription period calculator (not LLM inference)
- Waiver validity checker
- Grounds mapping (matching facts to legal defenses)
- Hybrid escalation to human CPA review

### Anti-Features (deliberately NOT building)
- CTA litigation guidance (crosses into unauthorized legal practice)
- Definitive outcome predictions ("you will win")
- Real-time live chat with CPA
- Automated BIR e-filing

## Architecture

**Central pattern:** Payment creates session -> session gates all chat API calls.

**Data flow:** PayMongo webhook -> session creation -> Claude API (structured output: message + complexity signal + citations + deadlines) -> escalation queue if complexity = high.

**Key architectural decisions:**
- RAG is additive, not foundational at MVP (start with curated system prompt)
- Structured Claude output (JSON envelope) for reliability
- Deterministic date calculator module (code, not LLM)
- Escalation is async queue, not live chat

## Critical Pitfalls

1. **Prescription date errors** — Catastrophic; wrong deadline = permanent loss of taxpayer rights. Must use deterministic calculator, never LLM inference.
2. **Citation hallucination** — BIR issuances not comprehensively indexed; RAG must enforce citation grounding (no document in store = say so).
3. **Disclaimers are not a liability shield** — Philippine Civil Code context; hybrid escalation must be real, not cosmetic. Need attorney opinion on RA 7394 / PRC scope.
4. **GCash/Maya onboarding delays** — Weeks to months; start PayMongo merchant application at project kickoff.
5. **Data Privacy Act (RA 10173)** — Tax assessment details are sensitive personal information; NPC registration before first paid consultation.

## Suggested Phase Structure (8 phases)

1. **Foundation & Compliance** — NPC registration, Privacy Notice, PayMongo merchant application, Clerk auth setup
2. **Core Infrastructure** — Database schema + payment gateway + session creation
3. **Chat Core (LOA Advisory)** — Claude integration, conversational intake, stage ID, LOA actions, deadline calculator, escalation flag
4. **Chat Interface** — Streaming UI, mobile-first, GCash deep-link flow
5. **RAG Pipeline** — 50-100 curated LOA docs, pgvector, citation grounding policy
6. **Escalation & Admin** — CPA review queue, case annotation, email notifications
7. **PAN/FAN Expansion** — New stage modules + draft letter generation (only after LOA validated)
8. **Advanced Features (v2+)** — Case history, user accounts, waiver checker, FDDA/SDT/collection modules

**Critical constraint:** LOA-stage-only through Phase 5. Hard validation gate before expanding.

## Research Gaps (Verify Before Implementation)

- Philippine competitor landscape (no web search performed)
- Voyage AI voyage-law-2 model availability and pricing
- Current NPC registration process at privacy.gov.ph
- PayMongo webhook reliability patterns
- RR 18-2013 specific deadlines for PAN/FAN
- PRC scope-of-practice applicability for AI-assisted CPA advisory

---
*Synthesized: 2026-04-09*
