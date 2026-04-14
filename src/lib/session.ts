import { db } from "@/db";
import { consultationSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export type SessionValidationResult =
  | { valid: true; reason: "active"; session: typeof consultationSessions.$inferSelect; readOnly: false }
  | { valid: false; reason: "expired"; session: typeof consultationSessions.$inferSelect; readOnly: true }
  | { valid: false; reason: "not_found"; session: null; readOnly: false }
  | { valid: false; reason: "db_error"; session: null; readOnly: false };

export async function validateSession(sessionToken: string): Promise<SessionValidationResult> {
  try {
    const [session] = await db.select()
      .from(consultationSessions)
      .where(eq(consultationSessions.sessionToken, sessionToken))
      .limit(1);

    if (!session) return { valid: false, reason: "not_found", session: null, readOnly: false };

    const now = new Date();
    // Ensure expiresAt is a proper Date (Neon HTTP driver may return strings)
    const expiresAt = session.expiresAt instanceof Date ? session.expiresAt : new Date(session.expiresAt);
    const expired = now > expiresAt;

    if (expired) {
      return { valid: false, reason: "expired", session, readOnly: true };
    }

    return { valid: true, reason: "active", session, readOnly: false };
  } catch (error) {
    console.error("[session] Database query failed:", error);
    return { valid: false, reason: "db_error", session: null, readOnly: false };
  }
}
