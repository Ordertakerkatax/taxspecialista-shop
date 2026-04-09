# Requirements: BIR Tax Dispute Advisory Chatbot

**Defined:** 2026-04-09
**Core Value:** Taxpayers facing BIR actions get immediate, legally-grounded guidance on what to do next — with specific NIRC sections, RMOs, and RRs cited — so they can respond correctly and within deadlines.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Payment & Access

- [ ] **PAY-01**: User can pay for consultation via GCash (manual payment verification)
- [ ] **PAY-02**: User can pay for consultation via bank transfer

### Case Intake

- [ ] **INTK-01**: AI conversationally extracts case details (BIR document type, key dates, tax type/amount, prior actions taken)
- [ ] **INTK-02**: System identifies which BIR stage the taxpayer is in (LOA, PAN, FAN, FDDA, SDT, collection)
- [ ] **INTK-03**: System checks LOA validity (authority, scope, dates, proper issuance)

### Advisory & Legal Basis

- [ ] **ADV-01**: System cites specific NIRC sections, RMOs, RRs relevant to the client's situation
- [ ] **ADV-02**: System provides step-by-step actionable items tailored to the client's BIR stage
- [ ] **ADV-03**: System displays clear advisory disclaimers (not formal legal/tax advice)
- [ ] **ADV-04**: System maps client facts to applicable legal defenses and grounds

### Deadline & Prescription

- [ ] **DL-01**: System displays response deadlines and key dates for the client's BIR stage
- [ ] **DL-02**: Deterministic prescription period calculator (code-based, not LLM inference)
- [ ] **DL-03**: System checks validity of BIR waivers of statute of limitations

### Document Generation

- [ ] **DOC-01**: System generates draft protest letters with DRAFT watermark
- [ ] **DOC-02**: System generates draft compliance reply letters with DRAFT watermark

### Escalation & Review

- [ ] **ESC-01**: AI detects complex cases based on structured complexity signal
- [ ] **ESC-02**: Escalated cases are queued in admin dashboard for CPA review
- [ ] **ESC-03**: CPA receives email notification when a case is escalated

### User Accounts & History

- [ ] **ACCT-01**: User can optionally create an account to save consultation history
- [ ] **ACCT-02**: User can view/export a summary of consultation findings

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Expanded BIR Stages

- **STAGE-01**: Full PAN/FAN/FDDA advisory module (beyond stage identification)
- **STAGE-02**: Subpoena Duces Tecum compliance and quashing guidance
- **STAGE-03**: Collection stage advisory (warrants of distraint/levy, compromise, abatement)

### Enhanced Intake

- **INTK-04**: Document upload with AI extraction (OCR BIR notices)

### Payment Automation

- **PAY-03**: Automated payment gateway via PayMongo (GCash/Maya/bank transfer)
- **PAY-04**: Consultation receipts and payment history

### Advanced Features

- **ADV-05**: CTA decision references and case law citations
- **RAG-01**: Full RAG pipeline with curated BIR issuance knowledge base
- **NOTF-01**: In-app notifications for case status updates

### Compliance

- **COMP-01**: NPC registration as Personal Information Controller
- **COMP-02**: RA 10173 compliant privacy notice and data handling

## Out of Scope

| Feature | Reason |
|---------|--------|
| CTA litigation guidance | Crosses into unauthorized legal practice; must be bounded at FDDA stage |
| Definitive outcome predictions | Creates malpractice liability; outputs frame as "grounds to raise" not guarantees |
| Real-time live chat with CPA | Escalation is async queue; CPA availability is not real-time |
| Automated BIR e-filing | Advisory only; client acts on guidance themselves |
| Mobile native app | Web-first with responsive design; native app deferred indefinitely |
| Multi-language localization | English and Filipino naturally handled by LLM; no formal localization needed |
| OAuth/social login | Email/password via Clerk sufficient for optional accounts |
| Credit/token billing system | Per-consultation pricing is simpler; credit system adds complexity |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PAY-01 | Phase 1 | Pending |
| PAY-02 | Phase 1 | Pending |
| INTK-01 | Phase 2 | Pending |
| INTK-02 | Phase 2 | Pending |
| INTK-03 | Phase 2 | Pending |
| ADV-01 | Phase 2 | Pending |
| ADV-02 | Phase 2 | Pending |
| ADV-03 | Phase 2 | Pending |
| ADV-04 | Phase 2 | Pending |
| DL-01 | Phase 3 | Pending |
| DL-02 | Phase 3 | Pending |
| DL-03 | Phase 3 | Pending |
| DOC-01 | Phase 4 | Pending |
| DOC-02 | Phase 4 | Pending |
| ESC-01 | Phase 5 | Pending |
| ESC-02 | Phase 5 | Pending |
| ESC-03 | Phase 5 | Pending |
| ACCT-01 | Phase 6 | Pending |
| ACCT-02 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-04-09*
*Last updated: 2026-04-09 after roadmap creation — all 18 requirements mapped*
