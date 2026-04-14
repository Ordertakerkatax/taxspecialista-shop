// PDFKit is loaded lazily via dynamic import() inside letterToPdf().
// Static imports of PDFKit crash Vercel serverless functions at module init
// because PDFKit's font data files (.afm) can't be resolved by the bundler,
// causing the entire function to fail to register (404 instead of 500).
import { addDraftWatermark } from "./watermark";
import type { LetterContent } from "./letter-types";

/** A4 dimensions in points (72 points per inch) */
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 72; // 1 inch

/** Font sizes */
const FONT_BODY = 11;
const FONT_SMALL = 9;
const FONT_HEADING = 12;

/**
 * Renders the structured letter content onto the PDFKit document.
 * Does NOT call doc.end() — callers manage the document lifecycle.
 */
function renderLetterContent(
  doc: PDFKit.PDFDocument,
  content: LetterContent
): void {
  const contentWidth = A4_WIDTH - MARGIN * 2;

  // --- Date (right-aligned) ---
  doc
    .font("Helvetica")
    .fontSize(FONT_BODY)
    .text(content.date, MARGIN, MARGIN, {
      width: contentWidth,
      align: "right",
    });

  doc.moveDown(1.5);

  // --- Addressee block ---
  doc
    .font("Helvetica-Bold")
    .fontSize(FONT_BODY)
    .text(content.addresseeName, { align: "left" });

  doc
    .font("Helvetica")
    .fontSize(FONT_BODY)
    .text(content.addresseeTitle);

  doc.text(content.addresseeOffice);
  doc.text(content.addresseeAddress);

  doc.moveDown(1.5);

  // --- RE line (subject) ---
  doc.font("Helvetica-Bold").fontSize(FONT_BODY).text("RE: ", {
    continued: true,
    align: "left",
  });

  doc
    .font("Helvetica")
    .fontSize(FONT_BODY)
    .text(content.subjectLine, { width: contentWidth });

  doc.moveDown(1.5);

  // --- Salutation ---
  doc
    .font("Helvetica")
    .fontSize(FONT_BODY)
    .text(content.salutation);

  doc.moveDown(1);

  // --- Body paragraphs ---
  for (const paragraph of content.bodyParagraphs) {
    doc
      .font("Helvetica")
      .fontSize(FONT_BODY)
      .text(paragraph, {
        width: contentWidth,
        align: "justify",
        lineGap: 2,
      });
    doc.moveDown(0.8);
  }

  doc.moveDown(0.5);

  // --- Prayer / Relief ---
  doc
    .font("Helvetica-Bold")
    .fontSize(FONT_BODY)
    .text("PRAYER:", { align: "left" });

  doc.moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(FONT_BODY)
    .text(content.prayer, {
      width: contentWidth,
      align: "justify",
      lineGap: 2,
    });

  doc.moveDown(2);

  // --- Closing ---
  doc
    .font("Helvetica")
    .fontSize(FONT_BODY)
    .text("Respectfully submitted,", { align: "left" });

  doc.moveDown(2);

  // --- Signatory block ---
  doc
    .font("Helvetica-Bold")
    .fontSize(FONT_BODY)
    .text(content.signatoryName, { align: "left" });

  doc
    .font("Helvetica")
    .fontSize(FONT_BODY)
    .text(`TIN: ${content.signatoryTin}`);

  doc.text(content.signatoryAddress, { width: contentWidth });

  // --- Horizontal rule ---
  doc.moveDown(1.5);
  const currentY = doc.y;
  doc
    .moveTo(MARGIN, currentY)
    .lineTo(A4_WIDTH - MARGIN, currentY)
    .strokeColor("#888888")
    .stroke();

  doc.moveDown(0.5);

  // --- Legal citations footer ---
  doc
    .font("Helvetica-Bold")
    .fontSize(FONT_SMALL)
    .text("Legal Citations:", { align: "left" });

  for (const citation of content.citations) {
    doc
      .font("Helvetica")
      .fontSize(FONT_SMALL)
      .text(`• ${citation}`, { width: contentWidth });
  }

  // --- Disclaimer ---
  doc.moveDown(0.5);
  doc
    .font("Helvetica-Oblique")
    .fontSize(FONT_SMALL)
    .fillColor("#666666")
    .text(
      "DISCLAIMER: This document is a DRAFT generated for advisory and review purposes only. " +
        "It does not constitute formal legal or tax advice. Please consult a qualified tax counsel " +
        "before submitting this letter to the Bureau of Internal Revenue.",
      { width: contentWidth, align: "left" }
    );
}

/**
 * Converts a LetterContent object to a PDF Buffer with DRAFT watermark on every page.
 *
 * Per D-01 (PDF format), D-02 (server-side), D-04 (DRAFT watermark on every page).
 * Uses PDFKit with bufferPages: true to enable post-render watermarking.
 */
export async function letterToPdf(content: LetterContent): Promise<Buffer> {
  // Dynamic import — avoids crashing the serverless function at module init
  const PDFDocument = (await import("pdfkit")).default;

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: MARGIN,
        bottom: MARGIN,
        left: MARGIN,
        right: MARGIN,
      },
      // bufferPages: true allows iterating all pages after rendering to add watermarks
      bufferPages: true,
      info: {
        Title: `Draft ${{ protest: "Protest", compliance: "Compliance Reply", "nod-response": "NOD Response", acknowledgment: "Acknowledgment" }[content.letterType] ?? "Legal"} Letter`,
        Author: content.signatoryName,
        Subject: content.subjectLine,
        Creator: "BIR Advisory Chatbot — TaxSpecialista",
      },
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      // Render all letter content
      renderLetterContent(doc, content);

      // After all content is rendered, iterate every buffered page and add watermark
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i);
        addDraftWatermark(doc);
      }

      // Flush all buffered pages and finalize the document
      doc.flushPages();
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
