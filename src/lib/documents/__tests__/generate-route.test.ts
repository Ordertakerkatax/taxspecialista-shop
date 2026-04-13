import { describe, it, expect } from "vitest";
import { encodeLetterContent } from "../index";
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
    "Undersigned taxpayer JUAN DELA CRUZ, with TIN 123-456-789-000, hereby files this protest.",
    "1. The LOA was not signed by an authorized revenue officer.",
  ],
  prayer:
    "WHEREFORE, premises considered, undersigned respectfully prays that the LOA be cancelled.",
  signatoryName: "JUAN DELA CRUZ",
  signatoryTin: "123-456-789-000",
  signatoryAddress: "123 Rizal Street, Makati City, Metro Manila",
  citations: [
    "Section 235, National Internal Revenue Code (NIRC), as amended",
    "RMO 19-2007, Section 4",
  ],
  letterType: "protest",
};

describe("encodeLetterContent", () => {
  it("produces a non-empty base64url string", () => {
    const token = encodeLetterContent(sampleContent);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
    // base64url uses A-Z, a-z, 0-9, -, _ (no + or / or = padding)
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("roundtrips: decoded JSON matches original content", () => {
    const token = encodeLetterContent(sampleContent);
    const decoded = JSON.parse(
      Buffer.from(token, "base64url").toString("utf-8")
    ) as LetterContent;
    expect(decoded.date).toBe(sampleContent.date);
    expect(decoded.addresseeName).toBe(sampleContent.addresseeName);
    expect(decoded.signatoryName).toBe(sampleContent.signatoryName);
    expect(decoded.letterType).toBe(sampleContent.letterType);
    expect(decoded.bodyParagraphs).toEqual(sampleContent.bodyParagraphs);
    expect(decoded.citations).toEqual(sampleContent.citations);
    expect(decoded.prayer).toBe(sampleContent.prayer);
  });

  it("produces different tokens for different content", () => {
    const token1 = encodeLetterContent(sampleContent);
    const token2 = encodeLetterContent({
      ...sampleContent,
      letterType: "compliance",
      addresseeName: "Revenue Officer Maria Santos",
    });
    expect(token1).not.toBe(token2);
  });

  it("produces a token that decodes to valid LetterContent letterType", () => {
    const token = encodeLetterContent(sampleContent);
    const decoded = JSON.parse(
      Buffer.from(token, "base64url").toString("utf-8")
    ) as LetterContent;
    expect(["protest", "compliance"]).toContain(decoded.letterType);
  });
});
