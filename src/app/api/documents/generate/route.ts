/**
 * GET /api/documents/generate
 *
 * Query parameters:
 *   - sessionToken: string  — validates the consultation session
 *   - content: string       — base64url-encoded JSON LetterContent
 *
 * Returns a PDF binary (application/pdf) with Content-Disposition: attachment.
 *
 * Error codes:
 *   400 — missing or malformed parameters
 *   401 — missing session token
 *   403 — invalid or expired session
 *   500 — PDF generation failure
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateSession } from "@/lib/session";
import { buildLetter, type LetterContent } from "@/lib/documents/letter-types";
import { generateLetterPdf } from "@/lib/documents/pdf-generator";

export const runtime = "nodejs"; // pdfkit requires Node.js runtime, not Edge

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  // --------------------------------------------------------
  // 1. Validate session token
  // --------------------------------------------------------
  const sessionToken = searchParams.get("sessionToken");

  if (!sessionToken) {
    return NextResponse.json(
      { error: "Session token is required" },
      { status: 401 }
    );
  }

  const sessionResult = await validateSession(sessionToken);

  if (sessionResult.reason === "not_found") {
    return NextResponse.json(
      { error: "Invalid session token" },
      { status: 403 }
    );
  }

  if (sessionResult.reason === "expired") {
    return NextResponse.json(
      { error: "Session has expired" },
      { status: 403 }
    );
  }

  // --------------------------------------------------------
  // 2. Decode base64url letter content
  // --------------------------------------------------------
  const encodedContent = searchParams.get("content");

  if (!encodedContent) {
    return NextResponse.json(
      { error: "Letter content is required (base64url-encoded JSON)" },
      { status: 400 }
    );
  }

  let letterContent: LetterContent;

  try {
    // base64url → base64 → JSON
    const base64 = encodedContent
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(encodedContent.length + ((4 - (encodedContent.length % 4)) % 4), "=");

    const jsonString = Buffer.from(base64, "base64").toString("utf-8");
    letterContent = JSON.parse(jsonString) as LetterContent;
  } catch {
    return NextResponse.json(
      { error: "Invalid letter content: could not decode or parse base64url JSON" },
      { status: 400 }
    );
  }

  // Basic type guard
  if (!letterContent || !letterContent.type) {
    return NextResponse.json(
      { error: "Invalid letter content: missing type field" },
      { status: 400 }
    );
  }

  const validTypes = ["loa_reply", "protest_letter"];
  if (!validTypes.includes(letterContent.type)) {
    return NextResponse.json(
      { error: `Invalid letter type: must be one of ${validTypes.join(", ")}` },
      { status: 400 }
    );
  }

  // --------------------------------------------------------
  // 3. Build letter structure and generate PDF
  // --------------------------------------------------------
  try {
    const letter = buildLetter(letterContent);
    const pdfBuffer = await generateLetterPdf(letter);

    const filename = buildFilename(letterContent);

    // Use ArrayBuffer for Web API Response compatibility
    const arrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength
    ) as ArrayBuffer;

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.byteLength),
        // Prevent caching of sensitive documents
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  } catch (error) {
    console.error("[documents/generate] PDF generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

// ============================================================
// Helpers
// ============================================================

function buildFilename(content: LetterContent): string {
  const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const tin = content.metadata.taxpayerTin.replace(/[^0-9]/g, "");

  switch (content.type) {
    case "loa_reply":
      return `LOA-Reply-DRAFT-${tin}-${timestamp}.pdf`;
    case "protest_letter":
      return `Protest-Letter-DRAFT-${tin}-${content.assessmentType}-${timestamp}.pdf`;
    default:
      return `Letter-DRAFT-${timestamp}.pdf`;
  }
}
