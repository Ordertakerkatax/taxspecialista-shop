import { describe, it, expect } from "vitest";
import { letterToPdf } from "../pdf-generator";
import type { LetterContent } from "../letter-types";

const sampleContent: LetterContent = {
  date: "April 9, 2026",
  addresseeName: "Regional Director",
  addresseeTitle: "Regional Director",
  addresseeOffice: "BIR Regional Office No. 8",
  addresseeAddress: "Makati City, Metro Manila",
  subjectLine:
    "PROTEST TO LETTER OF AUTHORITY NO. LOA-2025-00123 / TAX TYPE: Income Tax, VAT / TAXABLE PERIOD: January 1, 2024 to December 31, 2024",
  salutation: "Dear Sir/Madam:",
  bodyParagraphs: [
    "Undersigned taxpayer JUAN DELA CRUZ, with TIN 123-456-789-000, hereby files this protest against the above-captioned Letter of Authority.",
    "1. The LOA was not signed by an authorized revenue officer as required under RMO 19-2007, Section 4.",
    "2. The audit scope exceeds the period covered by the LOA in violation of Section 235 of the NIRC.",
    "Accordingly, the above LOA has no legal force and effect and must be declared null and void.",
  ],
  prayer:
    "WHEREFORE, premises considered, undersigned respectfully prays that the above-captioned Letter of Authority be cancelled and withdrawn.",
  signatoryName: "JUAN DELA CRUZ",
  signatoryTin: "123-456-789-000",
  signatoryAddress: "123 Rizal Street, Makati City, Metro Manila",
  citations: [
    "Section 235, National Internal Revenue Code (NIRC), as amended",
    "RMO 19-2007, Section 4",
  ],
  letterType: "protest",
};

describe("letterToPdf", () => {
  it("returns a Buffer that starts with PDF magic bytes (%PDF-)", async () => {
    const buffer = await letterToPdf(sampleContent);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    // PDF magic bytes: %PDF-
    const header = buffer.toString("ascii", 0, 5);
    expect(header).toBe("%PDF-");
  });

  it("returns a non-empty buffer", async () => {
    const buffer = await letterToPdf(sampleContent);
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("does not crash with multi-paragraph content", async () => {
    const multiPageContent: LetterContent = {
      ...sampleContent,
      bodyParagraphs: Array.from(
        { length: 30 },
        (_, i) =>
          `${i + 1}. This is paragraph ${i + 1} with substantial content to test that the PDF generator handles multiple paragraphs and potential page overflow correctly without crashing. The paragraph includes legal citations and references to Philippine tax law.`
      ),
    };
    const buffer = await letterToPdf(multiPageContent);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("produces a compliance letter PDF without crashing", async () => {
    const complianceContent: LetterContent = {
      ...sampleContent,
      letterType: "compliance",
      addresseeName: "Revenue Officer Maria Santos",
      addresseeTitle: "Revenue Officer",
      prayer:
        "ACCORDINGLY, undersigned respectfully submits the foregoing in compliance with the LOA, reserving all rights to raise additional defenses as may be appropriate.",
    };
    const buffer = await letterToPdf(complianceContent);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    const header = buffer.toString("ascii", 0, 5);
    expect(header).toBe("%PDF-");
  });
});
