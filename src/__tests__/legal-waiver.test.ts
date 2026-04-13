import { describe, it, expect } from "vitest";
import {
  checkWaiverValidity,
  type WaiverInput,
  type WaiverValidityResult,
  type WaiverDefect,
} from "@/lib/legal/check-waiver-validity";

// ---------------------------------------------------------------------------
// Helpers for building valid base inputs
// ---------------------------------------------------------------------------

function validWaiverInput(overrides: Partial<WaiverInput> = {}): WaiverInput {
  return {
    waiverSignedDate: "2022-01-10",
    waiverExpiryDate: "2025-12-31",
    signatoryRole: "Commissioner of Internal Revenue",
    taxTypesCovered: ["Income Tax"],
    prescriptionExpiryAtSigning: "2024-04-15",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("checkWaiverValidity", () => {
  describe("valid waiver", () => {
    it("returns isValid true and empty defects for a fully compliant waiver", () => {
      const result: WaiverValidityResult = checkWaiverValidity(validWaiverInput());

      expect(result.isValid).toBe(true);
      expect(result.defects).toHaveLength(0);
      expect(result.summary).toContain("appears formally valid");
    });
  });

  describe("UNAUTHORIZED_SIGNATORY defect", () => {
    it("detects Revenue District Officer as unauthorized signatory", () => {
      const result = checkWaiverValidity(
        validWaiverInput({ signatoryRole: "Revenue District Officer" })
      );

      expect(result.isValid).toBe(false);
      const defect = result.defects.find(
        (d) => d.defectType === "UNAUTHORIZED_SIGNATORY"
      );
      expect(defect).toBeDefined();
      expect(defect!.legalBasis).toContain("RMO 20-90");
    });

    it("accepts Commissioner of Internal Revenue as authorized", () => {
      const result = checkWaiverValidity(
        validWaiverInput({ signatoryRole: "Commissioner of Internal Revenue" })
      );
      expect(result.defects.find((d) => d.defectType === "UNAUTHORIZED_SIGNATORY")).toBeUndefined();
    });

    it("accepts Deputy Commissioner as authorized (case-insensitive)", () => {
      const result = checkWaiverValidity(
        validWaiverInput({ signatoryRole: "deputy commissioner" })
      );
      expect(result.defects.find((d) => d.defectType === "UNAUTHORIZED_SIGNATORY")).toBeUndefined();
    });

    it("accepts Regional Director as authorized", () => {
      const result = checkWaiverValidity(
        validWaiverInput({ signatoryRole: "Regional Director" })
      );
      expect(result.defects.find((d) => d.defectType === "UNAUTHORIZED_SIGNATORY")).toBeUndefined();
    });

    it("accepts Assistant Regional Director as authorized", () => {
      const result = checkWaiverValidity(
        validWaiverInput({ signatoryRole: "Assistant Regional Director" })
      );
      expect(result.defects.find((d) => d.defectType === "UNAUTHORIZED_SIGNATORY")).toBeUndefined();
    });
  });

  describe("NO_DEFINITE_EXPIRY defect", () => {
    it("detects null waiverExpiryDate as a defect", () => {
      const result = checkWaiverValidity(
        validWaiverInput({ waiverExpiryDate: null })
      );

      expect(result.isValid).toBe(false);
      const defect = result.defects.find(
        (d) => d.defectType === "NO_DEFINITE_EXPIRY"
      );
      expect(defect).toBeDefined();
      expect(defect!.legalBasis).toContain("RDAO 05-01");
    });
  });

  describe("SIGNED_AFTER_PRESCRIPTION_EXPIRED defect", () => {
    it("detects waiver signed after prescription had already expired", () => {
      const result = checkWaiverValidity(
        validWaiverInput({
          waiverSignedDate: "2025-01-01",
          prescriptionExpiryAtSigning: "2024-04-15", // expired before signing
        })
      );

      expect(result.isValid).toBe(false);
      const defect = result.defects.find(
        (d) => d.defectType === "SIGNED_AFTER_PRESCRIPTION_EXPIRED"
      );
      expect(defect).toBeDefined();
      expect(defect!.legalBasis).toMatch(/NIRC (Section )?(203|222)/);
    });

    it("does not flag waiver signed before prescription expired", () => {
      const result = checkWaiverValidity(
        validWaiverInput({
          waiverSignedDate: "2022-01-10",
          prescriptionExpiryAtSigning: "2024-04-15", // not yet expired
        })
      );
      expect(result.defects.find((d) => d.defectType === "SIGNED_AFTER_PRESCRIPTION_EXPIRED")).toBeUndefined();
    });
  });

  describe("VAGUE_TAX_TYPE_COVERAGE defect", () => {
    it("detects 'all internal revenue taxes' as vague tax coverage", () => {
      const result = checkWaiverValidity(
        validWaiverInput({ taxTypesCovered: ["all internal revenue taxes"] })
      );

      expect(result.isValid).toBe(false);
      const defect = result.defects.find(
        (d) => d.defectType === "VAGUE_TAX_TYPE_COVERAGE"
      );
      expect(defect).toBeDefined();
      expect(defect!.legalBasis).toContain("CTA");
    });

    it("detects 'all taxes' as vague tax coverage", () => {
      const result = checkWaiverValidity(
        validWaiverInput({ taxTypesCovered: ["all taxes"] })
      );
      expect(result.defects.find((d) => d.defectType === "VAGUE_TAX_TYPE_COVERAGE")).toBeDefined();
    });

    it("accepts specific tax types without defect", () => {
      const result = checkWaiverValidity(
        validWaiverInput({ taxTypesCovered: ["Income Tax", "Value Added Tax"] })
      );
      expect(result.defects.find((d) => d.defectType === "VAGUE_TAX_TYPE_COVERAGE")).toBeUndefined();
    });
  });

  describe("multiple defects", () => {
    it("accumulates all defects when waiver has 3 defects", () => {
      const result = checkWaiverValidity({
        waiverSignedDate: "2025-01-01",
        waiverExpiryDate: null,                       // NO_DEFINITE_EXPIRY
        signatoryRole: "Revenue District Officer",    // UNAUTHORIZED_SIGNATORY
        taxTypesCovered: ["all internal revenue taxes"], // VAGUE_TAX_TYPE_COVERAGE
        prescriptionExpiryAtSigning: "2024-04-15",   // already expired, so SIGNED_AFTER_PRESCRIPTION_EXPIRED
      });

      expect(result.isValid).toBe(false);
      expect(result.defects).toHaveLength(4);
      const types = result.defects.map((d) => d.defectType);
      expect(types).toContain("UNAUTHORIZED_SIGNATORY");
      expect(types).toContain("NO_DEFINITE_EXPIRY");
      expect(types).toContain("SIGNED_AFTER_PRESCRIPTION_EXPIRED");
      expect(types).toContain("VAGUE_TAX_TYPE_COVERAGE");
    });

    it("summary describes defect count when invalid", () => {
      const result = checkWaiverValidity({
        waiverSignedDate: "2025-01-01",
        waiverExpiryDate: null,
        signatoryRole: "Revenue District Officer",
        taxTypesCovered: ["all taxes"],
        prescriptionExpiryAtSigning: "2024-04-15",
      });

      expect(result.isValid).toBe(false);
      // summary should mention the count of defects
      expect(result.summary).toMatch(/\d+\s+defect/i);
    });
  });

  describe("WaiverDefect shape", () => {
    it("each WaiverDefect has defectType, description, and legalBasis", () => {
      const result = checkWaiverValidity(
        validWaiverInput({ signatoryRole: "Revenue District Officer" })
      );
      const defect: WaiverDefect = result.defects[0];

      expect(defect).toHaveProperty("defectType");
      expect(defect).toHaveProperty("description");
      expect(defect).toHaveProperty("legalBasis");
    });
  });
});
