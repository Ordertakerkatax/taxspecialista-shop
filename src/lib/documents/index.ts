// Types
export type { LetterContent, ProtestLetterInput, ComplianceLetterInput, AcknowledgmentLetterInput, BirCorrespondenceType } from "./letter-types";
export { REGLEMENTARY_PERIODS, CORRESPONDENCE_LABELS, INTENDED_ACTIONS } from "./letter-types";

// Builders
export { buildProtestLetter, buildComplianceLetter, buildAcknowledgmentLetter } from "./letter-builder";

// PDF generation
export { letterToPdf } from "./pdf-generator";

// Summary PDF generation
export { generateSummaryPdf } from "./summary-generator";
export type { ConsultationSummary } from "./summary-generator";

/**
 * Encodes a LetterContent object as a base64url string for use in the
 * /api/documents/generate?token= query param.
 *
 * Used by the AI tool definitions in Plan 02 to create the download link token.
 */
export function encodeLetterContent(content: import("./letter-types").LetterContent): string {
  return Buffer.from(JSON.stringify(content)).toString("base64url");
}
