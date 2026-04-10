---
phase: "04"
plan: "01"
subsystem: "document-generation"
tags: ["pdf", "pdfkit", "letter-generation", "draft-watermark", "api"]
dependency_graph:
  requires:
    - "02-01: validateSession() in src/lib/session.ts"
    - "02-01: consultationSessions schema in src/db/schema.ts"
  provides:
    - "src/lib/documents/letter-types.ts: LetterContent interfaces and builders"
    - "src/lib/documents/pdf-generator.ts: generateLetterPdf() returning Buffer"
    - "src/app/api/documents/generate/route.ts: GET endpoint for PDF download"
  affects:
    - "Chat interface — future plans will add download buttons that call this endpoint"
tech_stack:
  added:
    - "pdfkit@0.18.0 — PDF generation with bufferPages support"
    - "@types/pdfkit@0.17.5 — TypeScript types for pdfkit"
  patterns:
    - "bufferPages: true + switchToPage() loop for per-page watermarking"
    - "base64url decode → JSON.parse → type guard → buildLetter() → generateLetterPdf()"
    - "runtime=nodejs on API route to avoid Edge runtime incompatibility with pdfkit"
    - "ArrayBuffer (not Buffer/Uint8Array) as Response body for Web API BodyInit compatibility"
key_files:
  created:
    - "src/lib/documents/letter-types.ts"
    - "src/lib/documents/pdf-generator.ts"
    - "src/app/api/documents/generate/route.ts"
  modified:
    - "package.json (added pdfkit, @types/pdfkit)"
    - "package-lock.json"
decisions:
  - "Used bufferPages: true + switchToPage() loop to stamp DRAFT watermark on every page — only approach that works for multi-page PDFs in PDFKit"
  - "Letter content passed as base64url-encoded JSON in query param — avoids POST body for a GET download endpoint, keeps URL shareable within session"
  - "runtime=nodejs declared on API route — pdfkit uses Node.js streams, incompatible with Edge runtime"
  - "ArrayBuffer cast used for Response body — TypeScript DOM lib types for BodyInit do not include Uint8Array but do include ArrayBuffer"
  - "Two letter types implemented: loa_reply (LOA Reply letter) and protest_letter (PAN/FAN/FDDA protest)"
metrics:
  duration: "~20 minutes"
  completed_date: "2026-04-10"
  tasks_completed: 3
  files_created: 3
  files_modified: 2
---

# Phase 04 Plan 01: Document Generation — Letter Types, PDF Generator, and Download Endpoint Summary

**One-liner:** PDFKit-based letter PDF generator with per-page DRAFT watermark, LOA Reply and Protest Letter builder functions, and a session-gated GET download endpoint using base64url-encoded letter content.

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Letter type interfaces + builder functions | `ce377a9d` | `src/lib/documents/letter-types.ts` |
| 2 | PDFKit PDF generator with DRAFT watermark | `2e7155fd` | `src/lib/documents/pdf-generator.ts`, `package.json` |
| 3 | GET /api/documents/generate endpoint | `1b5c2f22` | `src/app/api/documents/generate/route.ts` |

## What Was Built

### Task 1 — Letter Type Interfaces and Builder Functions (`src/lib/documents/letter-types.ts`)

Defined the full data model for two letter types:

- **`LoaReplyContent`** — For responding to a Letter of Authority, capturing LOA reference number, issued date, revenue officer name, grounds for reply, and documents submitted.
- **`ProtestLetterContent`** — For protesting a PAN, FAN, or FDDA assessment, capturing assessment type, reference number, assessment date, grounds for protest, supporting facts, and relief sought.
- **`LetterMetadata`** — Shared fields: taxpayer name, TIN, address, BIR office, document received date, tax type, taxable period, and optional assessed amount.
- **`Citation`** — Numbered legal citations (e.g., `[1] NIRC Section 228 — Assessment Notice Requirements`).
- **`buildLoaReplyLetter()`** — Maps `LoaReplyContent` to a `LoaReplyLetter` structure with formatted sections, subject, recipient block, salutation, and disclaimer.
- **`buildProtestLetter()`** — Maps `ProtestLetterContent` to a `ProtestLetter` structure with a `reliefSection` (prayer) in addition to standard sections.
- **`buildLetter()`** — Dispatch entry point accepting `LetterContent` union type.
- DRAFT disclaimer footer applied to both letter types, clearly marking the document as not formal legal/tax advice.

### Task 2 — PDFKit PDF Generator (`src/lib/documents/pdf-generator.ts`)

- **`generateLetterPdf(letter: Letter): Promise<Buffer>`** — Core function returning a PDF binary buffer.
- Uses `bufferPages: true` so PDFKit holds all pages in memory before finalizing.
- After writing all content, iterates every buffered page with `doc.switchToPage(i)` and calls `drawDraftWatermark()` — ensuring the watermark appears on every page regardless of document length.
- **`drawDraftWatermark()`** — Uses `doc.save()` / `doc.restore()`, `doc.translate()` to page center, `doc.rotate(-45)` for diagonal text, and `fillOpacity(0.35)` for a light grey watermark that doesn't obscure content.
- **Letterhead** — "TaxSpecialista Consult" bold heading with subtitle and horizontal rule.
- Layout: US Letter (612 × 792 pt), 1-inch margins, Helvetica fonts, justified body text, 9pt citations and disclaimer in grey.
- Relief section rendered only for protest letters (`ProtestLetter` type guard).
- Citations section with a partial horizontal rule separator before the numbered list.
- Disclaimer always rendered last; new page added if less than 80pt remains on current page.
- Installed `pdfkit@0.18.0` and `@types/pdfkit@0.17.5`.

### Task 3 — GET /api/documents/generate Endpoint (`src/app/api/documents/generate/route.ts`)

Flow:
1. Extract `sessionToken` query param → call `validateSession()` → return 401 or 403 on failure.
2. Extract `content` query param (base64url-encoded JSON) → decode to `LetterContent` → return 400 on malformed input.
3. Type guard checks `content.type` is `"loa_reply"` or `"protest_letter"` → return 400 for unknown types.
4. Call `buildLetter()` → `generateLetterPdf()` → return PDF as `ArrayBuffer` response with `application/pdf` content type.
5. `Content-Disposition: attachment` with a filename including TIN and date (e.g., `LOA-Reply-DRAFT-123456789-2026-04-10.pdf`).
6. `Cache-Control: no-store` to prevent browser or CDN caching of sensitive draft documents.
7. `export const runtime = "nodejs"` — required because pdfkit uses Node.js streams, which are incompatible with the Edge runtime.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript BodyInit incompatibility with Buffer and Uint8Array**
- **Found during:** Task 3 TypeScript check
- **Issue:** TypeScript DOM lib's `BodyInit` type does not include `Buffer` or `Uint8Array<ArrayBufferLike>` as valid `Response` body types.
- **Fix:** Used `pdfBuffer.buffer.slice(byteOffset, byteOffset + byteLength) as ArrayBuffer` to extract a plain `ArrayBuffer`, which is a valid `BodyInit`.
- **Files modified:** `src/app/api/documents/generate/route.ts`
- **Commit:** `1b5c2f22`

## Known Stubs

None. The letter builder functions use real intake data passed via `LetterContent`; no hardcoded placeholder data flows to the PDF output. The signature block contains `[Taxpayer / Authorized Representative]` and `[Taxpayer TIN]` placeholders — these are intentional template blanks for the human to fill in before filing, not data stubs.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: data-exposure | `src/app/api/documents/generate/route.ts` | Query params (including base64url letter content with taxpayer PII) are logged in server access logs. Recommend redacting `content` param in production log config. |

## Self-Check: PASSED

- `src/lib/documents/letter-types.ts` — exists, committed `ce377a9d`
- `src/lib/documents/pdf-generator.ts` — exists, committed `2e7155fd`
- `src/app/api/documents/generate/route.ts` — exists, committed `1b5c2f22`
- TypeScript check passes with no errors in new files (pre-existing test errors in `admin-actions.test.ts` are out of scope)
