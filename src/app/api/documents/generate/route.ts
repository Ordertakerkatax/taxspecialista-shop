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

function isValidLetterContent(obj: unknown): obj is LetterContent {
  if (!obj || typeof obj !== "object") return false;
  const record = obj as Record<string, unknown>;
  for (const field of REQUIRED_FIELDS) {
    if (!(field in record)) return false;
  }
  // bodyParagraphs must be an array
  if (!Array.isArray(record.bodyParagraphs)) return false;
  // letterType must be protest, compliance, or acknowledgment
  if (record.letterType !== "protest" && record.letterType !== "compliance" && record.letterType !== "acknowledgment") {
    return false;
  }
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
  } catch {
    return Response.json(
      { error: "Failed to generate document" },
      { status: 500 }
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
    const pdfBuffer = await letterToPdf(letterContent);
    const filenameMap: Record<string, string> = {
      protest: "draft-protest-letter.pdf",
      compliance: "draft-compliance-letter.pdf",
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
  } catch {
    // Generic error — do not expose stack traces or internal paths (T-04-03)
    return Response.json(
      { error: "Failed to generate document" },
      { status: 500 }
    );
  }
}
