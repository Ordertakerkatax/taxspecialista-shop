import { db } from "@/db";
import { consultationSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export type SessionValidationResult =
  | { valid: true; reason: "active"; session: typeof consultationSessions.$inferSelect; readOnly: false }
  | { valid: false; reason: "expired"; session: typeof consultationSessions.$inferSelect; readOnly: true }
  | { valid: false; reason: "not_found"; session: null; readOnly: false };

export async function validateSession(sessionToken: string): Promise<SessionValidationResult> {
  const [session] = await db.select()
    .from(consultationSessions)
    .where(eq(consultationSessions.sessionToken, sessionToken))
    .limit(1);

  if (!session) return { valid: false, reason: "not_found", session: null, readOnly: false };

  const now = new Date();
  const expired = now > session.expiresAt;

  if (expired) {
    return { valid: false, reason: "expired", session, readOnly: true };
  }

  return { valid: true, reason: "active", session, readOnly: false };
}
