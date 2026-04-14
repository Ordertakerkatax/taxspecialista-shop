"use server";

import { db } from "@/db";
import { paymentSubmissions, consultationSessions } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";
import { sendPaymentReceivedEmail, sendPaymentApprovedEmail } from "@/lib/email";
import { PRICING_TIERS, SESSION_EXPIRY_HOURS } from "@/lib/constants";
import { verifyScreenshot } from "@/lib/payments/screenshot-verify";
import { redirect } from "next/navigation";

const submitPaymentSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  tier: z.enum(["basic", "comprehensive"]),
  paymentMethod: z.enum(["gcash", "bank_transfer"]),
  referenceNumber: z
    .string()
    .min(6, "Reference number must be at least 6 characters")
    .max(50, "Reference number must be at most 50 characters"),
  screenshotUrl: z.string().url().optional().or(z.literal("")),
});

export type SubmitPaymentState = {
  success: boolean;
  errors?: Record<string, string[]>;
};

export async function submitPaymentProof(
  prevState: SubmitPaymentState,
  formData: FormData
): Promise<SubmitPaymentState> {
  const raw = {
    email: formData.get("email"),
    tier: formData.get("tier"),
    paymentMethod: formData.get("paymentMethod"),
    referenceNumber: formData.get("referenceNumber"),
    screenshotUrl: formData.get("screenshotUrl") || undefined,
  };

  const parsed = submitPaymentSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const tierKey = parsed.data.tier as keyof typeof PRICING_TIERS;
  const amountPhp = PRICING_TIERS[tierKey].price;

  const [submission] = await db
    .insert(paymentSubmissions)
    .values({
      email: parsed.data.email,
      tier: parsed.data.tier,
      paymentMethod: parsed.data.paymentMethod,
      referenceNumber: parsed.data.referenceNumber,
      screenshotUrl: parsed.data.screenshotUrl || null,
      amountPhp,
    })
    .returning();

  // Auto-approve check: amount matches tier, valid ref format, no duplicate, no recent submission
  const autoApproveResult = await tryAutoApprove(submission);

  if (autoApproveResult.approved) {
    // Send approval email with consultation link
    try {
      await sendPaymentApprovedEmail(
        submission.email,
        autoApproveResult.sessionToken!,
        autoApproveResult.expiresAt!
      );
    } catch (e) {
      console.warn("[pay] Approval email skipped:", (e as Error).message);
    }
    redirect(`/pay-submitted?email=${encodeURIComponent(parsed.data.email)}&auto=1`);
  }

  // Manual review path — notify admin
  try {
    await sendPaymentReceivedEmail(submission);
  } catch (e) {
    console.warn("[pay] Email notification skipped:", (e as Error).message);
  }

  redirect(`/pay-submitted?email=${encodeURIComponent(parsed.data.email)}`);
}

// --- Auto-approve logic ---

/** GCash ref: 13 digits. Bank transfer: 10-20 alphanumeric. */
const GCASH_REF_PATTERN = /^\d{13}$/;
const BANK_REF_PATTERN = /^[A-Za-z0-9]{10,20}$/;

type AutoApproveResult =
  | { approved: true; sessionToken: string; expiresAt: Date }
  | { approved: false; reason: string };

async function tryAutoApprove(
  submission: typeof paymentSubmissions.$inferSelect
): Promise<AutoApproveResult> {
  const tierKey = submission.tier as keyof typeof PRICING_TIERS;
  const expectedAmount = PRICING_TIERS[tierKey].price;

  // 1. Amount must match tier price exactly
  if (submission.amountPhp !== expectedAmount) {
    return { approved: false, reason: "amount_mismatch" };
  }

  // 2. Reference number must match expected format
  const refValid =
    submission.paymentMethod === "gcash"
      ? GCASH_REF_PATTERN.test(submission.referenceNumber)
      : BANK_REF_PATTERN.test(submission.referenceNumber);

  if (!refValid) {
    return { approved: false, reason: "invalid_ref_format" };
  }

  // 3. Reference number must not be a duplicate (excluding this submission)
  const duplicateCheck = await db
    .select({ id: paymentSubmissions.id })
    .from(paymentSubmissions)
    .where(
      and(
        eq(paymentSubmissions.referenceNumber, submission.referenceNumber),
        eq(paymentSubmissions.paymentMethod, submission.paymentMethod)
      )
    );

  // If we find more than just the current submission with this ref, it's a duplicate.
  // Note: the current submission is already inserted, so length > 1 means duplicate.
  if (duplicateCheck.length > 1) {
    return { approved: false, reason: "duplicate_ref" };
  }

  // 4. Rate limit: no other submission from this email in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentSubmissions = await db
    .select({ id: paymentSubmissions.id })
    .from(paymentSubmissions)
    .where(
      and(
        eq(paymentSubmissions.email, submission.email),
        gt(paymentSubmissions.createdAt, oneHourAgo)
      )
    );

  if (recentSubmissions.length > 1) {
    return { approved: false, reason: "rate_limited" };
  }

  // 5. Screenshot is REQUIRED for auto-approve — no screenshot means manual review
  if (!submission.screenshotUrl) {
    return { approved: false, reason: "no_screenshot" };
  }

  // 6. Vision check: verify ref and amount via OCR
  const vision = await verifyScreenshot({
    screenshotUrl: submission.screenshotUrl,
    expectedRef: submission.referenceNumber,
    expectedAmountPhp: expectedAmount,
    paymentMethod: submission.paymentMethod,
  });

  if (!vision.verified) {
    // Vision API error — fall back to manual review
    return { approved: false, reason: "vision_check_failed" };
  }

  if (vision.confidence === "low" || !vision.refMatch) {
    return { approved: false, reason: "screenshot_mismatch" };
  }

  if (!vision.amountMatch) {
    return { approved: false, reason: "amount_mismatch_screenshot" };
  }

  // All checks passed — auto-approve
  const now = new Date();
  const sessionToken = randomUUID();
  const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

  await db
    .update(paymentSubmissions)
    .set({ status: "approved", reviewedAt: now })
    .where(eq(paymentSubmissions.id, submission.id));

  await db.insert(consultationSessions).values({
    paymentId: submission.id,
    email: submission.email,
    tier: submission.tier,
    sessionToken,
    activatedAt: now,
    expiresAt,
  });

  console.log(`[auto-approve] Payment ${submission.id} auto-approved for ${submission.email}`);

  return { approved: true, sessionToken, expiresAt };
}
