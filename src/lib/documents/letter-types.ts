/**
 * TypeScript interfaces for BIR formal correspondence letter content.
 * Based on D-07 and D-08 (BIR formal correspondence format).
 */

/** The final structured content ready for PDF rendering. */
export interface LetterContent {
  /** Spelled-out date, e.g. "April 9, 2026" */
  date: string;
  /** Full name of the addressee (e.g. "Regional Director" or "Revenue Officer Maria Santos") */
  addresseeName: string;
  /** Title of the addressee (e.g. "Regional Director") */
  addresseeTitle: string;
  /** Office or bureau name (e.g. "BIR Regional Office No. 8") */
  addresseeOffice: string;
  /** Mailing address of the addressee */
  addresseeAddress: string;
  /** RE line / subject line (LOA number, tax type, period) */
  subjectLine: string;
  /** Salutation (e.g. "Dear Sir/Madam:") */
  salutation: string;
  /** Body paragraphs — each element is one paragraph */
  bodyParagraphs: string[];
  /** Prayer / relief requested (WHEREFORE clause or reservation clause) */
  prayer: string;
  /** Signatory name in ALL CAPS */
  signatoryName: string;
  /** Signatory TIN */
  signatoryTin: string;
  /** Signatory mailing address */
  signatoryAddress: string;
  /** Legal citations listed in the footer */
  citations: string[];
  /** Letter type — determines filename in download header */
  letterType: "protest" | "compliance" | "acknowledgment";
}

/** Input for generating a Protest Letter (LOA stage). */
export interface ProtestLetterInput {
  /** Full name of the taxpayer */
  taxpayerName: string;
  /** Taxpayer identification number */
  tin: string;
  /** Taxpayer mailing address */
  taxpayerAddress: string;
  /** Letter of Authority number (e.g. "LOA-2025-00123") */
  loaNumber: string;
  /** LOA issuance date (spelled out) */
  loaIssuanceDate: string;
  /** Date the taxpayer received the LOA (spelled out) */
  loaReceiptDate: string;
  /** Tax types covered by the LOA (e.g. ["Income Tax", "VAT"]) */
  taxTypes: string[];
  /** Taxable period covered (e.g. "January 1, 2024 to December 31, 2024") */
  taxPeriod: string;
  /** Assessed amount, or null if not yet assessed */
  assessedAmount: string | null;
  /** Defense grounds — each becomes a numbered paragraph in the body */
  defenseGrounds: string[];
  /** Legal citations to include in the footer and reference in body paragraphs */
  legalCitations: string[];
  /** Title of the addressee (e.g. "Regional Director") */
  addresseeTitle: string;
  /** Office of the addressee (e.g. "BIR Regional Office No. 8") */
  addresseeOffice: string;
  /** Mailing address of the addressee */
  addresseeAddress: string;
}

/**
 * BIR correspondence types that can receive an acknowledgment letter.
 * Reglementary periods are fixed by law/issuance.
 */
export type BirCorrespondenceType = "LOA" | "NOD" | "PAN" | "FAN" | "FDDA";

/** Fixed reglementary periods per correspondence type (in calendar days). */
export const REGLEMENTARY_PERIODS: Record<BirCorrespondenceType, { days: number; basis: string }> = {
  LOA: { days: 120, basis: "RMO 44-2010 — LOA validity period from date of issuance" },
  NOD: { days: 15, basis: "RR 12-99, as amended — Response to Notice of Discrepancy" },
  PAN: { days: 15, basis: "NIRC Section 228 — Protest to Preliminary Assessment Notice" },
  FAN: { days: 30, basis: "NIRC Section 228 — Protest to Final Assessment Notice / Formal Letter of Demand" },
  FDDA: { days: 30, basis: "NIRC Section 228 — Appeal of Final Decision on Disputed Assessment" },
};

/** Full labels for correspondence types. */
export const CORRESPONDENCE_LABELS: Record<BirCorrespondenceType, string> = {
  LOA: "Letter of Authority",
  NOD: "Notice of Discrepancy",
  PAN: "Preliminary Assessment Notice",
  FAN: "Final Assessment Notice / Formal Letter of Demand",
  FDDA: "Final Decision on Disputed Assessment",
};

/** Predefined intended actions for acknowledgment letters. */
export const INTENDED_ACTIONS: Record<BirCorrespondenceType, string> = {
  LOA: "comply with the audit requirements and submit the requested documents within the prescribed period",
  NOD: "submit a written explanation addressing the discrepancies noted",
  PAN: "file a formal protest within the reglementary period provided by law",
  FAN: "file an administrative protest within thirty (30) days from receipt as provided under Section 228 of the NIRC",
  FDDA: "elevate the matter to the Court of Tax Appeals within thirty (30) days from receipt as provided under the Rules of the CTA",
};

/** Input for generating an Acknowledgment Letter for any BIR correspondence. */
export interface AcknowledgmentLetterInput {
  /** Type of BIR correspondence being acknowledged */
  correspondenceType: BirCorrespondenceType;
  /** Full name of the taxpayer */
  taxpayerName: string;
  /** Taxpayer identification number */
  tin: string;
  /** Taxpayer mailing address */
  taxpayerAddress: string;
  /** Reference number of the BIR correspondence (e.g. LOA number, FAN number) */
  referenceNumber: string;
  /** Date the correspondence was received by the taxpayer (spelled out, e.g. "April 1, 2026") */
  receiptDate: string;
  /** Tax types covered (e.g. ["Income Tax", "VAT"]) */
  taxTypes: string[];
  /** Taxable period covered (e.g. "January 1, 2024 to December 31, 2024") */
  taxPeriod: string;
  /** Title of the BIR official the letter is addressed to */
  addresseeTitle: string;
  /** Office of the addressee */
  addresseeOffice: string;
  /** Mailing address of the addressee */
  addresseeAddress: string;
}

/** Input for generating a Compliance Reply Letter (LOA stage). */
export interface ComplianceLetterInput {
  /** Full name of the taxpayer */
  taxpayerName: string;
  /** Taxpayer identification number */
  tin: string;
  /** Taxpayer mailing address */
  taxpayerAddress: string;
  /** Letter of Authority number */
  loaNumber: string;
  /** Date the taxpayer received the LOA (spelled out) */
  loaReceiptDate: string;
  /** Tax types covered by the LOA */
  taxTypes: string[];
  /** Taxable period covered */
  taxPeriod: string;
  /** Taxpayer's legal/factual positions — each becomes a numbered paragraph */
  taxpayerPosition: string[];
  /** List of documents submitted for audit */
  documentsSubmitted: string[];
  /** Legal citations supporting the taxpayer's position */
  legalCitations: string[];
  /** Full name and title of the Revenue Officer named in the LOA */
  revenueOfficerName: string;
  /** Office of the Revenue Officer */
  revenueOfficerOffice: string;
  /** Mailing address of the Revenue Officer's office */
  revenueOfficerAddress: string;
}
