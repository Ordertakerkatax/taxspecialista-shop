import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  calculatePrescription,
  type PrescriptionInput,
  type PrescriptionResult,
} from "@/lib/legal/calculate-prescription";

// Pin "today" to 2025-06-01 for deterministic daysRemaining assertions
const FAKE_TODAY = new Date("2025-06-01T00:00:00.000Z");

describe("calculatePrescription", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FAKE_TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("general 3-year period (NIRC Section 203)", () => {
    it("returns rule general-3yr and correct expiry for non-fraud, non-failure-to-file case", () => {
      const input: PrescriptionInput = {
        assessmentBasisDate: "2021-04-15",
        taxPeriodEnd: "2020-12-31",
        fraudAlleged: false,
        failureToFile: false,
      };
      const result: PrescriptionResult = calculatePrescription(input);

      expect(result.rule).toBe("general-3yr");
      expect(result.prescriptionExpiryDate).toBe("2024-04-15");
      expect(result.legalBasis).toContain("NIRC Section 203");
      expect(result.isExpired).toBe(true); // 2024-04-15 is before 2025-06-01
      expect(result.daysRemaining).toBeLessThan(0);
    });

    it("returns isExpired false and positive daysRemaining for an active prescription", () => {
      const input: PrescriptionInput = {
        assessmentBasisDate: "2023-05-01",
        taxPeriodEnd: "2022-12-31",
        fraudAlleged: false,
        failureToFile: false,
      };
      const result = calculatePrescription(input);

      expect(result.rule).toBe("general-3yr");
      expect(result.prescriptionExpiryDate).toBe("2026-05-01");
      expect(result.isExpired).toBe(false);
      expect(result.daysRemaining).toBeGreaterThan(0);
    });
  });

  describe("extended 10-year period (NIRC Section 222)", () => {
    it("returns rule extended-10yr when fraudAlleged is true", () => {
      const input: PrescriptionInput = {
        assessmentBasisDate: "2021-04-15",
        taxPeriodEnd: "2020-12-31",
        fraudAlleged: true,
        failureToFile: false,
      };
      const result = calculatePrescription(input);

      expect(result.rule).toBe("extended-10yr");
      expect(result.prescriptionExpiryDate).toBe("2031-04-15");
      expect(result.legalBasis).toContain("NIRC Section 222");
      expect(result.isExpired).toBe(false); // 2031-04-15 is after 2025-06-01
      expect(result.daysRemaining).toBeGreaterThan(0);
    });

    it("returns rule extended-10yr when failureToFile is true", () => {
      const input: PrescriptionInput = {
        assessmentBasisDate: "2021-04-15",
        taxPeriodEnd: "2020-12-31",
        fraudAlleged: false,
        failureToFile: true,
      };
      const result = calculatePrescription(input);

      expect(result.rule).toBe("extended-10yr");
      expect(result.prescriptionExpiryDate).toBe("2031-04-15");
      expect(result.legalBasis).toContain("NIRC Section 222");
    });

    it("returns extended-10yr when both fraudAlleged and failureToFile are true", () => {
      const input: PrescriptionInput = {
        assessmentBasisDate: "2021-04-15",
        taxPeriodEnd: "2020-12-31",
        fraudAlleged: true,
        failureToFile: true,
      };
      const result = calculatePrescription(input);

      expect(result.rule).toBe("extended-10yr");
      expect(result.prescriptionExpiryDate).toBe("2031-04-15");
    });
  });

  describe("computationNote", () => {
    it("includes start date, rule applied, and expiry in computationNote", () => {
      const input: PrescriptionInput = {
        assessmentBasisDate: "2021-04-15",
        taxPeriodEnd: "2020-12-31",
        fraudAlleged: false,
        failureToFile: false,
      };
      const result = calculatePrescription(input);

      expect(result.computationNote).toContain("2021-04-15");
      expect(result.computationNote).toContain("2024-04-15");
      // Should describe the period applied
      expect(result.computationNote).toMatch(/3.year/i);
    });

    it("includes 10-year period in computationNote for fraud case", () => {
      const input: PrescriptionInput = {
        assessmentBasisDate: "2021-04-15",
        taxPeriodEnd: "2020-12-31",
        fraudAlleged: true,
        failureToFile: false,
      };
      const result = calculatePrescription(input);

      expect(result.computationNote).toContain("2021-04-15");
      expect(result.computationNote).toContain("2031-04-15");
      expect(result.computationNote).toMatch(/10.year/i);
    });
  });

  describe("PrescriptionResult shape", () => {
    it("returns all required fields", () => {
      const input: PrescriptionInput = {
        assessmentBasisDate: "2022-01-01",
        taxPeriodEnd: "2021-12-31",
        fraudAlleged: false,
        failureToFile: false,
      };
      const result = calculatePrescription(input);

      expect(result).toHaveProperty("rule");
      expect(result).toHaveProperty("legalBasis");
      expect(result).toHaveProperty("prescriptionExpiryDate");
      expect(result).toHaveProperty("daysRemaining");
      expect(result).toHaveProperty("isExpired");
      expect(result).toHaveProperty("computationNote");
    });

    it("prescriptionExpiryDate is in YYYY-MM-DD format", () => {
      const input: PrescriptionInput = {
        assessmentBasisDate: "2022-01-01",
        taxPeriodEnd: "2021-12-31",
        fraudAlleged: false,
        failureToFile: false,
      };
      const result = calculatePrescription(input);
      expect(result.prescriptionExpiryDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
