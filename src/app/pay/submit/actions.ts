"use server";

import { db } from "@/db";
import { paymentSubmissions } from "@/db/schema";
import { z } from "zod";
import { sendPaymentReceivedEmail } from "@/lib/email";
import { PRICING_TIERS } from "@/lib/constants";
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

  // Send admin notification email (D-04) — gracefully skip if Resend not configured
  try {
    await sendPaymentReceivedEmail(submission);
  } catch (e) {
    console.warn("[pay] Email notification skipped:", (e as Error).message);
  }

  redirect(`/pay-submitted?email=${encodeURIComponent(parsed.data.email)}`);
}
