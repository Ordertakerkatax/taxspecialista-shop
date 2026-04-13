import type PDFKit from "pdfkit";

/**
 * Adds a diagonal semi-transparent "DRAFT -- FOR REVIEW ONLY" watermark to the
 * current page of a PDFKit document.
 *
 * Per D-04: watermark must be visible but not obscure the text.
 * Uses fillOpacity(0.25) and gray fill (#AAAAAA) for appropriate transparency.
 *
 * Call this inside a bufferPages loop after all content has been rendered:
 *   const range = doc.bufferedPageRange();
 *   for (let i = 0; i < range.count; i++) {
 *     doc.switchToPage(range.start + i);
 *     addDraftWatermark(doc);
 *   }
 */
export function addDraftWatermark(doc: PDFKit.PDFDocument): void {
  // Save current graphics state so we don't pollute subsequent rendering
  doc.save();

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Center of the page
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;

  doc
    .fontSize(60)
    .fillColor("#AAAAAA")
    .fillOpacity(0.25)
    // Rotate -45 degrees around the page center
    .rotate(-45, { origin: [centerX, centerY] })
    .text("DRAFT -- FOR REVIEW ONLY", 0, centerY, {
      align: "center",
      width: pageWidth,
      lineBreak: false,
    });

  // Restore graphics state (resets opacity, color, rotation)
  doc.restore();
}
