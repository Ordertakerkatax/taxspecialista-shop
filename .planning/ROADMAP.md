# Roadmap: BIR Tax Dispute Advisory Chatbot

## Overview

The product ships in six phases. Phase 1 lays the technical foundation and opens a payment gate — no consultation begins without it. Phase 2 delivers the core advisory engine: conversational intake, stage identification, legal citations, and actionable steps (LOA scope only). Phase 3 adds the deterministic deadline and prescription machinery that is too high-stakes to leave to LLM inference. Phase 4 generates draft protest and compliance letters. Phase 5 builds the escalation queue and CPA admin dashboard. Phase 6 adds optional user accounts and consultation history. Each phase is independently verifiable; no phase ships partial features.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Payment Gate** - Next.js app, database, Clerk auth, manual GCash/bank payment flow with session creation
- [ ] **Phase 2: Chat Core & Advisory** - Conversational intake, BIR stage identification, LOA advisory, legal citations, actionable steps, disclaimers
- [ ] **Phase 3: Deadline & Legal Precision** - Deadline display, deterministic prescription calculator, BIR waiver validity checker
- [ ] **Phase 4: Document Generation** - Draft protest letter and compliance reply generation with DRAFT watermark
- [ ] **Phase 5: Escalation & Admin** - AI complexity detection, CPA review queue, email notifications
- [ ] **Phase 6: User Accounts & History** - Optional account creation, consultation history, session summary export

## Phase Details

### Phase 1: Foundation & Payment Gate
**Goal**: A taxpayer can pay for a consultation and receive a gated session that unlocks the chat
**Depends on**: Nothing (first phase)
**Requirements**: PAY-01, PAY-02
**Success Criteria** (what must be TRUE):
  1. User can submit a GCash payment reference and receive a session token that unlocks the chat
  2. User can submit a bank transfer confirmation and receive a session token that unlocks the chat
  3. Attempting to access the chat without a valid session token returns a payment-required screen
  4. Admin can see incoming payment submissions and manually verify them
**Plans**: TBD
**UI hint**: yes

### Phase 2: Chat Core & Advisory
**Goal**: A taxpayer with a valid session can describe their BIR situation and receive legally-grounded, stage-specific guidance
**Depends on**: Phase 1
**Requirements**: INTK-01, INTK-02, INTK-03, ADV-01, ADV-02, ADV-03, ADV-04
**Success Criteria** (what must be TRUE):
  1. User can converse with the AI and have their case details (document type, dates, tax type/amount, prior actions) extracted through dialogue
  2. System correctly identifies which BIR stage the taxpayer is in (LOA, PAN, FAN, FDDA, SDT, collection)
  3. System checks and communicates LOA validity issues (authority, scope, dates, proper issuance)
  4. Every advisory response cites specific NIRC sections, RMOs, or RRs applicable to the situation
  5. Response includes a disclaimer that output is not formal legal or tax advice before final guidance is shown
**Plans**: TBD
**UI hint**: yes

### Phase 3: Deadline & Legal Precision
**Goal**: A taxpayer can see their exact response deadlines and prescription status — computed by code, not guessed by the AI
**Depends on**: Phase 2
**Requirements**: DL-01, DL-02, DL-03
**Success Criteria** (what must be TRUE):
  1. User sees their response deadlines and key dates displayed within the advisory session (e.g., 30-day reply period for LOA)
  2. Prescription period is calculated by a deterministic code module and the result is shown with the computation basis (start date, applicable rule)
  3. User learns whether any BIR waiver of the statute of limitations in their case is valid or defective, with the legal basis cited
**Plans**: TBD

### Phase 4: Document Generation
**Goal**: A taxpayer can download a draft protest or compliance letter ready for review and filing
**Depends on**: Phase 3
**Requirements**: DOC-01, DOC-02
**Success Criteria** (what must be TRUE):
  1. User can request and download a draft protest letter generated from their intake facts, with a visible DRAFT watermark on every page
  2. User can request and download a draft compliance reply letter generated from their intake facts, with a visible DRAFT watermark on every page
  3. Generated documents include the relevant NIRC/RMO citations drawn from the advisory session
**Plans**: TBD
**UI hint**: yes

### Phase 5: Escalation & Admin
**Goal**: Complex cases are automatically flagged, queued for CPA review, and the CPA is notified without manual monitoring
**Depends on**: Phase 2
**Requirements**: ESC-01, ESC-02, ESC-03
**Success Criteria** (what must be TRUE):
  1. AI detects and flags a complex case based on a structured complexity signal (e.g., large tax amount, contested legal grounds, SDT involvement) before completing the advisory response
  2. Flagged case appears in the admin dashboard queue with case summary and intake details visible to the CPA
  3. CPA receives an email notification when a new case is added to the escalation queue
**Plans**: TBD

### Phase 6: User Accounts & History
**Goal**: Returning taxpayers can optionally create an account to access their past consultations and export their findings
**Depends on**: Phase 1
**Requirements**: ACCT-01, ACCT-02
**Success Criteria** (what must be TRUE):
  1. User can optionally create an account with email and password (Clerk) and link a completed consultation to their account
  2. Returning user can log in and view a list of their past consultation sessions
  3. User can export a summary of any consultation's key findings (stage, deadlines, grounds, citations) as a downloadable document
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Payment Gate | 0/TBD | Not started | - |
| 2. Chat Core & Advisory | 0/TBD | Not started | - |
| 3. Deadline & Legal Precision | 0/TBD | Not started | - |
| 4. Document Generation | 0/TBD | Not started | - |
| 5. Escalation & Admin | 0/TBD | Not started | - |
| 6. User Accounts & History | 0/TBD | Not started | - |
