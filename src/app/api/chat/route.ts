import { streamText } from "ai";
import { anthropic, CHAT_MODEL, MAX_MESSAGES_BASIC, MAX_MESSAGES_COMPREHENSIVE } from "@/lib/ai/chat-config";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { validateSession } from "@/lib/session";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, sessionToken } = body;

  if (!sessionToken || typeof sessionToken !== "string") {
    return new Response(JSON.stringify({ error: "Session token required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sessionResult = await validateSession(sessionToken);

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

  // Check message limit per D-11 tier differentiation
  const maxMessages = tier === "comprehensive" ? MAX_MESSAGES_COMPREHENSIVE : MAX_MESSAGES_BASIC;
  const existingCount = await db.select({ id: chatMessages.id })
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, session.id));

  if (existingCount.length >= maxMessages) {
    return new Response(
      JSON.stringify({ error: "Message limit reached for this consultation tier" }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // Save the latest user message
  const lastUserMessage = messages[messages.length - 1];
  if (lastUserMessage && lastUserMessage.role === "user") {
    await db.insert(chatMessages).values({
      sessionId: session.id,
      role: "user",
      content: lastUserMessage.content,
    });
  }

  const systemPrompt = buildSystemPrompt(tier);

  const result = streamText({
    model: anthropic(CHAT_MODEL),
    system: systemPrompt,
    messages,
    onFinish: async ({ text }) => {
      // Save assistant response after streaming completes
      await db.insert(chatMessages).values({
        sessionId: session.id,
        role: "assistant",
        content: text,
      });
    },
  });

  return result.toTextStreamResponse();
}
