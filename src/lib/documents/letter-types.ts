/**
 * Letter type interfaces and builder functions for BIR tax dispute advisory letters.
 * Supports LOA Reply and Protest Letter as primary document types for Phase 4.
 */

// ============================================================
// Shared interfaces
// ============================================================

export interface LetterMetadata {
  /** Taxpayer's full legal name */
  taxpayerName: string;
  /** Taxpayer's TIN */
  taxpayerTin: string;
  /** Taxpayer's address */
  taxpayerAddress: string;
  /** BIR office (Revenue District Office or Region) issuing the notice */
  birOffice: string;
  /** Date the taxpayer's document was received (ISO date string) */
  documentReceivedDate: string;
  /** Tax type covered (e.g., "Income Tax", "VAT", "Withholding Tax") */
  taxType: string;
  /** Taxable year or period covered (e.g., "2022", "January–June 2022") */
  taxablePeriod: string;
  /** Assessed or claimed amount in PHP, if any */
  assessedAmountPhp?: number;
  /** Session ID for audit trail */
  sessionId: string;
}

export interface Citation {
  /** Reference number e.g. [1] */
  number: number;
  /** Full citation text e.g. "NIRC Section 228 — Assessment Notice Requirements" */
  text: string;
}

export interface LetterSection {
  /** Section heading (optional — can be omitted for body paragraphs) */
  heading?: string;
  /** Paragraph text(s) — each element is a separate paragraph */
  paragraphs: string[];
}

// ============================================================
// LOA Reply Letter
// ============================================================

export interface LoaReplyContent {
  type: "loa_reply";
  metadata: LetterMetadata;
  /** LOA reference number from the document */
  loaReferenceNumber: string;
  /** Date the LOA was issued (ISO date string) */
  loaIssuedDate: string;
  /** Name of Revenue Officer named in the LOA */
  revenueOfficerName: string;
  /** Specific grounds for reply / issues raised */
  groundsForReply: string[];
  /** Documents being submitted with the reply */
  documentsSubmitted?: string[];
  /** Legal citations drawn from the advisory session */
  citations: Citation[];
}

export interface LoaReplyLetter {
  type: "loa_reply";
  subject: string;
  recipientBlock: string[];
  salutation: string;
  sections: LetterSection[];
  closingParagraph: string;
  citations: Citation[];
  disclaimer: string;
  generatedAt: string;
}

export function buildLoaReplyLetter(content: LoaReplyContent): LoaReplyLetter {
  const { metadata, loaReferenceNumber, loaIssuedDate, revenueOfficerName, groundsForReply, documentsSubmitted, citations } = content;

  const formattedLoaDate = formatDate(loaIssuedDate);
  const formattedReceivedDate = formatDate(metadata.documentReceivedDate);
  const today = formatDate(new Date().toISOString());
  const assessmentText = metadata.assessedAmountPhp
    ? `PHP ${metadata.assessedAmountPhp.toLocaleString("en-PH")}`
    : "as stated in the LOA";

  const subject = `RE: Letter of Authority No. ${loaReferenceNumber} dated ${formattedLoaDate} — ${metadata.taxType} for Taxable Year/Period ${metadata.taxablePeriod}`;

  const recipientBlock = [
    revenueOfficerName,
    "Revenue Officer",
    metadata.birOffice,
    "Bureau of Internal Revenue",
  ];

  const sections: LetterSection[] = [
    {
      paragraphs: [
        `This constitutes the formal reply of ${metadata.taxpayerName} (TIN: ${metadata.taxpayerTin}), with address at ${metadata.taxpayerAddress}, to the Letter of Authority No. ${loaReferenceNumber} dated ${formattedLoaDate}, received on ${formattedReceivedDate}, for the examination of ${metadata.taxType} for the taxable year/period ${metadata.taxablePeriod}, with an assessed or claimed amount of ${assessmentText}.`,
      ],
    },
    {
      heading: "I. GROUNDS FOR REPLY",
      paragraphs: groundsForReply,
    },
  ];

  if (documentsSubmitted && documentsSubmitted.length > 0) {
    sections.push({
      heading: "II. DOCUMENTS SUBMITTED",
      paragraphs: [
        "In support of this reply, the following documents are hereto attached:",
        documentsSubmitted.map((doc, i) => `${i + 1}. ${doc}`).join("\n"),
      ],
    });
  }

  const closingParagraph = `We respectfully request that this reply be given due consideration. We remain available for any clarification the Bureau may require and trust that the matter will be resolved in accordance with due process as mandated by law. [${citations.map(c => c.number).join("][")}]`;

  return {
    type: "loa_reply",
    subject,
    recipientBlock,
    salutation: `Dear ${revenueOfficerName},`,
    sections,
    closingParagraph,
    citations,
    disclaimer: buildDisclaimer(today),
    generatedAt: today,
  };
}

// ============================================================
// Protest Letter
// ============================================================

export interface ProtestLetterContent {
  type: "protest_letter";
  metadata: LetterMetadata;
  /** Assessment notice type: "PAN" | "FAN" | "FDDA" */
  assessmentType: "PAN" | "FAN" | "FDDA";
  /** Assessment reference number */
  assessmentReferenceNumber: string;
  /** Date of assessment notice (ISO date string) */
  assessmentDate: string;
  /** Specific legal grounds for protest */
  groundsForProtest: string[];
  /** Supporting evidence or facts */
  supportingFacts?: string[];
  /** Relief sought */
  reliefSought: string;
  /** Legal citations drawn from the advisory session */
  citations: Citation[];
}

export interface ProtestLetter {
  type: "protest_letter";
  subject: string;
  recipientBlock: string[];
  salutation: string;
  sections: LetterSection[];
  reliefSection: LetterSection;
  closingParagraph: string;
  citations: Citation[];
  disclaimer: string;
  generatedAt: string;
}

export function buildProtestLetter(content: ProtestLetterContent): ProtestLetter {
  const { metadata, assessmentType, assessmentReferenceNumber, assessmentDate, groundsForProtest, supportingFacts, reliefSought, citations } = content;

  const formattedAssessmentDate = formatDate(assessmentDate);
  const today = formatDate(new Date().toISOString());
  const assessmentText = metadata.assessedAmountPhp
    ? `PHP ${metadata.assessedAmountPhp.toLocaleString("en-PH")}`
    : "the amount stated in the notice";

  const subject = `PROTEST AGAINST ${assessmentType} No. ${assessmentReferenceNumber} dated ${formattedAssessmentDate} — ${metadata.taxType} for Taxable Year/Period ${metadata.taxablePeriod}`;

  const recipientBlock = [
    "The Commissioner of Internal Revenue",
    metadata.birOffice,
    "Bureau of Internal Revenue",
    "Quezon City",
  ];

  const sections: LetterSection[] = [
    {
      paragraphs: [
        `${metadata.taxpayerName} (TIN: ${metadata.taxpayerTin}), with registered address at ${metadata.taxpayerAddress}, hereby files this formal protest against the ${assessmentType} No. ${assessmentReferenceNumber} dated ${formattedAssessmentDate}, issued by the ${metadata.birOffice}, assessing ${metadata.taxType} for the taxable year/period ${metadata.taxablePeriod} in the amount of ${assessmentText}.`,
        `This protest is filed pursuant to Section 228 of the National Internal Revenue Code (NIRC) and Revenue Regulations No. 12-99, as amended, within the prescriptive period for filing protests.[1]`,
      ],
    },
    {
      heading: "I. STATEMENT OF FACTS",
      paragraphs: [
        `Taxpayer received the ${assessmentType} on ${formatDate(metadata.documentReceivedDate)}. The notice covers ${metadata.taxType} for taxable year/period ${metadata.taxablePeriod}, and the assessed deficiency totals ${assessmentText}.`,
        ...(supportingFacts ?? []),
      ],
    },
    {
      heading: "II. GROUNDS FOR PROTEST",
      paragraphs: groundsForProtest,
    },
  ];

  const reliefSection: LetterSection = {
    heading: "III. PRAYER",
    paragraphs: [
      reliefSought,
      `WHEREFORE, premises considered, taxpayer respectfully prays that the ${assessmentType} No. ${assessmentReferenceNumber} be cancelled and withdrawn in its entirety, or in the alternative, that the assessment be reduced to an amount that is legally and factually supported by the evidence on record.`,
    ],
  };

  const closingParagraph = `Other relief just and equitable under the premises are likewise prayed for.`;

  return {
    type: "protest_letter",
    subject,
    recipientBlock,
    salutation: "Dear Commissioner,",
    sections,
    reliefSection,
    closingParagraph,
    citations,
    disclaimer: buildDisclaimer(today),
    generatedAt: today,
  };
}

// ============================================================
// Union type for all letter types
// ============================================================

export type LetterContent = LoaReplyContent | ProtestLetterContent;
export type Letter = LoaReplyLetter | ProtestLetter;

/**
 * Entry point: given raw letter content, build the structured letter.
 */
export function buildLetter(content: LetterContent): Letter {
  switch (content.type) {
    case "loa_reply":
      return buildLoaReplyLetter(content);
    case "protest_letter":
      return buildProtestLetter(content);
    default:
      throw new Error(`Unknown letter type: ${(content as { type: string }).type}`);
  }
}

// ============================================================
// Helpers
// ============================================================

function formatDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return isoDate;
  }
}

function buildDisclaimer(date: string): string {
  return `DRAFT — Generated by TaxSpecialista Consult on ${date}. This document is a DRAFT for review purposes only and does not constitute formal legal or tax advice. Review and finalization by a licensed Certified Public Accountant or tax attorney is required before filing or submission to any government agency. TaxSpecialista and its agents assume no liability for the use of this draft without professional review.`;
}
