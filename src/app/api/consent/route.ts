/**
 * POST /api/consent
 *
 * Records the user's acceptance of the consultation disclaimer.
 * Sets consentedAt timestamp on the consultation session.
 *
 * Body: { sessionToken: string }
 */

import { db } from "@/db";
import { consultationSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateSession } from "@/lib/session";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { sessionToken } = body;

  if (!sessionToken || typeof sessionToken !== "string") {
    return Response.json({ error: "Session token required" }, { status: 401 });
  }

  const result = await validateSession(sessionToken);

  if (result.reason === "not_found") {
    return Response.json({ error: "Invalid session" }, { status: 403 });
  }

  if (result.reason === "expired") {
    return Response.json({ error: "Session expired" }, { status: 403 });
  }

  // Record consent timestamp
  await db
    .update(consultationSessions)
    .set({ consentedAt: new Date() })
    .where(eq(consultationSessions.id, result.session.id));

  return Response.json({ success: true, consentedAt: new Date().toISOString() });
}
