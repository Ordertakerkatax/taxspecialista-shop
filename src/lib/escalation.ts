import { db } from "@/db/index";
import { escalations, consultationSessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export interface CreateEscalationInput {
  sessionId: string;
  summary: string;
  complexityReasons: string[];
  severity: "medium" | "high";
}

export interface EscalationWithSession {
  id: string;
  sessionId: string;
  summary: string;
  complexityReasons: string[];
  severity: "medium" | "high";
  status: "pending" | "reviewed" | "resolved";
  reviewerNotes: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  sessionEmail: string;
}

export async function createEscalation(input: CreateEscalationInput) {
  const [record] = await db
    .insert(escalations)
    .values({
      sessionId: input.sessionId,
      summary: input.summary,
      complexityReasons: JSON.stringify(input.complexityReasons),
      severity: input.severity,
      status: "pending",
    })
    .returning();

  return record;
}

export async function getEscalations(
  statusFilter?: "pending" | "reviewed" | "resolved"
): Promise<EscalationWithSession[]> {
  const query = db
    .select({
      escalations,
      consultationSessions,
    })
    .from(escalations)
    .innerJoin(consultationSessions, eq(escalations.sessionId, consultationSessions.id));

  const rows = statusFilter
    ? await query.where(eq(escalations.status, statusFilter)).orderBy(desc(escalations.createdAt))
    : await query.orderBy(desc(escalations.createdAt));

  return rows.map((row) => ({
    id: row.escalations.id,
    sessionId: row.escalations.sessionId,
    summary: row.escalations.summary,
    complexityReasons: JSON.parse(row.escalations.complexityReasons) as string[],
    severity: row.escalations.severity,
    status: row.escalations.status,
    reviewerNotes: row.escalations.reviewerNotes,
    reviewedAt: row.escalations.reviewedAt,
    createdAt: row.escalations.createdAt,
    sessionEmail: row.consultationSessions.email,
  }));
}

export async function updateEscalationStatus(
  id: string,
  status: "pending" | "reviewed" | "resolved",
  reviewerNotes?: string
) {
  const setValues: {
    status: "pending" | "reviewed" | "resolved";
    reviewedAt: Date;
    reviewerNotes?: string;
  } = {
    status,
    reviewedAt: new Date(),
  };

  if (reviewerNotes !== undefined) {
    setValues.reviewerNotes = reviewerNotes;
  }

  const [record] = await db
    .update(escalations)
    .set(setValues)
    .where(eq(escalations.id, id))
    .returning();

  return record;
}
