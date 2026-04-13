import { tool } from "ai";
import { z } from "zod";
import { calculateDeadlines, calculatePrescription, checkWaiverValidity } from "@/lib/legal";
import { buildProtestLetter, buildComplianceLetter, buildAcknowledgmentLetter, encodeLetterContent, REGLEMENTARY_PERIODS, CORRESPONDENCE_LABELS } from "@/lib/documents";
import type { BirCorrespondenceType } from "@/lib/documents";
import { createEscalation } from "@/lib/escalation";
import { sendEscalationNotificationEmail } from "@/lib/email";

export const calculateDeadlinesTool = tool({
  description:
    "Compute response deadlines for a taxpayer's BIR LOA stage. Call this after learning the LOA receipt date and any other relevant dates (LOA issuance date, NOD receipt date, PAN receipt date).",
  inputSchema: z.object({
    loaReceiptDate: z
      .string()
      .describe("Date (ISO YYYY-MM-DD, MM/DD/YYYY, or 'Month DD, YYYY') when the taxpayer received the Letter of Authority (e.g. 2025-02-01)"),
    loaIssuanceDate: z
      .string()
      .optional()
      .describe("Date (ISO YYYY-MM-DD, MM/DD/YYYY, or 'Month DD, YYYY') the LOA was issued/signed — needed to compute 120-day LOA validity deadline"),
    nodReceiptDate: z
      .string()
      .optional()
      .describe("Date (ISO YYYY-MM-DD, MM/DD/YYYY, or 'Month DD, YYYY') when the taxpayer received the Notice of Discrepancy (NOD) — triggers 15-day response window"),
    panReceiptDate: z
      .string()
      .optional()
      .describe("Date (ISO YYYY-MM-DD, MM/DD/YYYY, or 'Month DD, YYYY') when the taxpayer received the Preliminary Assessment Notice — triggers 30-day protest period"),
  }),
  execute: async (input) => calculateDeadlines(input),
});

export const calculatePrescriptionTool = tool({
  description:
    "Calculate the prescription period for BIR assessment. Call this after learning the tax return filing date (or due date if not filed), the tax period, and whether fraud or failure to file is alleged.",
  inputSchema: z.object({
    assessmentBasisDate: z
      .string()
      .describe(
        "Date (ISO YYYY-MM-DD, MM/DD/YYYY, or 'Month DD, YYYY') — the LATER of: the actual filing date OR the statutory filing deadline. This is the start date for the prescription period."
      ),
    taxPeriodEnd: z
      .string()
      .describe("Date (ISO YYYY-MM-DD, MM/DD/YYYY, or 'Month DD, YYYY') representing the end of the tax period under examination (e.g. 2021-12-31 for calendar year 2021)"),
    fraudAlleged: z
      .boolean()
      .describe("True if the BIR alleges fraud in the assessment — triggers the 10-year extended prescription period under NIRC Section 222"),
    failureToFile: z
      .boolean()
      .describe("True if the taxpayer failed to file the tax return — also triggers the 10-year extended prescription period under NIRC Section 222"),
  }),
  execute: async (input) => calculatePrescription(input),
});

export const checkWaiverValidityTool = tool({
  description:
    "Check validity of a BIR waiver of the statute of limitations. Call this after learning the waiver details: date signed, expiry date, BIR signatory role, tax types covered, and prescription expiry at time of signing.",
  inputSchema: z.object({
    waiverSignedDate: z
      .string()
      .describe("Date (ISO YYYY-MM-DD, MM/DD/YYYY, or 'Month DD, YYYY') when the waiver was signed by the taxpayer"),
    waiverExpiryDate: z
      .string()
      .nullable()
      .describe("Date (ISO YYYY-MM-DD, MM/DD/YYYY, or 'Month DD, YYYY') the waiver expires, or null if the waiver has no definite expiry date"),
    signatoryRole: z
      .string()
      .describe(
        "Role/title of the BIR officer who signed the waiver on behalf of the BIR (e.g. 'Revenue District Officer', 'Assistant Commissioner', 'Commissioner')"
      ),
    taxTypesCovered: z
      .array(z.string())
      .describe(
        "List of tax types covered by the waiver as stated in the document (e.g. ['Income Tax', 'VAT'] or ['all internal revenue taxes'])"
      ),
    prescriptionExpiryAtSigning: z
      .string()
      .describe(
        "Date (ISO YYYY-MM-DD, MM/DD/YYYY, or 'Month DD, YYYY') the prescription period would have expired without the waiver — used to check if the waiver was signed before prescription lapsed"
      ),
  }),
  execute: async (input) => checkWaiverValidity(input),
});

/**
 * Factory function that creates document generation tools with the session token
 * captured in the closure. The session token is appended to the download URL so
 * the /api/documents/generate endpoint can validate the session before serving the PDF.
 */
export function createDocumentTools(sessionToken: string) {
  const generateProtestLetterTool = tool({
    description:
      "Generate a draft BIR protest letter for the taxpayer after the advisory phase. Call this ONLY after gathering all intake facts and the taxpayer confirms they want a draft letter. Returns a download link.",
    inputSchema: z.object({
      taxpayerName: z.string().describe("Full legal name of the taxpayer as registered with BIR"),
      tin: z.string().describe("Taxpayer Identification Number (TIN), e.g. '123-456-789-000'"),
      taxpayerAddress: z.string().describe("Taxpayer's registered mailing address"),
      loaNumber: z.string().describe("Letter of Authority number as printed on the LOA document (e.g. 'LOA-2025-00123')"),
      loaIssuanceDate: z.string().describe("ISO 8601 date the LOA was issued/signed by the BIR (e.g. '2025-01-15')"),
      loaReceiptDate: z.string().describe("ISO 8601 date the taxpayer received the LOA (e.g. '2025-01-20')"),
      taxTypes: z.array(z.string()).describe("Tax types covered by the LOA (e.g. ['Income Tax', 'VAT'])"),
      taxPeriod: z.string().describe("Taxable period under examination (e.g. 'January 1, 2024 to December 31, 2024')"),
      assessedAmount: z
        .string()
        .nullable()
        .describe("Assessed or deficiency amount stated in the LOA, or null if not yet assessed"),
      defenseGrounds: z
        .array(z.string())
        .describe("Legal grounds for protest identified during the advisory phase — each becomes a numbered paragraph in the letter body"),
      legalCitations: z
        .array(z.string())
        .describe("NIRC sections, RMOs, RRs, and CTA decisions cited during the advisory (e.g. ['NIRC Section 203', 'RMO 44-2010'])"),
      addresseeTitle: z
        .string()
        .describe("Title of the BIR official the protest is addressed to (e.g. 'Regional Director', 'Commissioner of Internal Revenue')"),
      addresseeOffice: z.string().describe("Name of the BIR office (e.g. 'BIR Regional Office No. 8 – Eastern Visayas')"),
      addresseeAddress: z.string().describe("Mailing address of the BIR office"),
    }),
    execute: async (input) => {
      const letterContent = buildProtestLetter(input);
      const token = encodeLetterContent(letterContent);
      const downloadUrl = `/api/documents/generate?session=${sessionToken}&token=${token}`;
      return {
        downloadUrl,
        letterType: "protest" as const,
        taxpayerName: input.taxpayerName,
        loaNumber: input.loaNumber,
        defenseGroundsCount: input.defenseGrounds.length,
      };
    },
  });

  const generateComplianceLetterTool = tool({
    description:
      "Generate a draft BIR compliance reply letter for the taxpayer who wants to cooperate with the LOA audit. Call this ONLY after gathering all intake facts and the taxpayer confirms they want a compliance reply. Returns a download link.",
    inputSchema: z.object({
      taxpayerName: z.string().describe("Full legal name of the taxpayer as registered with BIR"),
      tin: z.string().describe("Taxpayer Identification Number (TIN)"),
      taxpayerAddress: z.string().describe("Taxpayer's registered mailing address"),
      loaNumber: z.string().describe("Letter of Authority number as printed on the LOA document"),
      loaReceiptDate: z.string().describe("ISO 8601 date the taxpayer received the LOA"),
      taxTypes: z.array(z.string()).describe("Tax types covered by the LOA"),
      taxPeriod: z.string().describe("Taxable period under examination"),
      taxpayerPosition: z
        .array(z.string())
        .describe("Taxpayer's legal and factual positions on each audit area — each becomes a numbered paragraph in the letter body"),
      documentsSubmitted: z
        .array(z.string())
        .describe("Documents being submitted to the Revenue Officer as part of the compliance response"),
      legalCitations: z
        .array(z.string())
        .describe("NIRC sections, RMOs, RRs cited to support the taxpayer's cooperation and position"),
      revenueOfficerName: z
        .string()
        .describe("Full name and title of the Revenue Officer named in the LOA (e.g. 'Revenue Officer Maria Santos')"),
      revenueOfficerOffice: z.string().describe("Office of the Revenue Officer (e.g. 'Revenue District Office No. 40')"),
      revenueOfficerAddress: z.string().describe("Mailing address of the Revenue Officer's office"),
    }),
    execute: async (input) => {
      const letterContent = buildComplianceLetter(input);
      const token = encodeLetterContent(letterContent);
      const downloadUrl = `/api/documents/generate?session=${sessionToken}&token=${token}`;
      return {
        downloadUrl,
        letterType: "compliance" as const,
        taxpayerName: input.taxpayerName,
        loaNumber: input.loaNumber,
        documentsCount: input.documentsSubmitted.length,
      };
    },
  });

  const generateAcknowledgmentLetterTool = tool({
    description:
      "Generate a draft acknowledgment letter for any BIR correspondence (LOA, NOD, PAN, FAN, FDDA). This establishes the taxpayer's cooperative stance and documents awareness of the reglementary period. Call this after identifying the correspondence type and gathering taxpayer details.",
    inputSchema: z.object({
      correspondenceType: z
        .enum(["LOA", "NOD", "PAN", "FAN", "FDDA"])
        .describe("Type of BIR correspondence being acknowledged"),
      taxpayerName: z.string().describe("Full legal name of the taxpayer as registered with BIR"),
      tin: z.string().describe("Taxpayer Identification Number (TIN), e.g. '123-456-789-000'"),
      taxpayerAddress: z.string().describe("Taxpayer's registered mailing address"),
      referenceNumber: z.string().describe("Reference number of the BIR correspondence (e.g. LOA number, FAN number)"),
      receiptDate: z.string().describe("Date the taxpayer received the correspondence, spelled out (e.g. 'April 1, 2026')"),
      taxTypes: z.array(z.string()).describe("Tax types covered (e.g. ['Income Tax', 'VAT'])"),
      taxPeriod: z.string().describe("Taxable period covered (e.g. 'January 1, 2024 to December 31, 2024')"),
      addresseeTitle: z.string().describe("Title of the BIR official (e.g. 'Regional Director', 'Revenue District Officer')"),
      addresseeOffice: z.string().describe("Name of the BIR office"),
      addresseeAddress: z.string().describe("Mailing address of the BIR office"),
    }),
    execute: async (input) => {
      const correspondenceType = input.correspondenceType as BirCorrespondenceType;
      const letterContent = buildAcknowledgmentLetter({ ...input, correspondenceType });
      const token = encodeLetterContent(letterContent);
      const downloadUrl = `/api/documents/generate?session=${sessionToken}&token=${token}`;
      const { days, basis } = REGLEMENTARY_PERIODS[correspondenceType];
      const label = CORRESPONDENCE_LABELS[correspondenceType];
      return {
        downloadUrl,
        letterType: "acknowledgment" as const,
        taxpayerName: input.taxpayerName,
        correspondenceType: input.correspondenceType,
        correspondenceLabel: label,
        referenceNumber: input.referenceNumber,
        reglementaryPeriodDays: days,
        reglementaryBasis: basis,
      };
    },
  });

  return {
    generateProtestLetter: generateProtestLetterTool,
    generateComplianceLetter: generateComplianceLetterTool,
    generateAcknowledgmentLetter: generateAcknowledgmentLetterTool,
  };
}

/**
 * Factory function that creates escalation tools with the session ID and email
 * captured in the closure. Called in the chat route to wire the assessComplexity
 * tool to the correct session for DB persistence and email notification.
 */
export function createEscalationTools(sessionId: string, sessionEmail: string) {
  const assessComplexityTool = tool({
    description:
      "Assess whether the current consultation involves complex factors that warrant CPA review. Call this AFTER completing the advisory response phase. Evaluate the case facts against the complexity criteria and return a structured assessment.",
    inputSchema: z.object({
      isComplex: z.boolean().describe("True if ANY complexity criterion is met"),
      summary: z
        .string()
        .describe(
          "2-3 sentence case summary describing the taxpayer's situation, the BIR action, and the key issue — this is what the CPA will read first"
        ),
      largeTaxAmount: z
        .boolean()
        .describe("True if assessed/disputed amount exceeds PHP 1,000,000"),
      multipleLOADefects: z
        .boolean()
        .describe("True if 2 or more LOA validity defects were identified"),
      sdtInvolvement: z
        .boolean()
        .describe("True if a Subpoena Duces Tecum is part of the case"),
      multipleTaxPeriods: z
        .boolean()
        .describe("True if the examination covers more than one taxable year/period"),
      fraudAllegations: z
        .boolean()
        .describe(
          "True if the BIR alleges fraud or the 10-year prescription applies"
        ),
      conflictingLegalGrounds: z
        .boolean()
        .describe(
          "True if multiple conflicting legal bases apply and the correct defense strategy is ambiguous"
        ),
      severity: z
        .enum(["medium", "high"])
        .describe(
          "'high' if fraud allegations or large tax amount or SDT involvement; 'medium' otherwise"
        ),
    }),
    execute: async (input) => {
      if (!input.isComplex) {
        return { escalated: false, message: "Case does not require escalation." };
      }

      // Build reasons array from boolean flags
      const reasons: string[] = [];
      if (input.largeTaxAmount) reasons.push("Large tax amount (>PHP 1,000,000)");
      if (input.multipleLOADefects) reasons.push("Multiple LOA validity defects");
      if (input.sdtInvolvement) reasons.push("Subpoena Duces Tecum involvement");
      if (input.multipleTaxPeriods) reasons.push("Multiple tax periods under examination");
      if (input.fraudAllegations) reasons.push("Fraud allegations by BIR");
      if (input.conflictingLegalGrounds) reasons.push("Conflicting legal grounds");

      // Create escalation record and send email
      await createEscalation({
        sessionId,
        summary: input.summary,
        complexityReasons: reasons,
        severity: input.severity,
      });
      await sendEscalationNotificationEmail({
        summary: input.summary,
        reasons,
        severity: input.severity,
        sessionEmail,
      });

      return { escalated: true, message: "Case has been flagged for CPA review." };
    },
  });

  return {
    assessComplexity: assessComplexityTool,
  };
}
