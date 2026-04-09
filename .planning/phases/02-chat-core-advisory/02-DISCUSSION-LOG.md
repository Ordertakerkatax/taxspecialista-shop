# Phase 2: Chat Core & Advisory - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-09
**Phase:** 02-chat-core-advisory
**Areas discussed:** Conversation Flow, Legal Citation Delivery, Knowledge Base Approach, Chat UI & Session UX

---

## Conversation Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Guided intake first | AI asks structured questions one-by-one before giving advice | ✓ |
| Freeform chat | Taxpayer describes situation naturally, AI extracts details | |
| You decide | Claude picks the best approach | |

**User's choice:** Guided intake first

---

| Option | Description | Selected |
|--------|-------------|----------|
| AI infers from answers | AI determines BIR stage from taxpayer descriptions, shows for confirmation | ✓ |
| Explicit stage selection | Present list of stages, taxpayer picks | |
| You decide | Claude picks | |

**User's choice:** AI infers from answers

---

| Option | Description | Selected |
|--------|-------------|----------|
| Inform and stop | Tell user their stage isn't covered yet | |
| Basic guidance + flag | Give general direction but flag limited coverage, recommend CPA | ✓ |
| You decide | Claude picks | |

**User's choice:** Basic guidance + flag

---

| Option | Description | Selected |
|--------|-------------|----------|
| Message limit | Basic gets N messages, Comprehensive unlimited | |
| Depth of advice | Basic gets summary, Comprehensive gets detailed | |
| Same chat, different model | Basic uses Sonnet, Comprehensive uses Opus | |
| You decide | Claude picks best tier differentiation | ✓ |

**User's choice:** You decide (Claude's Discretion)

---

## Legal Citation Delivery

| Option | Description | Selected |
|--------|-------------|----------|
| Inline with bold labels | Citations woven into advice text | |
| Footnote-style references | Numbered superscripts, citations at bottom of message | ✓ |
| You decide | Claude picks | |

**User's choice:** Footnote-style references

---

| Option | Description | Selected |
|--------|-------------|----------|
| Section number + summary | e.g., "NIRC Section 228 - Assessment Notice Requirements" | ✓ |
| Full relevant excerpt | Quote specific subsection text | |
| You decide | Claude picks | |

**User's choice:** Section number + summary

---

## Knowledge Base Approach

| Option | Description | Selected |
|--------|-------------|----------|
| System prompt with curated knowledge | Hand-craft system prompt with key NIRC/RMO/RR content | ✓ |
| RAG with pgvector | Ingest BIR PDFs into vector embeddings | |
| Claude's training knowledge only | Rely on built-in knowledge | |

**User's choice:** System prompt with curated knowledge

---

| Option | Description | Selected |
|--------|-------------|----------|
| I have content ready | User provides NIRC sections and RMOs | |
| Claude compiles from research | Claude researches and compiles LOA legal framework | ✓ |
| Mix | User provides core, Claude fills gaps | |

**User's choice:** Claude compiles from research

---

## Chat UI & Session UX

| Option | Description | Selected |
|--------|-------------|----------|
| Messaging app style | WhatsApp-like bubbles, streaming, typing indicator | ✓ |
| Professional panel style | Document-style layout, bordered cards | |
| You decide | Claude picks | |

**User's choice:** Messaging app style

---

| Option | Description | Selected |
|--------|-------------|----------|
| Banner at top of chat | Persistent disclaimer banner | |
| First AI message | Disclaimer in AI's opening greeting | ✓ |
| Both | Banner + first message | |

**User's choice:** First AI message

---

## Claude's Discretion

- Tier differentiation (Basic vs Comprehensive) — deferred to research/planning
- Chat message persistence model
- Exact intake question sequence
- Streaming UX details
- Error handling for AI failures

## Deferred Ideas

None
