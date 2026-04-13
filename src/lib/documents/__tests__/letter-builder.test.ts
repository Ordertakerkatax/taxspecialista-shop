import { describe, it, expect } from "vitest";
import { buildProtestLetter, buildComplianceLetter } from "../letter-builder";
import type { ProtestLetterInput, ComplianceLetterInput } from "../letter-types";

const baseProtestInput: ProtestLetterInput = {
  taxpayerName: "Juan dela Cruz",
  tin: "123-456-789-000",
  taxpayerAddress: "123 Rizal Street, Makati City, Metro Manila",
  loaNumber: "LOA-2025-00123",
  loaIssuanceDate: "January 5, 2025",
  loaReceiptDate: "January 10, 2025",
  taxTypes: ["Income Tax", "VAT"],
  taxPeriod: "January 1, 2024 to December 31, 2024",
  assessedAmount: "PHP 500,000.00",
  defenseGrounds: [
    "The LOA was not signed by an authorized revenue officer as required under RMO 19-2007.",
    "The audit scope exceeds the period covered by the LOA in violation of Section 235 of the NIRC.",
  ],
  legalCitations: [
    "Section 235, National Internal Revenue Code (NIRC), as amended",
    "RMO 19-2007, Section 4",
  ],
  addresseeTitle: "Regional Director",
  addresseeOffice: "BIR Regional Office No. 8",
  addresseeAddress: "Makati City, Metro Manila",
};

const baseComplianceInput: ComplianceLetterInput = {
  taxpayerName: "Juan dela Cruz",
  tin: "123-456-789-000",
  taxpayerAddress: "123 Rizal Street, Makati City, Metro Manila",
  loaNumber: "LOA-2025-00123",
  loaReceiptDate: "January 10, 2025",
  taxTypes: ["Income Tax", "VAT"],
  taxPeriod: "January 1, 2024 to December 31, 2024",
  taxpayerPosition: [
    "The taxpayer has maintained proper books of accounts as required under Section 232 of the NIRC.",
    "All income reported is supported by official receipts and relevant documentation.",
  ],
  documentsSubmitted: [
    "Audited Financial Statements for taxable year 2024",
    "Income Tax Return (BIR Form 1702) for 2024",
    "VAT Returns (BIR Form 2550M/Q) for 2024",
  ],
  legalCitations: [
    "Section 232, National Internal Revenue Code (NIRC), as amended",
    "RMO 19-2007, Section 3",
  ],
  revenueOfficerName: "Revenue Officer Maria Santos",
  revenueOfficerOffice: "BIR Revenue District Office No. 47",
  revenueOfficerAddress: "Makati City, Metro Manila",
};

describe("buildProtestLetter", () => {
  it("returns LetterContent with addressee as Regional Director", () => {
    const content = buildProtestLetter(baseProtestInput);
    expect(content.addresseeName).toBe("Regional Director");
    expect(content.addresseeTitle).toBe("Regional Director");
  });

  it("returns RE line containing the LOA number", () => {
    const content = buildProtestLetter(baseProtestInput);
    expect(content.subjectLine).toContain("LOA-2025-00123");
  });

  it("returns RE line with tax types", () => {
    const content = buildProtestLetter(baseProtestInput);
    expect(content.subjectLine).toContain("Income Tax");
    expect(content.subjectLine).toContain("VAT");
  });

  it("returns RE line with taxable period", () => {
    const content = buildProtestLetter(baseProtestInput);
    expect(content.subjectLine).toContain("January 1, 2024 to December 31, 2024");
  });

  it("returns body paragraphs matching defense grounds count (plus opening and closing)", () => {
    const content = buildProtestLetter(baseProtestInput);
    // opening + one per defense ground + closing >= 3
    expect(content.bodyParagraphs.length).toBeGreaterThanOrEqual(
      baseProtestInput.defenseGrounds.length + 2
    );
    // each defense ground appears in the body
    for (const ground of baseProtestInput.defenseGrounds) {
      const found = content.bodyParagraphs.some((p) => p.includes(ground));
      expect(found, `Defense ground not found in body: ${ground}`).toBe(true);
    }
  });

  it("returns a WHEREFORE prayer", () => {
    const content = buildProtestLetter(baseProtestInput);
    expect(content.prayer).toContain("WHEREFORE");
  });

  it("returns all legal citations", () => {
    const content = buildProtestLetter(baseProtestInput);
    for (const citation of baseProtestInput.legalCitations) {
      expect(content.citations).toContain(citation);
    }
  });

  it("sets date as spelled-out format (e.g. April 9, 2026)", () => {
    const content = buildProtestLetter(baseProtestInput);
    // Match e.g. "April 9, 2026" or "January 10, 2025"
    expect(content.date).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
  });

  it("sets signatoryName to taxpayerName in uppercase", () => {
    const content = buildProtestLetter(baseProtestInput);
    expect(content.signatoryName).toBe("JUAN DELA CRUZ");
  });

  it("sets letterType to protest", () => {
    const content = buildProtestLetter(baseProtestInput);
    expect(content.letterType).toBe("protest");
  });
});

describe("buildComplianceLetter", () => {
  it("returns LetterContent with addressee as Revenue Officer", () => {
    const content = buildComplianceLetter(baseComplianceInput);
    expect(content.addresseeName).toBe("Revenue Officer Maria Santos");
  });

  it("returns RE line containing the LOA number", () => {
    const content = buildComplianceLetter(baseComplianceInput);
    expect(content.subjectLine).toContain("LOA-2025-00123");
  });

  it("returns body paragraphs with taxpayer position entries", () => {
    const content = buildComplianceLetter(baseComplianceInput);
    for (const position of baseComplianceInput.taxpayerPosition) {
      const found = content.bodyParagraphs.some((p) => p.includes(position));
      expect(found, `Taxpayer position not found in body: ${position}`).toBe(true);
    }
  });

  it("returns reservation clause in prayer", () => {
    const content = buildComplianceLetter(baseComplianceInput);
    // reservation clause preserves right to raise additional defenses
    expect(content.prayer.toLowerCase()).toMatch(/reserv/);
  });

  it("returns all legal citations", () => {
    const content = buildComplianceLetter(baseComplianceInput);
    for (const citation of baseComplianceInput.legalCitations) {
      expect(content.citations).toContain(citation);
    }
  });

  it("sets letterType to compliance", () => {
    const content = buildComplianceLetter(baseComplianceInput);
    expect(content.letterType).toBe("compliance");
  });

  it("sets signatoryName in uppercase", () => {
    const content = buildComplianceLetter(baseComplianceInput);
    expect(content.signatoryName).toBe("JUAN DELA CRUZ");
  });
});
