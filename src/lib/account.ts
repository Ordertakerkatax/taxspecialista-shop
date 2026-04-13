import { db } from "@/db";
import { consultationSessions } from "@/db/schema";
import { eq, isNull, and } from "drizzle-orm";

/**
 * Links all anonymous consultationSessions with matching email to the given Clerk userId.
 * Only links sessions where userId IS NULL to prevent re-linking to a different account.
 * Returns the count of linked sessions.
 */
export async function linkSessionsByEmail(userId: string, email: string): Promise<number> {
  const result = await db
    .update(consultationSessions)
    .set({ userId })
    .where(
      and(
        eq(consultationSessions.email, email),
        isNull(consultationSessions.userId)
      )
    )
    .returning({ id: consultationSessions.id });

  return result.length;
}

/**
 * Returns all consultationSessions for the given Clerk userId, ordered by createdAt descending.
 * Used by the account history page (Plan 02).
 */
export async function getUserSessions(userId: string) {
  return db
    .select({
      id: consultationSessions.id,
      email: consultationSessions.email,
      tier: consultationSessions.tier,
      activatedAt: consultationSessions.activatedAt,
      expiresAt: consultationSessions.expiresAt,
      createdAt: consultationSessions.createdAt,
    })
    .from(consultationSessions)
    .where(eq(consultationSessions.userId, userId))
    .orderBy(consultationSessions.createdAt);
}
