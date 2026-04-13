/**
 * BIR Waiver of Statute of Limitations validity checker.
 *
 * Encodes waiver defect criteria from RMO 20-90, RDAO 05-01, and CTA
 * jurisprudence as a pure, deterministic function.
 *
 * The four defect categories:
 * 1. UNAUTHORIZED_SIGNATORY — signatory not in the authorized list (RMO 20-90)
 * 2. NO_DEFINITE_EXPIRY — waiver has no specific expiry date (RDAO 05-01)
 * 3. SIGNED_AFTER_PRESCRIPTION_EXPIRED — waiver executed after prescription had lapsed (NIRC 203/222)
 * 4. VAGUE_TAX_TYPE_COVERAGE — tax types described in generic/blanket terms (CTA jurisprudence)
 *
 * No external dependencies. No side effects.
 */

import { parseFlexibleDate } from "./parse-flexible-date";

export type WaiverDefectType =
  | "UNAUTHORIZED_SIGNATORY"
  | "NO_DEFINITE_EXPIRY"
  | "SIGNED_AFTER_PRESCRIPTION_EXPIRED"
  | "VAGUE_TAX_TYPE_COVERAGE";

export interface WaiverDefect {
  /** Category of defect found. */
  defectType: WaiverDefectType;
  /** Human-readable explanation of the specific defect. */
  description: string;
  /** Legal basis for this defect category. */
  legalBasis: string;
}

export interface WaiverInput {
  /** Date the waiver was signed (ISO 8601 YYYY-MM-DD). */
  waiverSignedDate: string;
  /** Expiry date on the waiver (ISO 8601 YYYY-MM-DD), or null if open-ended. */
  waiverExpiryDate: string | null;
  /** Role/title of the BIR official who signed the waiver on behalf of the Commissioner. */
  signatoryRole: string;
  /** List of tax types covered by the waiver (e.g., ["Income Tax", "VAT"]). */
  taxTypesCovered: string[];
  /**
   * The prescription expiry date that was in effect at the time the waiver was signed
   * (ISO 8601 YYYY-MM-DD). Used to detect if waiver was signed too late to be effective.
   */
  prescriptionExpiryAtSigning: string;
}

export interface WaiverValidityResult {
  /** Whether the waiver appears formally valid (no defects found). */
  isValid: boolean;
  /** List of defects found. Empty when isValid is true. */
  defects: WaiverDefect[];
  /** Plain-language summary of validity or defect count. */
  summary: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Authorized signatories under RMO 20-90.
 * Stored in lowercase for case-insensitive comparison.
 */
const AUTHORIZED_SIGNATORIES: readonly string[] = [
  "commissioner of internal revenue",
  "deputy commissioner",
  "regional director",
  "assistant regional director",
];

/**
 * Patterns that indicate vague/blanket tax type coverage.
 * Based on CTA decisions invalidating open-ended waivers.
 */
const VAGUE_COVERAGE_PATTERNS: readonly RegExp[] = [
  /^all\s+internal\s+revenue\s+taxes?$/i,
  /^all\s+taxes?$/i,
];

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isDateAfter(dateA: string, dateB: string): boolean {
  return (
    new Date(`${dateA}T00:00:00.000Z`).getTime() >
    new Date(`${dateB}T00:00:00.000Z`).getTime()
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Check a BIR waiver of the statute of limitations for formal defects.
 *
 * Returns all defects found. A waiver with any defect may be declared void
 * by the CTA, effectively invalidating any assessment made beyond the original
 * prescriptive period.
 */
export function checkWaiverValidity(input: WaiverInput): WaiverValidityResult {
  const defects: WaiverDefect[] = [];

  // Normalize all date inputs to ISO YYYY-MM-DD — accepts ISO, US MM/DD/YYYY, or natural language
  const waiverSignedDate = parseFlexibleDate(input.waiverSignedDate);
  const waiverExpiryDate = input.waiverExpiryDate ? parseFlexibleDate(input.waiverExpiryDate) : null;
  const prescriptionExpiryAtSigning = parseFlexibleDate(input.prescriptionExpiryAtSigning);

  // Check 1: Signatory authority (RMO 20-90)
  const signatoryNormalized = input.signatoryRole.trim().toLowerCase();
  const isAuthorized = AUTHORIZED_SIGNATORIES.some(
    (role) => signatoryNormalized === role || signatoryNormalized.includes(role)
  );
  if (!isAuthorized) {
    defects.push({
      defectType: "UNAUTHORIZED_SIGNATORY",
      description: `The waiver was signed by "${input.signatoryRole}", who is not among the BIR officials authorized to execute waivers on behalf of the Commissioner. Authorized roles: Commissioner of Internal Revenue, Deputy Commissioner, Regional Director, or Assistant Regional Director.`,
      legalBasis:
        "RMO 20-90 — Only the Commissioner of Internal Revenue or duly authorized representatives (Deputy Commissioner, Regional Director, Assistant Regional Director) may sign waivers of the statute of limitations. Waivers signed by unauthorized officers (e.g., Revenue District Officer) are void.",
    });
  }

  // Check 2: Definite expiry date (RDAO 05-01)
  if (waiverExpiryDate === null) {
    defects.push({
      defectType: "NO_DEFINITE_EXPIRY",
      description:
        "The waiver does not specify a definite expiry date. Open-ended waivers are not valid under BIR regulations.",
      legalBasis:
        "RDAO 05-01 — A valid waiver of the statute of limitations must state a specific, definite date up to which the right to assess is extended. Waivers without a fixed expiry date are considered defective and void.",
    });
  }

  // Check 3: Signed before prescription expired (NIRC 203/222)
  if (isDateAfter(waiverSignedDate, prescriptionExpiryAtSigning)) {
    defects.push({
      defectType: "SIGNED_AFTER_PRESCRIPTION_EXPIRED",
      description: `The waiver was signed on ${waiverSignedDate}, which is after the prescriptive period had already expired on ${prescriptionExpiryAtSigning}. A waiver executed after prescription lapses cannot revive an already-expired right to assess.`,
      legalBasis:
        "NIRC Section 203 / NIRC Section 222 — A waiver must be executed before the prescriptive period expires. Once prescription has lapsed, the BIR's right to assess is extinguished and cannot be waived retroactively.",
    });
  }

  // Check 4: Tax type specificity (CTA jurisprudence)
  const hasVagueCoverage = input.taxTypesCovered.some((taxType) =>
    VAGUE_COVERAGE_PATTERNS.some((pattern) => pattern.test(taxType.trim()))
  );
  if (hasVagueCoverage) {
    defects.push({
      defectType: "VAGUE_TAX_TYPE_COVERAGE",
      description: `The waiver covers "${input.taxTypesCovered.join(", ")}", which uses impermissibly vague, blanket language. Waivers must identify specific tax types to be valid.`,
      legalBasis:
        "CTA jurisprudence (CTA EB No. 1564, CTA Case No. 8553, and similar decisions) — Waivers must specify the particular type of tax and the exact taxable period covered. Generic descriptions such as 'all internal revenue taxes' or 'all taxes' render the waiver void for vagueness.",
    });
  }

  const isValid = defects.length === 0;
  const summary = isValid
    ? "The waiver appears formally valid based on the information provided. No defects detected under RMO 20-90, RDAO 05-01, and CTA jurisprudence."
    : `${defects.length} defect${defects.length === 1 ? "" : "s"} found. The waiver may be void and unenforceable. Review each defect with a qualified tax professional.`;

  return {
    isValid,
    defects,
    summary,
  };
}
