/**
 * GET /api/documents/generate
 *
 * Session-gated PDF download endpoint per D-02, D-05, D-06.
 *
 * Query params:
 *   session  — consultation session token (validated via validateSession)
 *   token    — base64url-encoded LetterContent JSON (produced by encodeLetterContent)
 *
 * Security (STRIDE mitigations T-04-01 through T-04-05):
 *   - Session validated before any PDF generation (T-04-01, T-04-05)
 *   - Token decoded and required fields validated before PDF generation (T-04-02)
 *   - Generic error message on failure, no stack trace exposure (T-04-03)
 *   - URL length limits bound token size naturally (T-04-04)
 *
 * Documents are ephemeral (D-06): generated on demand, not stored.
 * Cache-Control: no-store prevents caching of sensitive legal draft documents.
 */

// PDFKit requires the Node.js runtime — not compatible with Edge
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { validateSession } from "@/lib/session";
import { letterToPdf } from "@/lib/documents";
import type { LetterContent } from "@/lib/documents";

/** Minimum required fields for a valid LetterContent token. */
const REQUIRED_FIELDS: (keyof LetterContent)[] = [
  "date",
  "addresseeName",
  "bodyParagraphs",
  "signatoryName",
  "letterType",
  "prayer",
  "citations",
];

const VALID_LETTER_TYPES = ["protest", "compliance", "nod-response", "acknowledgment"];
const MAX_BODY_PARAGRAPHS = 50;
const MAX_PARAGRAPH_LENGTH = 5000;
const MAX_STRING_FIELD_LENGTH = 500;
const MAX_PRAYER_LENGTH = 3000;
const MAX_CITATIONS = 20;

function isValidLetterContent(obj: unknown): obj is LetterContent {
  if (!obj || typeof obj !== "object") return false;
  const record = obj as Record<string, unknown>;
  for (const field of REQUIRED_FIELDS) {
    if (!(field in record)) return false;
  }
  // letterType must be a known type
  if (!VALID_LETTER_TYPES.includes(record.letterType as string)) return false;
  // bodyParagraphs: array with size and content limits
  if (!Array.isArray(record.bodyParagraphs)) return false;
  if (record.bodyParagraphs.length > MAX_BODY_PARAGRAPHS) return false;
  for (const p of record.bodyParagraphs) {
    if (typeof p !== "string" || p.length > MAX_PARAGRAPH_LENGTH) return false;
  }
  // String field length limits
  if (typeof record.signatoryName === "string" && record.signatoryName.length > MAX_STRING_FIELD_LENGTH) return false;
  if (typeof record.addresseeName === "string" && record.addresseeName.length > MAX_STRING_FIELD_LENGTH) return false;
  if (typeof record.subjectLine === "string" && record.subjectLine.length > MAX_STRING_FIELD_LENGTH) return false;
  if (typeof record.prayer === "string" && (record.prayer as string).length > MAX_PRAYER_LENGTH) return false;
  // Citations: array with size limit
  if (Array.isArray(record.citations) && record.citations.length > MAX_CITATIONS) return false;
  return true;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionToken = searchParams.get("session");
  const letterToken = searchParams.get("token");

  // Both params required (T-04-01)
  if (!sessionToken || !letterToken) {
    return Response.json(
      { error: "Session token and document token required" },
      { status: 401 }
    );
  }

  // Validate session before any document generation (T-04-01, T-04-05)
  let sessionResult;
  try {
    sessionResult = await validateSession(sessionToken);
  } catch (e) {
    console.error("[documents] Session validation error:", e);
    return Response.json(
      { error: "Failed to generate document" },
      { status: 500 }
    );
  }

  if (sessionResult.reason === "db_error") {
    return Response.json(
      { error: "Temporary service issue. Please try again in a moment." },
      { status: 503 }
    );
  }

  if (sessionResult.reason === "not_found") {
    return Response.json({ error: "Invalid session" }, { status: 403 });
  }

  if (sessionResult.reason === "expired") {
    return Response.json({ error: "Session expired" }, { status: 403 });
  }

  // Decode and validate the letter content token (T-04-02)
  let letterContent: LetterContent;
  try {
    const decoded = Buffer.from(letterToken, "base64url").toString("utf-8");
    const parsed: unknown = JSON.parse(decoded);
    if (!isValidLetterContent(parsed)) {
      return Response.json({ error: "Invalid document token" }, { status: 400 });
    }
    letterContent = parsed;
  } catch {
    return Response.json({ error: "Invalid document token" }, { status: 400 });
  }

  // Generate the PDF (T-04-03: generic error on failure)
  try {
    console.log("[documents] Starting PDF generation for letterType:", letterContent.letterType);
    const pdfBuffer = await letterToPdf(letterContent);
    console.log("[documents] PDF generated successfully, size:", pdfBuffer.length, "bytes");
    const filenameMap: Record<string, string> = {
      protest: "draft-protest-letter.pdf",
      compliance: "draft-compliance-letter.pdf",
      "nod-response": "draft-nod-response-letter.pdf",
      acknowledgment: "draft-acknowledgment-letter.pdf",
    };
    const filename = filenameMap[letterContent.letterType] ?? "draft-letter.pdf";

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        // Ephemeral documents (D-06): no caching of sensitive legal drafts
        "Cache-Control": "no-store",
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (e) {
    // Log the actual error for debugging (visible in Vercel function logs)
    const err = e as Error;
    console.error("[documents] PDF generation error:", err.message);
    console.error("[documents] PDF error stack:", err.stack);
    // Generic error — do not expose stack traces or internal paths (T-04-03)
    return Response.json(
      { error: "Failed to generate document" },
      { status: 500 }
    );
  }
}
