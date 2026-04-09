# Feature Research

**Domain:** AI-powered BIR tax dispute advisory chatbot (Philippine tax law)
**Researched:** 2026-04-09
**Confidence:** MEDIUM — web search and WebFetch were unavailable; findings based on domain expertise, PROJECT.md context, and training knowledge of Philippine BIR proceedings and AI legal tech patterns. Confidence levels noted per feature.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Conversational intake** — AI asks questions to extract case details (BIR document type, TIN, tax type/period, amounts, dates received) | Users arrive confused and non-technical; a form feels bureaucratic. Chat is the entry pattern for AI tools. | MEDIUM | Must handle Philippine-specific BIR terminology and abbreviations. Claude API handles this well. |
| **BIR stage identification** — After intake, clearly state which stage the taxpayer is at (LOA, PAN, FAN, FDDA, SDT, collection) | Users don't know the terminology. Identifying stage is the prerequisite for all guidance. | MEDIUM | Must map intake answers to the correct NIRC/RR-defined stage. Core logic of the system. |
| **Step-by-step next actions** — Tell the user exactly what to do next, in plain language | Users want to know what to DO, not just what the law says. Without this, the chatbot is a law library, not an advisor. | MEDIUM | Highly dependent on correct stage identification. Actions differ radically by stage. |
| **Legal basis citations** — Reference NIRC sections, RMOs, RRs, and CTA decisions that apply to the situation | Without citations, users and their CPAs/lawyers can't verify the advice. Trust collapses. | HIGH | Requires RAG or embedded knowledge base. Citation accuracy is a liability issue. Start with NIRC sections (well-established); RMOs and RR citations need verification layer. |
| **Deadline and prescription period display** — Show critical deadlines computed from dates the user provides | Missing a BIR deadline is catastrophic (waiver of rights). Users expect a tool to surface this. | HIGH | Philippine tax deadlines: PAN reply = 15 days; FAN protest = 30 days (administrative); CTA appeal = 30 days from FDDA or denial. Prescription for assessment = 3 years ordinary, 10 years fraud. Must handle calendar calculation correctly. |
| **Advisory disclaimer** — Clear statement that output is not legal/tax advice and does not create a professional-client relationship | Legally required for liability protection; users expect it in any professional-adjacent tool. | LOW | Display prominently before and after each consultation session. Not dismissible on first view. |
| **Payment gate before guidance** — Require payment confirmation before delivering substantive advice | Users expect pay-before-access for professional advisory services. "Try before you buy" feels wrong for legal/tax topics. | MEDIUM | GCash and Maya are table stakes for the Philippine market. Bank transfer for amounts above GCash limit. Manual verification acceptable for MVP, automated preferred. |
| **Session summary / output delivery** — Deliver a formatted summary of the guidance (PDF or displayable) the user can save or share with their accountant/lawyer | Users need to act on guidance after the session ends. A vanishing chat window is not actionable. | MEDIUM | PDF generation or email delivery. User needs something tangible to take to their professional. |
| **Escalation pathway** — Clear mechanism to flag the case for human (CPA/lawyer) review when AI confidence is low or case is complex | Users receiving BIR notices are anxious. If the AI hesitates, they need to know a human can take over. Without this, users abandon. | MEDIUM | Async queue is fine for MVP. Must set clear expectation on turnaround time. |

---

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required to launch, but create switching costs and competitive moat.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Draft letter/document generation** — Generate protest letters, replies to PAN/FAN, compliance letters, and waiver drafts tailored to the user's case | Competing products (if any exist in PH market) give generic advice. Generating the actual letter saves hours and is the moment users see direct value. | HIGH | Must be specific to taxpayer's facts (tax type, period, amounts, grounds). Requires structured output from intake. Legal language must be verified by CPA operator before templates are finalized. HIGH confidence this is a core differentiator. |
| **BIR-stage-specific document checklists** — Per stage, list exactly which BOR documents to attach to a response | Checklists are sticky; users return to verify they have everything. Reduces errors that waive taxpayer rights. | LOW | Can be encoded from BIR RMOs. E.g., protest letter attachments differ between PAN and FAN stages. |
| **Prescription period calculator** — Interactive tool to compute whether assessment is still within prescriptive period (3-year/10-year) and whether waiver was validly executed | Many BIR assessments are time-barred; taxpayers don't know this. This finding alone justifies the consultation fee. | HIGH | Waiver validity rules (RMO 20-90, RMO 14-2016) are nuanced. Must ask for waiver details and apply validity checklist. HIGH confidence this creates strong perceived value. |
| **Waiver validity checker** — Guided assessment of whether a waiver of the statute of limitations is valid (RMO 20-90 requirements: BIR signature, taxpayer signature, date, notarization) | Invalid waivers are a common, winnable defense. Surfacing this finding is immediately valuable. | MEDIUM | Requires knowledge of CTA decisions on waiver invalidity (e.g., CIR v. Systems Technology Institute). |
| **Case history persistence** — Optional account creation so users can return and continue their case as it progresses through stages | BIR disputes take months to years. Users who return find continuity in a persistent case, not a fresh session. | MEDIUM | Not MVP, but a strong retention mechanism. Requires auth system. |
| **Philippine-specific knowledge base (RAG)** — BIR issuances, CTA decisions, NIRC amendments indexed and searchable | No existing AI tool has a curated, current PH tax law knowledge base. This is the core IP of the product. | HIGH | Incremental build: start with NIRC, add major RMOs/RRs, add landmark CTA decisions. High maintenance cost, but the moat. |
| **Grounds mapping** — For each stage, present the specific legal grounds the taxpayer can raise (e.g., for FAN protest: denial of due process, prescription, lack of authority of examiner, improper service) | Taxpayers and even some CPAs are unaware of all available grounds. Surfacing them increases perceived value and outcome quality. | MEDIUM | Can be encoded from NIRC, RMC, and CTA jurisprudence. Requires curated knowledge per stage. |
| **Subpoena Duces Tecum (SDT) guidance module** — Specific guidance on how to respond to SDT, what documents to produce, objection grounds, and third-party subpoena implications | SDT is a distinct and alarming action; most taxpayers don't know if they must comply. No generalist AI tool covers this. | HIGH | SDT from BIR vs. SDT in CTA proceedings differ. Must distinguish. |
| **Collection action guidance** — Warrant of Distraint/Levy (WDL), warrant of garnishment guidance, injunction at CTA | Collection stage is highest anxiety. Users at this stage are desperate. Covering this expands TAM significantly. | HIGH | Prescription for collection (5 years from assessment) is a key defense. Complex: crosses into CTA litigation territory. |
| **Operator review notification** — Notify TaxSpecialista CPA when a case is escalated, with case summary | Enables operator (you) to review complex cases efficiently, instead of starting from scratch. | LOW | Simple email/webhook notification with structured case summary from intake data. |

---

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems. Deliberately excluded to keep scope manageable and liability controlled.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real-time live chat with CPA** | Users want instant human access when anxious | Staffing costs destroy unit economics at PHP 1,000-3,000 price point; sets expectation of immediate response that cannot scale; blurs AI/human boundary | Async escalation queue with 24-48hr SLA. Be explicit about timeline. |
| **Automated BIR e-filing or portal submission** | Users want one-click resolution | Requires BIR eFPS/eBIRForms integration (no public API); creates liability if submission errors occur; regulatory approval unclear | Generate the document, instruct user to file it themselves. Advisory only. |
| **Definitive legal conclusions** ("You will win") | Users want certainty | BIR disputes depend on facts, examiner discretion, and CTA interpretation. Certainty claims create malpractice liability. | Frame all outputs as "grounds to raise," "arguments to consider," "deadlines to be aware of." Never predict outcomes. |
| **Subscription/retainer model at launch** | Recurring revenue is appealing | Subscriptions require ongoing support expectations users will hold you to; complex cases need per-case effort; per-consultation aligns incentive correctly | Per-consultation pricing. Subscriptions possible after product-market fit and support infrastructure is built. |
| **Multi-language Filipino/Tagalog full translation** | Philippine users often use Filipino | Full translation doubles content maintenance burden; LLM naturally handles code-switching; formal tax language is English in Philippine law | Let Claude handle natural code-switching in chat; formal outputs (letters, summaries) in English, which is legally required in BIR submissions anyway. |
| **Integrated payment with BIR (tax payment)** | Users confuse "pay your taxes" with "pay for consultation" | Completely different systems; BIR payment goes to BIR, not to TaxSpecialista; integration is technically and legally out of scope | Be explicit in UI: payment is for the consultation service, not to BIR. |
| **Full CTA litigation support** | Users want end-to-end coverage | CTA proceedings require licensed lawyers; MCLE-mandated legal practice; providing litigation guidance without attorney crosses unauthorized practice of law | Advisory up to FDDA (administrative) level. Flag CTA level cases as requiring licensed counsel. Explicitly out of scope in disclaimers. |
| **Training the AI on user's uploaded financial documents** | Users want AI to read their documents | Privacy risk (BIR cases contain sensitive financial data); data governance complexity; beyond MVP scope | Manual intake via guided questions. Document upload is a v2+ feature with proper security and privacy infrastructure. |

---

## Feature Dependencies

```
[Payment Gate]
    └──enables──> [AI Intake Session starts]
                      └──requires──> [Stage Identification]
                                         └──requires──> [Legal Basis Citations (RAG)]
                                         └──requires──> [Step-by-step Actions]
                                         └──enables──> [Draft Letter Generation]
                                         └──enables──> [Deadline Calculator]
                                         └──enables──> [Grounds Mapping]

[Stage Identification]
    └──feeds──> [Escalation Decision]
                    └──triggers──> [Escalation Queue + Operator Notification]

[Session Complete]
    └──triggers──> [Session Summary / PDF Output]

[Case History Persistence]
    └──requires──> [Auth System (accounts)]
    └──enhances──> [All subsequent sessions for returning users]

[Prescription Period Calculator]
    └──requires──> [Date inputs from Intake]
    └──requires──> [Knowledge: ordinary vs. fraud prescription rules]

[Waiver Validity Checker]
    └──requires──> [Prescription Period Calculator context]
    └──requires──> [Knowledge: RMO 20-90, RMO 14-2016, CTA waiver jurisprudence]

[Draft Letter Generation]
    └──requires──> [Stage Identification]
    └──requires──> [Structured intake data: taxpayer name, TIN, tax type, period, amounts]
    └──requires──> [Legal Basis Citations (for grounds in letter)]
    └──enhances──> [Session Summary / PDF Output] (letter included in PDF)

[BIR-stage-specific Document Checklists]
    └──requires──> [Stage Identification]

[Grounds Mapping]
    └──requires──> [Stage Identification]
    └──enhances──> [Draft Letter Generation] (letter cites the grounds)
```

### Dependency Notes

- **Payment Gate requires no AI**: Payment must complete before any advisory session begins. Can be a static checkout page in v1.
- **Stage Identification is the pivot point**: Every downstream feature — actions, letters, deadlines, escalation — depends on correctly identifying which BIR stage the taxpayer is in. This must be right.
- **Draft Letter Generation requires Structured Intake**: The letter cannot be generic. It must include TIN, taxpayer name, RDO number, assessment amounts, and specific grounds. Intake must explicitly collect these.
- **Prescription Calculator is a standalone feature that also feeds Waiver Checker**: Can be built independently but synergizes.
- **Case History conflicts with Privacy-by-default**: Storing session data requires opt-in consent (Data Privacy Act of 2012, NPC requirements). No persistence without explicit consent.
- **CTA-level guidance conflicts with Unauthorized Practice of Law**: Any feature that extends advisory to CTA filing/litigation crosses into attorney territory. Must be hard-bounded at FDDA stage.

---

## MVP Definition

### Launch With (v1) — LOA Stage Only

Minimum viable product: validate that taxpayers will pay for AI-powered LOA guidance.

- [ ] **Payment gate** — GCash/Maya payment confirmation before session starts (manual verification acceptable)
- [ ] **Conversational intake** — Extract: BIR document type (LOA), RDO, tax type, tax period(s), date of LOA, TIN, business name
- [ ] **Stage identification** — Confirm LOA stage; surface key facts back to user for confirmation
- [ ] **Step-by-step actions for LOA stage** — What to do when you receive an LOA (verify validity, check BIR authority, prepare documents, understand examiner access rights)
- [ ] **LOA validity check** — Is the LOA valid? (Check: Is it a Letter of Authority or merely a Tax Verification Notice? Was it served within 30 days of issuance? Is it signed by authorized Revenue District Officer? Has the one-year period for completing audit lapsed?)
- [ ] **Legal basis citations** — NIRC Section 6, Revenue Memorandum Order 43-90, RMO 26-2010 for LOA validity
- [ ] **Basic deadline display** — When must the examiner complete the audit? (1 year from LOA issuance, extendable by taxpayer waiver)
- [ ] **Advisory disclaimer** — Prominent, non-dismissible on first view
- [ ] **Session summary** — Formatted output of guidance delivered, copyable/printable
- [ ] **Escalation pathway** — Button to request CPA review with intake data pre-populated in the escalation request

### Add After Validation (v1.x)

Add once LOA module is live and paying customers are using it:

- [ ] **PAN stage module** — What to do when you receive a Preliminary Assessment Notice (reply within 15 days, grounds to raise)
- [ ] **FAN/FLD stage module** — Formal protest (request for reconsideration vs. request for reinvestigation), 30-day deadline from FAN receipt
- [ ] **Draft letter generation** — Prototype protest letter templates for PAN reply and FAN protest
- [ ] **Prescription period calculator** — Compute ordinary (3-year) and fraud (10-year) prescription from return filing date
- [ ] **Grounds mapping per stage** — Enumerated legal grounds the taxpayer can raise at each stage
- [ ] **Automated payment verification** — GCash/Maya webhook or PayMongo integration

### Future Consideration (v2+)

Defer until product-market fit is established:

- [ ] **FDDA module** — Final Decision on Disputed Assessment and CTA appeal pathway (flags need for licensed attorney)
- [ ] **SDT (Subpoena Duces Tecum) module** — When received from BIR or CTA
- [ ] **Collection action module** — Warrant of Distraint/Levy, garnishment, injunction
- [ ] **Waiver validity checker** — Detailed RMO 20-90 compliance checklist
- [ ] **Case history and accounts** — Returning users, persistent case records
- [ ] **Philippine RAG knowledge base** — Indexed BIR issuances, CTA decisions
- [ ] **Document upload** — Let users upload LOA/PAN/FAN PDFs for AI to read (requires security/privacy infrastructure)
- [ ] **Operator dashboard** — Track escalation queue, case statuses, revenue

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Conversational intake | HIGH | MEDIUM | P1 |
| Stage identification (LOA) | HIGH | MEDIUM | P1 |
| Step-by-step actions (LOA) | HIGH | LOW | P1 |
| LOA validity check | HIGH | LOW | P1 |
| Legal basis citations (NIRC/RMO) | HIGH | HIGH | P1 |
| Deadline display (audit completion) | HIGH | LOW | P1 |
| Advisory disclaimer | HIGH | LOW | P1 |
| Payment gate (manual verification) | HIGH | LOW | P1 |
| Session summary / output | HIGH | MEDIUM | P1 |
| Escalation pathway (async) | HIGH | LOW | P1 |
| PAN stage module | HIGH | MEDIUM | P2 |
| FAN protest module | HIGH | MEDIUM | P2 |
| Draft letter generation | HIGH | HIGH | P2 |
| Prescription calculator | HIGH | HIGH | P2 |
| Grounds mapping | MEDIUM | MEDIUM | P2 |
| Automated payment (PayMongo) | MEDIUM | MEDIUM | P2 |
| Waiver validity checker | HIGH | HIGH | P3 |
| FDDA / CTA referral module | MEDIUM | HIGH | P3 |
| SDT module | MEDIUM | HIGH | P3 |
| Collection module | MEDIUM | HIGH | P3 |
| Case history / accounts | MEDIUM | HIGH | P3 |
| RAG knowledge base (BIR issuances) | HIGH | HIGH | P3 |
| Document upload | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for MVP launch
- P2: Add after first paying customers validate demand
- P3: Defer until product-market fit established

---

## Competitor Feature Analysis

| Feature | Generic AI chatbots (ChatGPT, etc.) | Philippine legal tech (if any) | Our Approach |
|---------|--------------------------------------|-------------------------------|--------------|
| BIR-specific stage logic | None — general tax knowledge only | Unknown — no known competitor confirmed | Purpose-built stage state machine |
| Philippine legal citation (NIRC, RMOs) | Hallucination-prone; no RAG | Unknown | RAG-backed, CPA-operator verified |
| Draft protest letters | Generic templates; not Philippines-specific | Unknown | Stage-specific, fact-populated |
| Prescription period calculator | Manual computation with errors | Unknown | Automated with Philippine-specific rules |
| Waiver validity check | Unknown; no specialized logic | Unknown | RMO 20-90 / RMO 14-2016 compliance checklist |
| Philippine payment methods | Not applicable | Unknown | GCash + Maya + bank transfer native |
| Escalation to PH tax professional | None | Unknown | Async escalation queue to CPA operator |
| SDT guidance | Generic; no Philippine BIR context | Unknown | Philippine SDT-specific module (v2+) |

**Confidence note on competitor analysis:** LOW confidence — no web search available to verify Philippine legal tech landscape. Treat competitor column as hypothesis, not confirmed finding. Validate by searching "Philippines BIR tax chatbot," "Philippine legal chatbot," "Philippine tax advisory AI" before launch.

---

## Philippine BIR Dispute Stage Reference

For feature accuracy, the dispute stages and their key features:

| Stage | Trigger | Key Deadlines | User Action | Legal Basis |
|-------|---------|---------------|-------------|-------------|
| **LOA (Letter of Authority)** | BIR audit initiation | Examiner must complete within 120 days (RMC 40-2003); LOA expires if not completed | Verify LOA validity; produce documents within scope | NIRC Sec. 6; RMO 43-90; RMO 26-2010 |
| **Subpoena Duces Tecum (SDT)** | Taxpayer non-compliance with LOA document request | Response deadline stated in SDT | Comply or file objection; non-compliance is a criminal offense | NIRC Sec. 5; RR 12-99 |
| **PAN (Preliminary Assessment Notice)** | BIR examiner issues findings | 15 days to reply | File written reply contesting findings; waiving reply is waiving due process defense | NIRC Sec. 228; RR 18-2013 |
| **FAN/FLD (Formal Assessment Notice / Formal Letter of Demand)** | BIR issues formal tax deficiency assessment | 30 days from receipt to file protest | File protest (Request for Reconsideration or Request for Reinvestigation) | NIRC Sec. 228; RR 18-2013 |
| **FDDA (Final Decision on Disputed Assessment)** | BIR denies protest | 30 days to appeal to CTA Division | Appeal to Court of Tax Appeals; requires licensed attorney | NIRC Sec. 228; RA 9282 |
| **Collection (WDL/Garnishment)** | Assessment becomes final; BIR enforces | 5 years from assessment date for collection prescription | Seek injunction at CTA; pay under protest; negotiate installment | NIRC Sec. 222; NIRC Sec. 207 |

**Confidence:** HIGH for stage names and general sequence (NIRC knowledge). MEDIUM for specific day counts — verify RR 18-2013 and RMC 40-2003 for exact current deadlines before encoding into the system.

---

## Sources

- PROJECT.md — Project requirements and constraints (confirmed)
- Training knowledge: Philippine NIRC (National Internal Revenue Code), BIR Revenue Regulations 18-2013, RMO 43-90, RMO 26-2010, RMO 20-90 — MEDIUM confidence (training data, unverified against current BIR issuances)
- Training knowledge: AI legal/tax chatbot patterns from U.S. legal tech market (DoNotPay, Harvey, CoCounsel, Spellbook) — MEDIUM confidence; Philippine market dynamics may differ significantly
- Training knowledge: Court of Tax Appeals (CTA) procedural rules — MEDIUM confidence
- No live web sources consulted (WebSearch and WebFetch unavailable in this session)

**Gap:** Competitor analysis for Philippine market is entirely unverified. Before launch, validate: are there existing Philippine AI tax advisory tools? What does the Philippine legal tech startup landscape look like?

---
*Feature research for: AI-powered BIR tax dispute advisory chatbot (Philippine tax law)*
*Researched: 2026-04-09*
