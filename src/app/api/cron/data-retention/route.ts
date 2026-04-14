/**
 * GET /api/cron/data-retention
 *
 * Automated data retention enforcement. Runs daily via Vercel Cron.
 *
 * Policy (per Privacy Policy):
 * - Chat messages & consultation sessions: deleted after 90 days
 * - Escalation records: deleted with their parent session
 * - Payment records: retained 3 years (Philippine tax regulations)
 * - Payment screenshots: deleted after 90 days (same as chat data)
 *
 * Security: Protected by CRON_SECRET header check.
 * Vercel Cron automatically sends this header for configured cron jobs.
 */

import { db } from "@/db";
import { chatMessages, consultationSessions, escalations, paymentSubmissions } from "@/db/schema";
import { lt, inArray, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

const CHAT_RETENTION_DAYS = 90;

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron (or authorized caller)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[cron/data-retention] CRON_SECRET not configured");
    return Response.json({ error: "Not configured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - CHAT_RETENTION_DAYS);

  console.log(`[cron/data-retention] Running retention cleanup. Cutoff: ${cutoffDate.toISOString()}`);

  try {
    // Step 1: Find expired sessions (activated more than 90 days ago)
    const expiredSessions = await db.select({ id: consultationSessions.id })
      .from(consultationSessions)
      .where(lt(consultationSessions.activatedAt, cutoffDate));

    if (expiredSessions.length === 0) {
      console.log("[cron/data-retention] No expired sessions found. Nothing to purge.");
      return Response.json({ purged: 0, message: "No expired data found" });
    }

    const sessionIds = expiredSessions.map((s) => s.id);
    console.log(`[cron/data-retention] Found ${sessionIds.length} sessions older than ${CHAT_RETENTION_DAYS} days`);

    // Step 2: Delete chat messages for expired sessions
    const deletedMessages = await db.delete(chatMessages)
      .where(inArray(chatMessages.sessionId, sessionIds))
      .returning({ id: chatMessages.id });

    // Step 3: Delete escalation records for expired sessions
    const deletedEscalations = await db.delete(escalations)
      .where(inArray(escalations.sessionId, sessionIds))
      .returning({ id: escalations.id });

    // Step 4: Delete the consultation sessions themselves
    const deletedSessions = await db.delete(consultationSessions)
      .where(inArray(consultationSessions.id, sessionIds))
      .returning({ id: consultationSessions.id });

    // Step 5: Clear screenshot URLs from payment records older than 90 days
    // (Payment records retained 3 years, but screenshots are PII)
    const clearedScreenshots = await db.update(paymentSubmissions)
      .set({ screenshotUrl: null })
      .where(lt(paymentSubmissions.createdAt, cutoffDate))
      .returning({ id: paymentSubmissions.id });

    const summary = {
      cutoffDate: cutoffDate.toISOString(),
      purged: {
        sessions: deletedSessions.length,
        messages: deletedMessages.length,
        escalations: deletedEscalations.length,
        screenshotsCleared: clearedScreenshots.length,
      },
    };

    console.log("[cron/data-retention] Cleanup complete:", JSON.stringify(summary));

    return Response.json(summary);
  } catch (error) {
    console.error("[cron/data-retention] Error:", error);
    return Response.json({ error: "Retention cleanup failed" }, { status: 500 });
  }
}
