import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { consultationSessions, chatMessages } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { NextRequest } from "next/server";
import PDFDocument from "pdfkit";

export const runtime = "nodejs";

/** A4 dimensions in points (72 points per inch) */
const A4_WIDTH = 595.28;
const MARGIN = 72; // 1 inch

/** Font sizes */
const FONT_BODY = 10;
const FONT_SMALL = 9;
const FONT_TITLE = 16;

const DISCLAIMER =
  "This consultation transcript is provided for informational and reference purposes only. " +
  "It does not constitute formal legal or tax advice. Consult a qualified tax counsel before " +
  "taking any action in response to BIR proceedings.";

async function generateTranscriptPdf(
  messages: { role: string; content: string }[],
  tier: string,
  activatedAt: Date
): Promise<Buffer> {
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
        Title: "Consultation Transcript",
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
        .text("CONSULTATION TRANSCRIPT", MARGIN, MARGIN, {
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

      // --- Consultation Details ---
      const formattedDate = new Intl.DateTimeFormat("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(activatedAt);

      doc
        .font("Helvetica")
        .fontSize(FONT_BODY)
        .fillColor("#000000")
        .text(`Date: ${formattedDate}`);
      doc.text(`Tier: ${tier === "comprehensive" ? "Comprehensive" : "Basic"}`);

      doc.moveDown(1.2);

      // --- Messages ---
      for (const message of messages) {
        const roleLabel = message.role === "user" ? "YOU:" : "ADVISOR:";

        doc
          .font("Helvetica-Bold")
          .fontSize(FONT_BODY)
          .fillColor("#000000")
          .text(roleLabel, { width: contentWidth });

        doc
          .font("Helvetica")
          .fontSize(FONT_BODY)
          .fillColor("#000000")
          .text(message.content, { width: contentWidth });

        doc.moveDown(0.5);
      }

      doc.moveDown(1);

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
        .text(DISCLAIMER, { width: contentWidth, align: "left" });

      // --- Page numbers ---
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc
          .font("Helvetica")
          .fontSize(FONT_SMALL)
          .fillColor("#999999")
          .text(
            `Page ${i + 1} of ${totalPages}`,
            MARGIN,
            doc.page.height - MARGIN / 2,
            { width: contentWidth, align: "center" }
          );
      }

      doc.flushPages();
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return new Response("sessionId query parameter is required", {
      status: 400,
    });
  }

  // Verify session ownership (T-eu3-01, T-eu3-02)
  const sessionRows = await db
    .select()
    .from(consultationSessions)
    .where(
      and(
        eq(consultationSessions.id, sessionId),
        eq(consultationSessions.userId, user.id)
      )
    )
    .limit(1);

  if (sessionRows.length === 0) {
    return new Response("Forbidden", { status: 403 });
  }

  const session = sessionRows[0];

  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, session.id))
    .orderBy(asc(chatMessages.createdAt));

  if (messages.length === 0) {
    return new Response("No chat history found for this consultation.", {
      status: 404,
    });
  }

  try {
    const pdfBuffer = await generateTranscriptPdf(
      messages.map((m) => ({ role: m.role, content: m.content })),
      session.tier,
      session.activatedAt
    );

    const shortId = sessionId.slice(0, 8);

    return new Response(pdfBuffer.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="consultation-transcript-${shortId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[transcript/route] Failed to generate transcript PDF:", err);
    return new Response("Failed to generate transcript", { status: 500 });
  }
}
