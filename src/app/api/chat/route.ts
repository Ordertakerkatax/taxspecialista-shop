import { streamText, stepCountIs } from "ai";
import { calculateDeadlinesTool, calculatePrescriptionTool, checkWaiverValidityTool, createDocumentTools, createEscalationTools } from "@/lib/ai/tools";
import { getAnthropic, CHAT_MODEL, MAX_MESSAGES_BASIC, MAX_MESSAGES_COMPREHENSIVE } from "@/lib/ai/chat-config";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { validateSession } from "@/lib/session";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Extract text content from a message (handles both v6 parts[] and legacy content string)
function getMessageText(msg: Record<string, unknown>): string {
  if (typeof msg.content === "string") return msg.content;
  const parts = msg.parts as Array<{ type: string; text?: string }> | undefined;
  if (parts) {
    const textPart = parts.find((p) => p.type === "text");
    return textPart?.text ?? "";
  }
  return "";
}

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, sessionToken } = body;

  if (!sessionToken || typeof sessionToken !== "string") {
    return new Response(JSON.stringify({ error: "Session token required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Messages array required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sessionResult = await validateSession(sessionToken);

  if (sessionResult.reason === "db_error") {
    return new Response(JSON.stringify({ error: "Temporary service issue. Please try again in a moment." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (sessionResult.reason === "not_found") {
    return new Response(JSON.stringify({ error: "Invalid session" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (sessionResult.reason === "expired") {
    return new Response(JSON.stringify({ error: "Session expired" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = sessionResult.session;
  const tier = session.tier as "basic" | "comprehensive";

  // Check message limit (counted by user messages only — AI responses don't consume credits)
  const maxMessages = tier === "comprehensive" ? MAX_MESSAGES_COMPREHENSIVE : MAX_MESSAGES_BASIC;
  const existingUserMessages = await db.select({ id: chatMessages.id })
    .from(chatMessages)
    .where(and(
      eq(chatMessages.sessionId, session.id),
      eq(chatMessages.role, "user"),
    ));

  if (existingUserMessages.length >= maxMessages) {
    return new Response(
      JSON.stringify({ error: "Message limit reached for this consultation tier" }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // Save the latest user message
  const lastMsg = messages[messages.length - 1];
  if (lastMsg && lastMsg.role === "user") {
    const userContent = getMessageText(lastMsg);
    if (userContent) {
      await db.insert(chatMessages).values({
        sessionId: session.id,
        role: "user",
        content: userContent,
      });
    }
  }

  // Convert messages to simple {role, content} format for streamText
  const simpleMessages = messages.map((m: Record<string, unknown>) => ({
    role: m.role as "user" | "assistant",
    content: getMessageText(m),
  }));

  const systemPrompt = buildSystemPrompt(tier);

  try {
    const result = streamText({
      model: getAnthropic()(CHAT_MODEL),
      system: systemPrompt,
      messages: simpleMessages,
      tools: {
        calculateDeadlines: calculateDeadlinesTool,
        calculatePrescription: calculatePrescriptionTool,
        checkWaiverValidity: checkWaiverValidityTool,
        // Tier-based tool registration:
        // Basic: only acknowledgment letters, no escalation
        // Comprehensive: all document tools + escalation
        ...(tier === "comprehensive"
          ? (() => {
              const docTools = createDocumentTools(sessionToken);
              const escTools = createEscalationTools(session.id, session.email);
              return {
                generateComplianceLetter: docTools.generateComplianceLetter,
                generateNodResponseLetter: docTools.generateNodResponseLetter,
                generateAcknowledgmentLetter: docTools.generateAcknowledgmentLetter,
                assessComplexity: escTools.assessComplexity,
              };
            })()
          : (() => {
              const docTools = createDocumentTools(sessionToken);
              return {
                generateAcknowledgmentLetter: docTools.generateAcknowledgmentLetter,
              };
            })()),
      },
      stopWhen: stepCountIs(5),
      onFinish: async ({ text }) => {
        try {
          await db.insert(chatMessages).values({
            sessionId: session.id,
            role: "assistant",
            content: text,
          });
        } catch (err) {
          console.error("[chat] Failed to persist assistant message:", err);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[chat] Error:", error);
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
