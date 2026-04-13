/**
 * Prescription period calculator for BIR tax assessments.
 *
 * Encodes NIRC Sections 203 and 222 as a pure, deterministic function:
 * - 3-year general prescriptive period (NIRC Section 203)
 * - 10-year extended period for fraud or failure to file (NIRC Section 222(a))
 *
 * Prescription starts from `assessmentBasisDate`, which the caller computes
 * as the later of: the actual filing date or the statutory due date.
 *
 * No external dependencies. No side effects.
 */

import { parseFlexibleDate } from "./parse-flexible-date";

export interface PrescriptionInput {
  /**
   * The start date for the prescriptive period computation (ISO 8601 YYYY-MM-DD).
   * This is the later of: (a) actual return filing date, or (b) statutory due date
   * for the covered tax period. Caller is responsible for determining this date.
   */
  assessmentBasisDate: string;
  /** End of the tax period under assessment (ISO 8601 YYYY-MM-DD). */
  taxPeriodEnd: string;
  /** Whether fraud is alleged by the BIR. Triggers 10-year period under NIRC Section 222(a). */
  fraudAlleged: boolean;
  /** Whether the taxpayer failed to file the return. Triggers 10-year period under NIRC Section 222(a). */
  failureToFile: boolean;
}

export interface PrescriptionResult {
  /** Rule applied: 3-year general or 10-year extended. */
  rule: "general-3yr" | "extended-10yr";
  /** Statutory basis for the rule applied. */
  legalBasis: string;
  /** Date prescription expires (ISO 8601 YYYY-MM-DD). */
  prescriptionExpiryDate: string;
  /** Days remaining until prescription expires, relative to today. Negative if expired. */
  daysRemaining: number;
  /** Whether the prescriptive period has already expired. */
  isExpired: boolean;
  /**
   * Human-readable explanation of the computation, e.g.:
   * "3-year period from 2021-04-15 = expires 2024-04-15"
   */
  computationNote: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function addYears(iso: string, years: number): string {
  const date = new Date(`${iso}T00:00:00.000Z`);
  date.setUTCFullYear(date.getUTCFullYear() + years);
  return date.toISOString().slice(0, 10);
}

function daysUntil(iso: string): number {
  const today = new Date();
  const todayUTC = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const target = new Date(`${iso}T00:00:00.000Z`);
  const targetUTC = target.getTime();
  return Math.round((targetUTC - todayUTC) / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Determine the applicable prescriptive period for a BIR assessment and
 * compute the exact expiry date.
 *
 * The function is deterministic: identical inputs always produce identical
 * outputs, making it suitable for use as an AI tool function.
 */
export function calculatePrescription(
  input: PrescriptionInput
): PrescriptionResult {
  // Normalize date inputs to ISO YYYY-MM-DD — accepts ISO, US MM/DD/YYYY, or natural language
  const assessmentBasisDate = parseFlexibleDate(input.assessmentBasisDate);
  // Validate taxPeriodEnd format (not used in computation, but must be a valid date)
  parseFlexibleDate(input.taxPeriodEnd);

  const useExtended = input.fraudAlleged || input.failureToFile;
  const years = useExtended ? 10 : 3;
  const rule: "general-3yr" | "extended-10yr" = useExtended
    ? "extended-10yr"
    : "general-3yr";

  const prescriptionExpiryDate = addYears(assessmentBasisDate, years);
  const daysRemaining = daysUntil(prescriptionExpiryDate);
  const isExpired = daysRemaining < 0;

  const legalBasis = useExtended
    ? "NIRC Section 222(a) — The right to assess deficiency taxes in case of a false or fraudulent return with intent to evade tax, or failure to file a return, prescribes in 10 years from discovery of fraud or failure."
    : "NIRC Section 203 — In the case of a return filed on time, internal revenue taxes shall be assessed within 3 years after the last day prescribed by law for the filing of the return, or, if the return is filed after such last day, within 3 years after the date the return was filed.";

  const computationNote = `${years}-year period from ${assessmentBasisDate} = expires ${prescriptionExpiryDate}`;

  return {
    rule,
    legalBasis,
    prescriptionExpiryDate,
    daysRemaining,
    isExpired,
    computationNote,
  };
}
