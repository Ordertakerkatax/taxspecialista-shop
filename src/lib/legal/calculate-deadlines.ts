/**
 * LOA-stage deadline calculator for BIR tax dispute advisory.
 *
 * Encodes Philippine BIR deadline rules as a pure, deterministic function:
 * - LOA 120-day validity (RMO 44-2010)
 * - NOD 15-day response window (RR 12-99)
 * - PAN 30-day protest period (NIRC Section 228 / RR 12-99)
 *
 * No external dependencies. No side effects.
 */

import { parseFlexibleDate } from "./parse-flexible-date";
import { addDays, daysUntil, todayIso } from "./date-helpers";

export interface DeadlineInput {
  /** Date LOA was received by the taxpayer (ISO 8601 YYYY-MM-DD). Required for session context only — does not trigger a deadline on its own. */
  loaReceiptDate: string;
  /** Date LOA was issued by the BIR (ISO 8601). Triggers 120-day validity window. */
  loaIssuanceDate?: string;
  /** Date Notice of Discrepancy was received (ISO 8601). Triggers 15-day response window. */
  nodReceiptDate?: string;
  /** Date Preliminary Assessment Notice was received (ISO 8601). Triggers 30-day protest window. */
  panReceiptDate?: string;
}

export interface Deadline {
  /** Human-readable name of the deadline. */
  name: string;
  /** Due date in ISO 8601 YYYY-MM-DD format. */
  dueDate: string;
  /** Days remaining until due date, relative to today. Negative if overdue. */
  daysRemaining: number;
  /** Statutory or regulatory basis for this deadline. */
  legalBasis: string;
  /** Whether the deadline has already passed. */
  isOverdue: boolean;
}

export interface DeadlineResult {
  /** Date these deadlines were computed (ISO 8601 YYYY-MM-DD). */
  computedAt: string;
  /** List of applicable deadlines computed from provided input. */
  deadlines: Deadline[];
  /** Warnings about overdue or legally significant conditions. */
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Compute BIR LOA-stage deadlines from known taxpayer dates.
 *
 * Only dates that are legally relevant to a specific deadline trigger an entry
 * in the result. loaReceiptDate alone does not trigger any deadline.
 */
export function calculateDeadlines(input: DeadlineInput): DeadlineResult {
  const deadlines: Deadline[] = [];
  const warnings: string[] = [];

  // Normalize all date inputs to ISO YYYY-MM-DD — accepts ISO, US MM/DD/YYYY, or natural language
  const loaReceiptDate = parseFlexibleDate(input.loaReceiptDate);
  const loaIssuanceDate = input.loaIssuanceDate ? parseFlexibleDate(input.loaIssuanceDate) : undefined;
  const nodReceiptDate = input.nodReceiptDate ? parseFlexibleDate(input.nodReceiptDate) : undefined;
  const panReceiptDate = input.panReceiptDate ? parseFlexibleDate(input.panReceiptDate) : undefined;

  // LOA 120-day validity — starts from loaIssuanceDate (not receipt date)
  if (loaIssuanceDate) {
    const dueDate = addDays(loaIssuanceDate, 120);
    const daysRemaining = daysUntil(dueDate);
    const isOverdue = daysRemaining < 0;
    deadlines.push({
      name: "LOA Validity Expiry",
      dueDate,
      daysRemaining,
      legalBasis:
        "LOA is valid for 120 days from issuance date per RMO 44-2010. May be renewed for another 30 days with approval.",
      isOverdue,
    });
    if (isOverdue) {
      warnings.push(
        "LOA may be void — the 120-day validity period under RMO 44-2010 has lapsed. Verify whether a valid renewal was issued."
      );
    }
  }

  // NOD 15-day response window — starts from nodReceiptDate
  if (nodReceiptDate) {
    const dueDate = addDays(nodReceiptDate, 15);
    const daysRemaining = daysUntil(dueDate);
    const isOverdue = daysRemaining < 0;
    deadlines.push({
      name: "NOD Response Deadline",
      dueDate,
      daysRemaining,
      legalBasis:
        "Taxpayer must respond to the Notice of Discrepancy within 15 days of receipt per RR 12-99.",
      isOverdue,
    });
  }

  // PAN 30-day protest period — starts from panReceiptDate
  if (panReceiptDate) {
    const dueDate = addDays(panReceiptDate, 30);
    const daysRemaining = daysUntil(dueDate);
    const isOverdue = daysRemaining < 0;
    deadlines.push({
      name: "PAN Protest Deadline",
      dueDate,
      daysRemaining,
      legalBasis:
        "Taxpayer must reply to the Preliminary Assessment Notice within 15 days of receipt. Filing a protest within 30 days is required to contest the assessment per NIRC Section 228 / RR 12-99.",
      isOverdue,
    });
  }

  return {
    computedAt: todayIso(),
    deadlines,
    warnings,
  };
}
