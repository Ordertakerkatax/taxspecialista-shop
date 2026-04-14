/**
 * GET /api/documents/test-pdf
 *
 * Diagnostic endpoint to verify PDFKit works on Vercel.
 * Generates a minimal test PDF and returns it.
 * Remove this endpoint after confirming PDF generation works.
 */
export const runtime = "nodejs";

export async function GET() {
  try {
    console.log("[test-pdf] Starting PDFKit test...");

    // Dynamic import to test module resolution
    const PDFDocument = (await import("pdfkit")).default;
    console.log("[test-pdf] PDFKit imported successfully");

    const chunks: Buffer[] = [];

    const doc = new PDFDocument({ size: "A4" });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      try {
        doc.font("Helvetica").fontSize(16).text("TaxSpecialista PDF Test", 72, 72);
        doc.fontSize(12).text("If you can see this, PDF generation is working.", 72, 120);
        doc.fontSize(10).text(`Generated at: ${new Date().toISOString()}`, 72, 160);
        doc.end();
      } catch (err) {
        reject(err);
      }
    });

    console.log("[test-pdf] PDF generated successfully, size:", pdfBuffer.length, "bytes");

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="test.pdf"',
        "Cache-Control": "no-store",
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (e) {
    const err = e as Error;
    console.error("[test-pdf] FAILED:", err.message);
    console.error("[test-pdf] Stack:", err.stack);
    return Response.json(
      {
        error: "PDF generation failed",
        message: err.message,
        name: err.name,
      },
      { status: 500 }
    );
  }
}
