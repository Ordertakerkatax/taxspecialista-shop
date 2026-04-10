/**
 * PDF generator for BIR tax dispute advisory letters using PDFKit.
 * Applies a DRAFT watermark on every page using bufferPages: true.
 */

import PDFDocument from "pdfkit";
import type { Letter, LoaReplyLetter, ProtestLetter } from "./letter-types";

// ============================================================
// Layout constants
// ============================================================

const MARGIN = 72; // 1 inch in points
const PAGE_WIDTH = 612; // US Letter width
const PAGE_HEIGHT = 792; // US Letter height
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// Typography
const FONT_REGULAR = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";
const FONT_OBLIQUE = "Helvetica-Oblique";

// Colours
const COLOR_BLACK = "#1a1a1a";
const COLOR_WATERMARK = "#e0e0e0";
const COLOR_HEADING = "#1a1a1a";
const COLOR_DISCLAIMER = "#666666";

// Sizes
const SIZE_BODY = 11;
const SIZE_HEADING = 12;
const SIZE_SUBJECT = 11;
const SIZE_SMALL = 9;
const SIZE_WATERMARK = 72;

// Line height multiplier
const LINE_GAP = 4;

// ============================================================
// Public API
// ============================================================

/**
 * Generate a PDF buffer from a structured Letter object.
 * Every page will carry a diagonal DRAFT watermark.
 *
 * @param letter - The structured letter produced by buildLetter()
 * @returns A Buffer containing the complete PDF binary
 */
export async function generateLetterPdf(letter: Letter): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];

    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
      bufferPages: true, // Required for per-page watermark pass
      info: {
        Title: letter.subject,
        Author: "TaxSpecialista Consult",
        Creator: "TaxSpecialista Consult",
        Subject: `${letter.type === "loa_reply" ? "LOA Reply" : "Protest Letter"} — DRAFT`,
      },
    });

    doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // --------------------------------------------------------
    // Write content
    // --------------------------------------------------------
    writeLetterContent(doc, letter);

    // --------------------------------------------------------
    // Watermark pass — iterate all buffered pages
    // --------------------------------------------------------
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      drawDraftWatermark(doc);
    }

    doc.end();
  });
}

// ============================================================
// Content writer
// ============================================================

function writeLetterContent(doc: PDFKit.PDFDocument, letter: Letter) {
  // Letterhead
  writeLetterhead(doc);
  doc.moveDown(1.5);

  // Date line
  doc
    .font(FONT_REGULAR)
    .fontSize(SIZE_BODY)
    .fillColor(COLOR_BLACK)
    .text(letter.generatedAt, { align: "right" });
  doc.moveDown(1);

  // Recipient block
  for (const line of letter.recipientBlock) {
    doc.font(FONT_REGULAR).fontSize(SIZE_BODY).fillColor(COLOR_BLACK).text(line);
  }
  doc.moveDown(1);

  // Subject
  doc
    .font(FONT_BOLD)
    .fontSize(SIZE_SUBJECT)
    .fillColor(COLOR_BLACK)
    .text("RE: ", { continued: true })
    .font(FONT_REGULAR)
    .text(letter.subject.replace(/^RE:\s*/i, ""));
  doc.moveDown(1);

  // Salutation
  doc
    .font(FONT_REGULAR)
    .fontSize(SIZE_BODY)
    .fillColor(COLOR_BLACK)
    .text(letter.salutation);
  doc.moveDown(1);

  // Sections
  for (const section of letter.sections) {
    if (section.heading) {
      doc
        .font(FONT_BOLD)
        .fontSize(SIZE_HEADING)
        .fillColor(COLOR_HEADING)
        .text(section.heading);
      doc.moveDown(0.5);
    }

    for (const para of section.paragraphs) {
      doc
        .font(FONT_REGULAR)
        .fontSize(SIZE_BODY)
        .fillColor(COLOR_BLACK)
        .text(para, { align: "justify", lineGap: LINE_GAP });
      doc.moveDown(0.75);
    }
  }

  // Relief section (protest letters only)
  if (letter.type === "protest_letter") {
    const protestLetter = letter as ProtestLetter;
    if (protestLetter.reliefSection) {
      if (protestLetter.reliefSection.heading) {
        doc
          .font(FONT_BOLD)
          .fontSize(SIZE_HEADING)
          .fillColor(COLOR_HEADING)
          .text(protestLetter.reliefSection.heading);
        doc.moveDown(0.5);
      }
      for (const para of protestLetter.reliefSection.paragraphs) {
        doc
          .font(FONT_REGULAR)
          .fontSize(SIZE_BODY)
          .fillColor(COLOR_BLACK)
          .text(para, { align: "justify", lineGap: LINE_GAP });
        doc.moveDown(0.75);
      }
    }
  }

  // Closing paragraph
  doc
    .font(FONT_REGULAR)
    .fontSize(SIZE_BODY)
    .fillColor(COLOR_BLACK)
    .text(letter.closingParagraph, { align: "justify", lineGap: LINE_GAP });
  doc.moveDown(2);

  // Signature block
  doc
    .font(FONT_REGULAR)
    .fontSize(SIZE_BODY)
    .fillColor(COLOR_BLACK)
    .text("Respectfully submitted,");
  doc.moveDown(2.5);
  doc
    .font(FONT_BOLD)
    .fontSize(SIZE_BODY)
    .fillColor(COLOR_BLACK)
    .text("[Taxpayer / Authorized Representative]");
  doc
    .font(FONT_REGULAR)
    .fontSize(SIZE_SMALL)
    .fillColor(COLOR_BLACK)
    .text("Name and Signature");
  doc.moveDown(1);
  doc
    .font(FONT_REGULAR)
    .fontSize(SIZE_SMALL)
    .fillColor(COLOR_BLACK)
    .text("TIN: [Taxpayer TIN]");

  // Citations
  if (letter.citations.length > 0) {
    doc.moveDown(2);
    doc
      .moveTo(MARGIN, doc.y)
      .lineTo(MARGIN + CONTENT_WIDTH * 0.4, doc.y)
      .stroke(COLOR_DISCLAIMER);
    doc.moveDown(0.5);

    doc
      .font(FONT_BOLD)
      .fontSize(SIZE_SMALL)
      .fillColor(COLOR_DISCLAIMER)
      .text("References:");
    doc.moveDown(0.25);

    for (const citation of letter.citations) {
      doc
        .font(FONT_REGULAR)
        .fontSize(SIZE_SMALL)
        .fillColor(COLOR_DISCLAIMER)
        .text(`[${citation.number}] ${citation.text}`, { lineGap: 2 });
    }
  }

  // Disclaimer — always last, on a potentially new page
  doc.moveDown(2);
  const disclaimerY = doc.y;
  const pageBottom = PAGE_HEIGHT - MARGIN;

  // If less than 80pt from bottom, add a new page for the disclaimer
  if (pageBottom - disclaimerY < 80) {
    doc.addPage();
  }

  doc
    .font(FONT_OBLIQUE)
    .fontSize(SIZE_SMALL)
    .fillColor(COLOR_DISCLAIMER)
    .text(letter.disclaimer, { align: "left", lineGap: 2 });
}

// ============================================================
// Letterhead
// ============================================================

function writeLetterhead(doc: PDFKit.PDFDocument) {
  doc
    .font(FONT_BOLD)
    .fontSize(14)
    .fillColor(COLOR_BLACK)
    .text("TaxSpecialista Consult", { align: "center" });

  doc
    .font(FONT_REGULAR)
    .fontSize(SIZE_SMALL)
    .fillColor(COLOR_DISCLAIMER)
    .text("AI-Assisted BIR Tax Dispute Advisory | consult.taxspecialista.com", { align: "center" });

  // Horizontal rule
  doc.moveDown(0.5);
  doc
    .moveTo(MARGIN, doc.y)
    .lineTo(MARGIN + CONTENT_WIDTH, doc.y)
    .stroke(COLOR_DISCLAIMER);
}

// ============================================================
// Watermark
// ============================================================

/**
 * Draw a diagonal DRAFT watermark on the current page.
 * Must be called within a bufferedPages loop using switchToPage().
 */
function drawDraftWatermark(doc: PDFKit.PDFDocument) {
  doc.save();

  // Move to page centre
  doc.translate(PAGE_WIDTH / 2, PAGE_HEIGHT / 2);

  // Rotate 45 degrees (counterclockwise for diagonal up-left to down-right)
  doc.rotate(-45, { origin: [0, 0] });

  doc
    .font(FONT_BOLD)
    .fontSize(SIZE_WATERMARK)
    .fillColor(COLOR_WATERMARK)
    .fillOpacity(0.35)
    .text("DRAFT", 0, 0, {
      align: "center",
      lineBreak: false,
    });

  doc.restore();
}
