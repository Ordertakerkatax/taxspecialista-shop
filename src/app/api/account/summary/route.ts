import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { consultationSessions, chatMessages } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { generateSummaryPdf } from "@/lib/documents/summary-generator";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

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

  // Verify session ownership (T-06-06, T-06-08)
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
    const pdfBuffer = await generateSummaryPdf(
      messages.map((m) => ({ role: m.role, content: m.content })),
      session.tier as "basic" | "comprehensive",
      session.activatedAt
    );

    const shortId = sessionId.slice(0, 8);

    return new Response(pdfBuffer.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="consultation-summary-${shortId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[summary/route] Failed to generate summary PDF:", err);
    return new Response("Failed to generate summary", { status: 500 });
  }
}
