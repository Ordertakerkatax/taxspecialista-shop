import { describe, it, expect } from "vitest";
import { z } from "zod";
import { PRICING_TIERS } from "@/lib/constants";

// Mirror of the Server Action's Zod schema
const submitPaymentSchema = z.object({
  email: z.string().email(),
  tier: z.enum(["basic", "comprehensive"]),
  paymentMethod: z.enum(["gcash", "bank_transfer"]),
  referenceNumber: z.string().min(6).max(50),
  screenshotUrl: z.string().url().optional(),
});

type SubmitPaymentInput = z.infer<typeof submitPaymentSchema>;

function getAmountPhp(tier: SubmitPaymentInput["tier"]): number {
  return PRICING_TIERS[tier].price;
}

describe("payment submission validation", () => {
  describe("GCash payment", () => {
    it("validates a valid GCash submission", () => {
      const input = {
        email: "taxpayer@example.com",
        tier: "basic" as const,
        paymentMethod: "gcash" as const,
        referenceNumber: "GC123456789",
        screenshotUrl: undefined,
      };
      const result = submitPaymentSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("maps basic tier to PHP 1000", () => {
      expect(getAmountPhp("basic")).toBe(1000);
    });

    it("maps comprehensive tier to PHP 2500", () => {
      expect(getAmountPhp("comprehensive")).toBe(2500);
    });

    it("validates GCash with optional screenshot URL", () => {
      const input = {
        email: "taxpayer@example.com",
        tier: "comprehensive" as const,
        paymentMethod: "gcash" as const,
        referenceNumber: "GC987654321",
        screenshotUrl: "https://cdn.uploadthing.com/screenshot.png",
      };
      const result = submitPaymentSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("bank transfer payment", () => {
    it("validates a valid bank transfer submission", () => {
      const input = {
        email: "taxpayer@example.com",
        tier: "comprehensive" as const,
        paymentMethod: "bank_transfer" as const,
        referenceNumber: "BPI20240409001",
        screenshotUrl: undefined,
      };
      const result = submitPaymentSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("maps comprehensive tier to PHP 2500 for bank transfer", () => {
      expect(getAmountPhp("comprehensive")).toBe(2500);
    });
  });

  describe("validation rejection", () => {
    it("rejects missing email", () => {
      const input = {
        tier: "basic",
        paymentMethod: "gcash",
        referenceNumber: "GC123456",
      };
      const result = submitPaymentSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find((i) => i.path.includes("email"));
        expect(emailError).toBeDefined();
      }
    });

    it("rejects invalid email format", () => {
      const input = {
        email: "not-an-email",
        tier: "basic",
        paymentMethod: "gcash",
        referenceNumber: "GC123456",
      };
      const result = submitPaymentSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("rejects missing reference number", () => {
      const input = {
        email: "taxpayer@example.com",
        tier: "basic",
        paymentMethod: "gcash",
      };
      const result = submitPaymentSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const refError = result.error.issues.find((i) => i.path.includes("referenceNumber"));
        expect(refError).toBeDefined();
      }
    });

    it("rejects reference number shorter than 6 characters", () => {
      const input = {
        email: "taxpayer@example.com",
        tier: "basic",
        paymentMethod: "gcash",
        referenceNumber: "GC123",
      };
      const result = submitPaymentSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("rejects invalid tier value", () => {
      const input = {
        email: "taxpayer@example.com",
        tier: "premium",
        paymentMethod: "gcash",
        referenceNumber: "GC123456",
      };
      const result = submitPaymentSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("rejects invalid payment method", () => {
      const input = {
        email: "taxpayer@example.com",
        tier: "basic",
        paymentMethod: "credit_card",
        referenceNumber: "GC123456",
      };
      const result = submitPaymentSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
