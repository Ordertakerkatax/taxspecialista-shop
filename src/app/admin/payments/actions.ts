"use server";

import { db } from "@/db";
import { paymentSubmissions, consultationSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { sendPaymentApprovedEmail, sendPaymentRejectedEmail } from "@/lib/email";
import { SESSION_EXPIRY_HOURS } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { updateEscalationStatus } from "@/lib/escalation";

const ADMIN_EMAILS = ["esm.taxconsultant@kataxpayer.com"];

async function requireAdmin() {
  const session = await auth();
  if (!session.userId) throw new Error("Unauthorized");
  const client = await clerkClient();
  const user = await client.users.getUser(session.userId);
  const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase() ?? "";
  const extraAdmins = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
  const allAdmins = [...ADMIN_EMAILS, ...extraAdmins];
  if (!allAdmins.includes(userEmail)) throw new Error("Forbidden: not an admin");
  return session;
}

export async function approvePayment(paymentId: string) {
  await requireAdmin();

  const sessionToken = randomUUID();
  const activatedAt = new Date();
  const expiresAt = new Date(activatedAt.getTime() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

  // Only approve if currently pending (prevent double-approve per Pitfall 4)
  const [payment] = await db.update(paymentSubmissions)
    .set({ status: "approved", reviewedAt: activatedAt })
    .where(and(
      eq(paymentSubmissions.id, paymentId),
      eq(paymentSubmissions.status, "pending")
    ))
    .returning();

  if (!payment) throw new Error("Payment not found or already processed");

  // Create consultation session (D-07: 24h expiry, D-08: one payment = one session)
  await db.insert(consultationSessions).values({
    paymentId,
    email: payment.email,
    tier: payment.tier,
    sessionToken,
    activatedAt,
    expiresAt,
  });

  // Email user with session link (D-03)
  try {
    await sendPaymentApprovedEmail(payment.email, sessionToken, expiresAt);
    console.log("[admin] Approval email sent to:", payment.email);
  } catch (e) {
    console.error("[admin] Approval email failed:", JSON.stringify(e, null, 2));
  }

  revalidatePath("/admin/payments");
}

export async function rejectPayment(paymentId: string, reason: string) {
  await requireAdmin();

  const [payment] = await db.update(paymentSubmissions)
    .set({
      status: "rejected",
      rejectionReason: reason,
      reviewedAt: new Date(),
    })
    .where(and(
      eq(paymentSubmissions.id, paymentId),
      eq(paymentSubmissions.status, "pending")
    ))
    .returning();

  if (!payment) throw new Error("Payment not found or already processed");

  // Email user with rejection reason
  try {
    await sendPaymentRejectedEmail(payment.email, reason);
    console.log("[admin] Rejection email sent to:", payment.email);
  } catch (e) {
    console.error("[admin] Rejection email failed:", JSON.stringify(e, null, 2));
  }

  revalidatePath("/admin/payments");
}

export async function updateEscalation(
  escalationId: string,
  status: "reviewed" | "resolved",
  reviewerNotes?: string
) {
  await requireAdmin();

  await updateEscalationStatus(escalationId, status, reviewerNotes);

  revalidatePath("/admin/payments");
}
