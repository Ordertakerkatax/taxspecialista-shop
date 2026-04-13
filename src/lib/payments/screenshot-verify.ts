import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const screenshotSchema = z.object({
  referenceNumber: z
    .string()
    .nullable()
    .describe("The transaction reference number visible in the screenshot"),
  amount: z
    .number()
    .nullable()
    .describe("The transaction amount in PHP visible in the screenshot"),
  recipientName: z
    .string()
    .nullable()
    .describe("The recipient or merchant name visible in the screenshot"),
  confidence: z
    .enum(["high", "medium", "low"])
    .describe("How confident you are in the extracted values"),
});

export type ScreenshotVerifyResult =
  | { verified: true; refMatch: boolean; amountMatch: boolean; confidence: string }
  | { verified: false; reason: string };

/**
 * Uses Claude vision to OCR a payment screenshot and verify
 * that the reference number and amount match what the user typed.
 *
 * Returns verified:false on any failure — caller falls back to manual review.
 */
export async function verifyScreenshot(opts: {
  screenshotUrl: string;
  expectedRef: string;
  expectedAmountPhp: number;
  paymentMethod: string;
}): Promise<ScreenshotVerifyResult> {
  try {
    const { object } = await generateObject({
      model: anthropic("claude-haiku-4-5-20251001"),
      schema: screenshotSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: new URL(opts.screenshotUrl),
            },
            {
              type: "text",
              text: `This is a ${opts.paymentMethod === "gcash" ? "GCash" : "bank transfer"} payment screenshot. Extract:
1. The transaction reference number
2. The amount paid (in PHP)
3. The recipient or merchant name

If any value is not clearly visible, return null for that field. Be precise with the reference number — include all digits exactly as shown.`,
            },
          ],
        },
      ],
    });

    // Normalize extracted ref: strip spaces/dashes for comparison
    const extractedRef = object.referenceNumber
      ?.replace(/[\s\-]/g, "")
      .trim() ?? "";
    const normalizedExpected = opts.expectedRef.replace(/[\s\-]/g, "").trim();

    const refMatch =
      extractedRef.length > 0 &&
      extractedRef.toLowerCase() === normalizedExpected.toLowerCase();

    const amountMatch =
      object.amount !== null &&
      Math.abs(object.amount - opts.expectedAmountPhp) < 1; // within PHP 1 tolerance

    console.log(
      `[screenshot-verify] ref=${extractedRef} expected=${normalizedExpected} refMatch=${refMatch} amount=${object.amount} expected=${opts.expectedAmountPhp} amountMatch=${amountMatch} confidence=${object.confidence}`
    );

    return {
      verified: true,
      refMatch,
      amountMatch,
      confidence: object.confidence,
    };
  } catch (error) {
    console.warn(
      "[screenshot-verify] Vision check failed, falling back to manual:",
      (error as Error).message
    );
    return { verified: false, reason: "vision_check_failed" };
  }
}
