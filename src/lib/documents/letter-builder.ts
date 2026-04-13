import type {
  LetterContent,
  ProtestLetterInput,
  ComplianceLetterInput,
  AcknowledgmentLetterInput,
} from "./letter-types";
import {
  REGLEMENTARY_PERIODS,
  CORRESPONDENCE_LABELS,
  INTENDED_ACTIONS,
} from "./letter-types";

/** Format today's date as "April 9, 2026" */
function spelledOutDate(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Build the RE/subject line per D-08 format:
 * "PROTEST TO LETTER OF AUTHORITY NO. {loaNumber} / TAX TYPE: {taxTypes} / TAXABLE PERIOD: {period}"
 */
function buildProtestSubjectLine(
  loaNumber: string,
  taxTypes: string[],
  taxPeriod: string
): string {
  return (
    `PROTEST TO LETTER OF AUTHORITY NO. ${loaNumber}` +
    ` / TAX TYPE: ${taxTypes.join(", ")}` +
    ` / TAXABLE PERIOD: ${taxPeriod}`
  );
}

/**
 * Build the compliance RE/subject line per D-08 format.
 */
function buildComplianceSubjectLine(
  loaNumber: string,
  taxTypes: string[],
  taxPeriod: string
): string {
  return (
    `COMPLIANCE REPLY TO LETTER OF AUTHORITY NO. ${loaNumber}` +
    ` / TAX TYPE: ${taxTypes.join(", ")}` +
    ` / TAXABLE PERIOD: ${taxPeriod}`
  );
}

/**
 * Build a Protest Letter from ProtestLetterInput.
 *
 * Structure per D-07 and D-08:
 * - Opening paragraph: taxpayer identification + intent to protest
 * - Numbered paragraphs: one per defense ground (incorporating legal citations)
 * - Closing paragraph: nullity consequence
 * - WHEREFORE prayer: request cancellation/withdrawal of LOA
 */
export function buildProtestLetter(input: ProtestLetterInput): LetterContent {
  const {
    taxpayerName,
    tin,
    taxpayerAddress,
    loaNumber,
    loaIssuanceDate,
    loaReceiptDate,
    taxTypes,
    taxPeriod,
    assessedAmount,
    defenseGrounds,
    legalCitations,
    addresseeTitle,
    addresseeOffice,
    addresseeAddress,
  } = input;

  const date = spelledOutDate();

  // Build body paragraphs
  const bodyParagraphs: string[] = [];

  // Opening paragraph
  bodyParagraphs.push(
    `Undersigned taxpayer ${taxpayerName}, with Taxpayer Identification Number (TIN) ${tin}, ` +
      `hereby respectfully files this Protest against the above-captioned Letter of Authority No. ${loaNumber}, ` +
      `issued on ${loaIssuanceDate} and received on ${loaReceiptDate}, covering ` +
      `${taxTypes.join(" and ")} for the taxable period ${taxPeriod}` +
      (assessedAmount ? `, with an assessed deficiency of ${assessedAmount}` : "") +
      `. This Protest is filed pursuant to Section 228 of the National Internal Revenue Code (NIRC), as amended.`
  );

  // One numbered paragraph per defense ground
  defenseGrounds.forEach((ground, index) => {
    bodyParagraphs.push(`${index + 1}. ${ground}`);
  });

  // Closing paragraph on nullity consequence
  bodyParagraphs.push(
    `By reason of the foregoing, the above-captioned Letter of Authority has no legal force and effect ` +
      `and should be declared null and void. Any assessment or audit proceeding based thereon is likewise ` +
      `null and void ab initio.`
  );

  // WHEREFORE prayer
  const prayer =
    `WHEREFORE, premises considered, undersigned taxpayer respectfully prays that the ` +
    `Honorable ${addresseeTitle} CANCEL and WITHDRAW Letter of Authority No. ${loaNumber} for being ` +
    `issued contrary to law, and to STOP any and all audit proceedings pursuant thereto. ` +
    `Other reliefs just and equitable in the premises are likewise prayed for.`;

  return {
    date,
    addresseeName: addresseeTitle,
    addresseeTitle,
    addresseeOffice,
    addresseeAddress,
    subjectLine: buildProtestSubjectLine(loaNumber, taxTypes, taxPeriod),
    salutation: "Dear Sir/Madam:",
    bodyParagraphs,
    prayer,
    signatoryName: taxpayerName.toUpperCase(),
    signatoryTin: tin,
    signatoryAddress: taxpayerAddress,
    citations: legalCitations,
    letterType: "protest",
  };
}

/**
 * Build a Compliance Reply Letter from ComplianceLetterInput.
 *
 * Structure per D-07 and D-08:
 * - Opening paragraph: acknowledge LOA + cooperation intent
 * - Numbered paragraphs: one per taxpayerPosition entry
 * - Documents submitted paragraph
 * - Legal basis paragraph
 * - Reservation clause prayer
 */
export function buildComplianceLetter(
  input: ComplianceLetterInput
): LetterContent {
  const {
    taxpayerName,
    tin,
    taxpayerAddress,
    loaNumber,
    loaReceiptDate,
    taxTypes,
    taxPeriod,
    taxpayerPosition,
    documentsSubmitted,
    legalCitations,
    revenueOfficerName,
    revenueOfficerOffice,
    revenueOfficerAddress,
  } = input;

  const date = spelledOutDate();

  // Build body paragraphs
  const bodyParagraphs: string[] = [];

  // Opening paragraph: acknowledge LOA + cooperation intent
  bodyParagraphs.push(
    `Undersigned taxpayer ${taxpayerName}, with Taxpayer Identification Number (TIN) ${tin}, ` +
      `acknowledges receipt of Letter of Authority No. ${loaNumber} on ${loaReceiptDate}, ` +
      `covering ${taxTypes.join(" and ")} for the taxable period ${taxPeriod}. ` +
      `In the spirit of full cooperation with the Bureau of Internal Revenue (BIR) and in compliance ` +
      `with the applicable provisions of the NIRC and relevant revenue regulations, undersigned hereby ` +
      `submits this reply and the requested documents.`
  );

  // Numbered paragraphs: one per taxpayer position entry
  taxpayerPosition.forEach((position, index) => {
    bodyParagraphs.push(`${index + 1}. ${position}`);
  });

  // Documents submitted paragraph
  if (documentsSubmitted.length > 0) {
    const docList = documentsSubmitted
      .map((doc, i) => `    ${i + 1}. ${doc}`)
      .join("\n");
    bodyParagraphs.push(
      `In compliance with the LOA, undersigned hereby submits the following documents:\n${docList}`
    );
  }

  // Legal basis paragraph
  bodyParagraphs.push(
    `The foregoing submissions are made in accordance with ${legalCitations.join("; ")}, ` +
      `as well as all other applicable laws, rules, and regulations of the Bureau of Internal Revenue.`
  );

  // Reservation clause prayer
  const prayer =
    `ACCORDINGLY, undersigned taxpayer respectfully submits the foregoing reply and supporting documents ` +
    `in compliance with Letter of Authority No. ${loaNumber}, without prejudice to and expressly ` +
    `RESERVING all rights, defenses, and remedies that may be available under existing laws, ` +
    `rules, and regulations, including the right to raise additional defenses as circumstances may warrant. ` +
    `Other reliefs just and equitable in the premises are likewise prayed for.`;

  return {
    date,
    addresseeName: revenueOfficerName,
    addresseeTitle: "Revenue Officer",
    addresseeOffice: revenueOfficerOffice,
    addresseeAddress: revenueOfficerAddress,
    subjectLine: buildComplianceSubjectLine(loaNumber, taxTypes, taxPeriod),
    salutation: "Dear Sir/Madam:",
    bodyParagraphs,
    prayer,
    signatoryName: taxpayerName.toUpperCase(),
    signatoryTin: tin,
    signatoryAddress: taxpayerAddress,
    citations: legalCitations,
    letterType: "compliance",
  };
}

/**
 * Build an Acknowledgment Letter for any BIR correspondence type.
 *
 * Structure:
 * - Opening paragraph: taxpayer identification + acknowledgment of receipt
 * - Reglementary period paragraph: cite the applicable period and legal basis
 * - Intended action paragraph: state what the taxpayer intends to do
 * - Closing paragraph: cooperative stance + reservation of rights
 */
export function buildAcknowledgmentLetter(
  input: AcknowledgmentLetterInput
): LetterContent {
  const {
    correspondenceType,
    taxpayerName,
    tin,
    taxpayerAddress,
    referenceNumber,
    receiptDate,
    taxTypes,
    taxPeriod,
    addresseeTitle,
    addresseeOffice,
    addresseeAddress,
  } = input;

  const date = spelledOutDate();
  const label = CORRESPONDENCE_LABELS[correspondenceType];
  const { days, basis } = REGLEMENTARY_PERIODS[correspondenceType];
  const intendedAction = INTENDED_ACTIONS[correspondenceType];

  const bodyParagraphs: string[] = [];

  // Opening: acknowledge receipt
  bodyParagraphs.push(
    `Undersigned taxpayer ${taxpayerName}, with Taxpayer Identification Number (TIN) ${tin}, ` +
      `hereby respectfully acknowledges receipt on ${receiptDate} of the ${label} ` +
      `bearing Reference No. ${referenceNumber}, covering ${taxTypes.join(" and ")} ` +
      `for the taxable period ${taxPeriod}.`
  );

  // Reglementary period
  bodyParagraphs.push(
    `The undersigned is aware that, pursuant to ${basis}, ` +
      `the reglementary period to respond to the said ${label} is ` +
      `${days} calendar day${days > 1 ? "s" : ""} from the date of receipt thereof.`
  );

  // Intended action
  bodyParagraphs.push(
    `In this regard, the undersigned intends to ${intendedAction}.`
  );

  // Cooperative stance
  bodyParagraphs.push(
    `The undersigned wishes to assure the Honorable Office of full cooperation ` +
      `with the Bureau of Internal Revenue in the resolution of this matter, ` +
      `and undertakes to comply with all lawful requirements within the prescribed period.`
  );

  // Subject line
  const subjectLine =
    `ACKNOWLEDGMENT OF RECEIPT OF ${label.toUpperCase()} NO. ${referenceNumber}` +
    ` / TAX TYPE: ${taxTypes.join(", ")}` +
    ` / TAXABLE PERIOD: ${taxPeriod}`;

  // Reservation clause
  const prayer =
    `ACCORDINGLY, the undersigned respectfully submits this Acknowledgment Letter ` +
    `for the record, without prejudice to and expressly RESERVING all rights, defenses, ` +
    `and remedies available under existing laws, rules, and regulations. ` +
    `Other reliefs just and equitable in the premises are likewise prayed for.`;

  return {
    date,
    addresseeName: addresseeTitle,
    addresseeTitle,
    addresseeOffice,
    addresseeAddress,
    subjectLine,
    salutation: "Dear Sir/Madam:",
    bodyParagraphs,
    prayer,
    signatoryName: taxpayerName.toUpperCase(),
    signatoryTin: tin,
    signatoryAddress: taxpayerAddress,
    citations: [basis],
    letterType: "acknowledgment",
  };
}
