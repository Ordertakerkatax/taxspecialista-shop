# BIR Tax Dispute Advisory Chatbot

## What This Is

An AI-powered consultation chatbot that guides Philippine taxpayers through BIR tax dispute proceedings — from Letter of Authority (LOA) and audit responses through assessments (PAN/FAN/FDDA), Subpoena Duces Tecum, and collection actions. It provides legal basis citations, actionable step-by-step guidance, draft response letters, and deadline tracking. Operates as a standalone web app at consult.taxspecialista.com with per-consultation pricing.

## Core Value

Taxpayers facing BIR actions get immediate, legally-grounded guidance on what to do next — with specific NIRC sections, RMOs, and RRs cited — so they can respond correctly and within deadlines.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Conversational AI intake that extracts case details (BIR document type, key dates, tax type/amount, prior actions)
- [ ] Legal basis citations from NIRC, RMOs, RRs, and CTA decisions via RAG
- [ ] Step-by-step actionable items tailored to the client's specific BIR stage
- [ ] Draft letter generation (protest letters, replies, compliance documents)
- [ ] Deadline tracking with prescription period awareness
- [ ] Per-consultation payment (PHP 1,000-3,000 range) via GCash/Maya and bank transfer
- [ ] Hybrid liability model: AI gives initial guidance, flags complex cases for professional review
- [ ] Escalation queue with notification for cases requiring CPA/lawyer review
- [ ] Optional client accounts for case history persistence
- [ ] Advisory disclaimers (not legal/tax advice, consult a professional)

### Out of Scope

- Real-time live chat with CPA — AI handles advisory, escalation is async queue
- Mobile native app — web-first, responsive design
- Integration with existing taxspecialista.com Medusa shop — standalone app
- Automated BIR e-filing or submission — advisory only, client acts on guidance
- Multi-language support — English and Filipino naturally handled by LLM

## Context

- **Operator:** TaxSpecialista, a digital shop for Philippine tax products run by a CPA and Tax Code Specialist
- **Domain:** Philippine tax law — BIR enforcement proceedings (LOA, assessments, SDT, collection)
- **AI Provider:** Claude API (Anthropic) — selected for legal reasoning capability
- **Knowledge base:** Start with Claude's training data, incrementally add BIR issuances and CTA decisions via RAG
- **Target market:** Philippine taxpayers (individuals and businesses) receiving BIR notices
- **Payment landscape:** GCash and Maya dominate Philippine digital payments; bank transfer for larger amounts
- **MVP focus:** LOA stage only — most common entry point for taxpayer disputes

## Constraints

- **Regulatory:** Must include clear disclaimers that output is not formal legal/tax advice
- **Knowledge accuracy:** RAG knowledge base must be built incrementally to ensure citation accuracy
- **Payment:** Must support GCash/Maya (Philippine e-wallets) and bank transfer — no credit card required for MVP
- **Pricing:** PHP 1,000-3,000 per consultation — positioned as affordable alternative to full CPA consultation
- **Liability:** Complex cases must be flagged and escalated to human review before final advice is delivered

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Standalone app (not embedded in shop) | Separate concerns; consultation product has different UX needs than digital product shop | — Pending |
| Claude API over GPT | Stronger legal reasoning, better at structured citation | — Pending |
| Conversational intake over form wizard | More natural for clients unfamiliar with tax terminology; AI can adapt questions | — Pending |
| LOA-first MVP | Most common BIR action, simpler scope, validates the concept before expanding | — Pending |
| Pay-before-chat model | Philippine market preference for upfront pricing; builds commitment | — Pending |
| RAG built incrementally | Avoids upfront document curation bottleneck; start with LLM knowledge, improve over time | — Pending |
| Hybrid liability (AI + human escalation) | Balances accessibility with professional responsibility | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-09 after initialization*
