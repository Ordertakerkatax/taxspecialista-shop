import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { consultationSessions, chatMessages } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { ChatInterface } from "@/components/chat/chat-interface";

export const dynamic = "force-dynamic";

interface HistorySessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function HistorySessionPage({
  params,
}: HistorySessionPageProps) {
  const { sessionId } = await params;
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Verify session ownership: session must belong to this user
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
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-base mb-4">
          Consultation not found.
        </p>
        <Link
          href="/account/history"
          className="text-teal-600 hover:text-teal-700 hover:underline text-sm font-medium"
        >
          Back to History
        </Link>
      </div>
    );
  }

  const session = sessionRows[0];

  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, session.id))
    .orderBy(asc(chatMessages.createdAt));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/account/history"
          className="text-sm text-teal-600 hover:text-teal-700 hover:underline font-medium"
        >
          &larr; Back to History
        </Link>
        <a
          href={`/api/account/summary?sessionId=${session.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-600 hover:text-gray-700 hover:underline font-medium"
        >
          Download Summary
        </a>
      </div>

      <ChatInterface
        sessionToken={session.sessionToken}
        sessionId={session.id}
        tier={session.tier as "basic" | "comprehensive"}
        initialMessages={messages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
        }))}
        readOnly={true}
      />
    </div>
  );
}
