import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  calculateDeadlines,
  type DeadlineInput,
  type DeadlineResult,
  type Deadline,
} from "@/lib/legal/calculate-deadlines";

// Pin "today" to 2025-06-01 for deterministic daysRemaining assertions
const FAKE_TODAY = new Date("2025-06-01T00:00:00.000Z");

describe("calculateDeadlines", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FAKE_TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("LOA 120-day validity deadline", () => {
    it("returns correct 120-day expiry from loaIssuanceDate", () => {
      const input: DeadlineInput = {
        loaReceiptDate: "2025-01-15",
        loaIssuanceDate: "2025-01-15",
      };
      const result: DeadlineResult = calculateDeadlines(input);

      const loaDeadline = result.deadlines.find(
        (d) => d.name === "LOA Validity Expiry"
      );
      expect(loaDeadline).toBeDefined();
      expect(loaDeadline!.dueDate).toBe("2025-05-15");
      expect(loaDeadline!.legalBasis).toContain("RMO 44-2010");
      expect(loaDeadline!.isOverdue).toBe(true); // 2025-05-15 is before 2025-06-01
    });

    it("flags overdue LOA with a warning", () => {
      const input: DeadlineInput = {
        loaReceiptDate: "2025-01-15",
        loaIssuanceDate: "2025-01-15",
      };
      const result = calculateDeadlines(input);

      expect(result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining("LOA may be void")])
      );
    });

    it("returns isOverdue false for a future LOA deadline", () => {
      const input: DeadlineInput = {
        loaReceiptDate: "2025-05-01",
        loaIssuanceDate: "2025-05-01",
      };
      const result = calculateDeadlines(input);
      const loaDeadline = result.deadlines.find(
        (d) => d.name === "LOA Validity Expiry"
      );
      expect(loaDeadline).toBeDefined();
      // 2025-05-01 + 120 days = 2025-08-29, which is after 2025-06-01
      expect(loaDeadline!.isOverdue).toBe(false);
      expect(loaDeadline!.daysRemaining).toBeGreaterThan(0);
    });
  });

  describe("NIC 15-day response deadline", () => {
    it("returns correct 15-day response deadline from nicReceiptDate", () => {
      const input: DeadlineInput = {
        loaReceiptDate: "2025-01-15",
        nicReceiptDate: "2025-03-01",
      };
      const result = calculateDeadlines(input);

      const nicDeadline = result.deadlines.find(
        (d) => d.name === "NIC Response Deadline"
      );
      expect(nicDeadline).toBeDefined();
      expect(nicDeadline!.dueDate).toBe("2025-03-16");
      expect(nicDeadline!.legalBasis).toContain("RMO 19-2007");
    });

    it("marks NIC deadline as overdue when past today", () => {
      const input: DeadlineInput = {
        loaReceiptDate: "2025-01-15",
        nicReceiptDate: "2025-03-01",
      };
      const result = calculateDeadlines(input);
      const nicDeadline = result.deadlines.find(
        (d) => d.name === "NIC Response Deadline"
      );
      // 2025-03-16 is before 2025-06-01
      expect(nicDeadline!.isOverdue).toBe(true);
      expect(nicDeadline!.daysRemaining).toBeLessThan(0);
    });
  });

  describe("PAN 30-day protest deadline", () => {
    it("returns correct 30-day protest deadline from panReceiptDate", () => {
      const input: DeadlineInput = {
        loaReceiptDate: "2025-01-15",
        panReceiptDate: "2025-04-01",
      };
      const result = calculateDeadlines(input);

      const panDeadline = result.deadlines.find(
        (d) => d.name === "PAN Protest Deadline"
      );
      expect(panDeadline).toBeDefined();
      expect(panDeadline!.dueDate).toBe("2025-05-01");
      expect(panDeadline!.legalBasis).toMatch(/RR 12-99|NIRC 228|NIRC Section 228/);
    });

    it("marks PAN deadline as overdue when past today", () => {
      const input: DeadlineInput = {
        loaReceiptDate: "2025-01-15",
        panReceiptDate: "2025-04-01",
      };
      const result = calculateDeadlines(input);
      const panDeadline = result.deadlines.find(
        (d) => d.name === "PAN Protest Deadline"
      );
      // 2025-05-01 is before 2025-06-01
      expect(panDeadline!.isOverdue).toBe(true);
    });
  });

  describe("input without optional date fields", () => {
    it("returns empty deadlines when only loaReceiptDate is provided", () => {
      const input: DeadlineInput = {
        loaReceiptDate: "2025-01-15",
      };
      const result = calculateDeadlines(input);
      expect(result.deadlines).toHaveLength(0);
    });
  });

  describe("combined deadlines", () => {
    it("returns all applicable deadlines when all four dates provided", () => {
      const input: DeadlineInput = {
        loaReceiptDate: "2025-01-15",
        loaIssuanceDate: "2025-01-15",
        nicReceiptDate: "2025-03-01",
        panReceiptDate: "2025-04-01",
      };
      const result = calculateDeadlines(input);
      expect(result.deadlines).toHaveLength(3);
    });

    it("returns computedAt as today's date in ISO 8601 format", () => {
      const input: DeadlineInput = {
        loaReceiptDate: "2025-01-15",
      };
      const result = calculateDeadlines(input);
      expect(result.computedAt).toBe("2025-06-01");
    });
  });

  describe("Deadline object shape", () => {
    it("every Deadline has all required fields", () => {
      const input: DeadlineInput = {
        loaReceiptDate: "2025-05-01",
        loaIssuanceDate: "2025-05-01",
      };
      const result = calculateDeadlines(input);
      const deadline: Deadline = result.deadlines[0];

      expect(deadline).toHaveProperty("name");
      expect(deadline).toHaveProperty("dueDate");
      expect(deadline).toHaveProperty("daysRemaining");
      expect(deadline).toHaveProperty("legalBasis");
      expect(deadline).toHaveProperty("isOverdue");
    });

    it("dueDate is in YYYY-MM-DD format", () => {
      const input: DeadlineInput = {
        loaReceiptDate: "2025-05-01",
        loaIssuanceDate: "2025-05-01",
      };
      const result = calculateDeadlines(input);
      const deadline = result.deadlines[0];
      expect(deadline.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
