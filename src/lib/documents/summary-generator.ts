// PDFKit loaded lazily via dynamic import() inside summaryToPdf() — see pdf-generator.ts
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

/** A4 dimensions in points (72 points per inch) */
const A4_WIDTH = 595.28;
const MARGIN = 72; // 1 inch

/** Font sizes */
const FONT_BODY = 11;
const FONT_SMALL = 9;
const FONT_HEADING = 13;
const FONT_TITLE = 16;

export interface ConsultationSummary {
  consultationDate: string;
  tier: "basic" | "comprehensive";
  birStage: string;
  keyDates: string[];
  legalCitations: string[];
  advisoryHighlights: string[];
  disclaimer: string;
}

const summarySchema = z.object({
  birStage: z
    .string()
    .describe(
      "The BIR dispute stage discussed, e.g. 'Letter of Authority (LOA)', 'Preliminary Assessment Notice (PAN)', 'Final Assessment Notice (FAN)'"
    ),
  keyDates: z
    .array(z.string())
    .describe("Deadlines and key dates mentioned in the consultation"),
  legalCitations: z
    .array(z.string())
    .describe(
      "Legal citations mentioned: NIRC sections, RMOs, Revenue Regulations, CTA decisions"
    ),
  advisoryHighlights: z
    .array(z.string())
    .describe(
      "Main advisory points and recommendations given during the consultation"
    ),
});

/**
 * Uses Claude to extract a structured summary from consultation chat messages.
 * The consultationDate and tier are injected from session data, not extracted by AI.
 */
async function extractSummaryFromMessages(
  messages: { role: string; content: string }[],
  tier: "basic" | "comprehensive",
  consultationDate: Date
): Promise<ConsultationSummary> {
  const chatTranscript = messages
    .map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
    .join("\n\n");

  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-5"),
    schema: summarySchema,
    system:
      "You are a legal advisory summarizer for Philippine BIR tax dispute consultations. " +
      "Extract a structured summary from the following consultation chat history. " +
      "Identify the BIR stage discussed, key dates/deadlines mentioned, legal citations " +
      "(NIRC sections, RMOs, RRs, CTA decisions), and the main advisory points given. " +
      "Be concise and accurate. If information is not present in the transcript, return an empty array.",
    prompt: chatTranscript,
  });

  const formattedDate = new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(consultationDate);

  return {
    consultationDate: formattedDate,
    tier,
    birStage: object.birStage,
    keyDates: object.keyDates,
    legalCitations: object.legalCitations,
    advisoryHighlights: object.advisoryHighlights,
    disclaimer:
      "This consultation summary is generated for informational and reference purposes only. " +
      "It does not constitute formal legal or tax advice. Consult a qualified tax counsel before " +
      "taking any action in response to BIR proceedings.",
  };
}

/**
 * Renders a ConsultationSummary as an A4 PDF Buffer using PDFKit.
 * No DRAFT watermark — summaries are final documents, unlike draft letters.
 */
async function summaryToPdf(summary: ConsultationSummary): Promise<Buffer> {
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
      bufferPages: true,
      info: {
        Title: "Consultation Summary",
        Creator: "BIR Advisory Chatbot - TaxSpecialista",
      },
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      const contentWidth = A4_WIDTH - MARGIN * 2;

      // --- Title ---
      doc
        .font("Helvetica-Bold")
        .fontSize(FONT_TITLE)
        .text("CONSULTATION SUMMARY", MARGIN, MARGIN, {
          width: contentWidth,
          align: "center",
        });

      doc.moveDown(0.5);

      // Horizontal rule under title
      const titleY = doc.y;
      doc
        .moveTo(MARGIN, titleY)
        .lineTo(A4_WIDTH - MARGIN, titleY)
        .strokeColor("#CCCCCC")
        .stroke();

      doc.moveDown(1.2);

      // --- Section: Consultation Details ---
      doc
        .font("Helvetica-Bold")
        .fontSize(FONT_HEADING)
        .fillColor("#000000")
        .text("Consultation Details", { align: "left" });

      doc.moveDown(0.4);

      doc
        .font("Helvetica")
        .fontSize(FONT_BODY)
        .text(`Date: ${summary.consultationDate}`);
      doc.text(
        `Tier: ${summary.tier === "comprehensive" ? "Comprehensive" : "Basic"}`
      );

      doc.moveDown(1);

      // --- Section: BIR Stage ---
      doc
        .font("Helvetica-Bold")
        .fontSize(FONT_HEADING)
        .text("BIR Stage Identified");

      doc.moveDown(0.4);

      doc
        .font("Helvetica")
        .fontSize(FONT_BODY)
        .text(summary.birStage, { width: contentWidth });

      doc.moveDown(1);

      // --- Section: Key Dates & Deadlines ---
      doc
        .font("Helvetica-Bold")
        .fontSize(FONT_HEADING)
        .text("Key Dates & Deadlines");

      doc.moveDown(0.4);

      if (summary.keyDates.length === 0) {
        doc
          .font("Helvetica-Oblique")
          .fontSize(FONT_BODY)
          .fillColor("#666666")
          .text("No specific dates identified.", { width: contentWidth });
      } else {
        for (const date of summary.keyDates) {
          doc
            .font("Helvetica")
            .fontSize(FONT_BODY)
            .fillColor("#000000")
            .text(`\u2022 ${date}`, { width: contentWidth });
        }
      }

      doc.moveDown(1);

      // --- Section: Legal Citations ---
      doc
        .font("Helvetica-Bold")
        .fontSize(FONT_HEADING)
        .fillColor("#000000")
        .text("Legal Citations Referenced");

      doc.moveDown(0.4);

      if (summary.legalCitations.length === 0) {
        doc
          .font("Helvetica-Oblique")
          .fontSize(FONT_BODY)
          .fillColor("#666666")
          .text("No specific legal citations identified.", { width: contentWidth });
      } else {
        for (const citation of summary.legalCitations) {
          doc
            .font("Helvetica")
            .fontSize(FONT_BODY)
            .fillColor("#000000")
            .text(`\u2022 ${citation}`, { width: contentWidth });
        }
      }

      doc.moveDown(1);

      // --- Section: Advisory Highlights ---
      doc
        .font("Helvetica-Bold")
        .fontSize(FONT_HEADING)
        .fillColor("#000000")
        .text("Advisory Highlights");

      doc.moveDown(0.4);

      if (summary.advisoryHighlights.length === 0) {
        doc
          .font("Helvetica-Oblique")
          .fontSize(FONT_BODY)
          .fillColor("#666666")
          .text("No advisory highlights recorded.", { width: contentWidth });
      } else {
        summary.advisoryHighlights.forEach((highlight, idx) => {
          doc
            .font("Helvetica")
            .fontSize(FONT_BODY)
            .fillColor("#000000")
            .text(`${idx + 1}. ${highlight}`, {
              width: contentWidth,
              lineGap: 2,
            });
          doc.moveDown(0.3);
        });
      }

      doc.moveDown(1.5);

      // Horizontal rule before disclaimer
      const disclaimerY = doc.y;
      doc
        .moveTo(MARGIN, disclaimerY)
        .lineTo(A4_WIDTH - MARGIN, disclaimerY)
        .strokeColor("#CCCCCC")
        .stroke();

      doc.moveDown(0.8);

      // --- Disclaimer ---
      doc
        .font("Helvetica-Oblique")
        .fontSize(FONT_SMALL)
        .fillColor("#666666")
        .text(summary.disclaimer, { width: contentWidth, align: "left" });

      // No watermark — summaries are final documents, not drafts
      doc.flushPages();
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Public API: generates an AI-extracted consultation summary PDF.
 * Called by the /api/account/summary download endpoint.
 */
export async function generateSummaryPdf(
  messages: { role: string; content: string }[],
  tier: "basic" | "comprehensive",
  consultationDate: Date
): Promise<Buffer> {
  const summary = await extractSummaryFromMessages(
    messages,
    tier,
    consultationDate
  );
  return summaryToPdf(summary);
}
