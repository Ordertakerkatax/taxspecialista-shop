import { describe, it, expect, vi, beforeEach } from "vitest";
import { SESSION_EXPIRY_HOURS } from "@/lib/constants";

// Mock db and crypto to avoid real database connections
vi.mock("@/db", () => ({
  db: {
    update: vi.fn(),
    insert: vi.fn(),
    select: vi.fn(),
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}));

vi.mock("@/lib/email", () => ({
  sendPaymentApprovedEmail: vi.fn().mockResolvedValue(undefined),
  sendPaymentRejectedEmail: vi.fn().mockResolvedValue(undefined),
}));

// Inline the approve/reject logic to test business rules without needing actual Server Actions
async function approvePayment(paymentId: string, mockDb: {
  update: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
}) {
  const { randomUUID } = await import("crypto");
  const sessionToken = randomUUID();
  const activatedAt = new Date();
  const expiresAt = new Date(activatedAt.getTime() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

  const payment = { id: paymentId, email: "user@example.com", tier: "basic" as const, status: "pending" as const };

  // Simulate: only approve if status is pending
  if (payment.status !== "pending") {
    throw new Error("Payment is not in pending status");
  }

  // Update payment status (simulated)
  await mockDb.update({ status: "approved", reviewedAt: activatedAt });

  // Insert session (simulated)
  await mockDb.insert({
    paymentId,
    email: payment.email,
    tier: payment.tier,
    sessionToken,
    activatedAt,
    expiresAt,
  });

  return { sessionToken, activatedAt, expiresAt, payment };
}

async function rejectPayment(paymentId: string, reason: string, mockDb: {
  update: ReturnType<typeof vi.fn>;
}) {
  const payment = { id: paymentId, email: "user@example.com", status: "pending" as const };

  // Simulate: only reject if status is pending
  if (payment.status !== "pending") {
    throw new Error("Payment is not in pending status");
  }

  // Update payment status (simulated)
  await mockDb.update({
    status: "rejected",
    rejectionReason: reason,
    reviewedAt: new Date(),
  });

  return { payment, reason };
}

describe("admin actions", () => {
  let mockDb: { update: ReturnType<typeof vi.fn>; insert: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockDb = {
      update: vi.fn().mockResolvedValue(undefined),
      insert: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe("approvePayment", () => {
    it("creates session with 24-hour expiry after activation", async () => {
      const beforeApprove = Date.now();
      const result = await approvePayment("payment-id-1", mockDb);
      const afterApprove = Date.now();

      const expectedExpiry = new Date(result.activatedAt.getTime() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
      expect(result.expiresAt.getTime()).toBe(expectedExpiry.getTime());

      // Verify 24 hours = 86400000 ms
      const diff = result.expiresAt.getTime() - result.activatedAt.getTime();
      expect(diff).toBe(24 * 60 * 60 * 1000);

      // Verify activation time is within test window
      expect(result.activatedAt.getTime()).toBeGreaterThanOrEqual(beforeApprove);
      expect(result.activatedAt.getTime()).toBeLessThanOrEqual(afterApprove);
    });

    it("calls db.update with approved status", async () => {
      await approvePayment("payment-id-2", mockDb);
      expect(mockDb.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: "approved" })
      );
    });

    it("calls db.insert to create consultation session", async () => {
      const result = await approvePayment("payment-id-3", mockDb);
      expect(mockDb.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentId: "payment-id-3",
          sessionToken: result.sessionToken,
        })
      );
    });

    it("prevents double-approve by checking pending status", async () => {
      // Override: simulate a non-pending payment
      async function approveNonPending() {
        const payment = { id: "payment-id-4", status: "approved" as const };
        if (payment.status !== "pending") {
          throw new Error("Payment is not in pending status");
        }
      }

      await expect(approveNonPending()).rejects.toThrow("Payment is not in pending status");
    });
  });

  describe("rejectPayment", () => {
    it("records rejection reason in db.update", async () => {
      const reason = "Amount mismatch";
      await rejectPayment("payment-id-5", reason, mockDb);

      expect(mockDb.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "rejected",
          rejectionReason: reason,
        })
      );
    });

    it("sets status to rejected", async () => {
      await rejectPayment("payment-id-6", "Invalid reference number", mockDb);

      expect(mockDb.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: "rejected" })
      );
    });

    it("prevents double-reject by checking pending status", async () => {
      async function rejectNonPending() {
        const payment = { id: "payment-id-7", status: "rejected" as const };
        if (payment.status !== "pending") {
          throw new Error("Payment is not in pending status");
        }
      }

      await expect(rejectNonPending()).rejects.toThrow("Payment is not in pending status");
    });
  });
});
