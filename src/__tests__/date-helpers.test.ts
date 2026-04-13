import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  daysUntil,
  todayIso,
  addDays,
  addYears,
  isDateAfter,
} from "@/lib/legal/date-helpers";

// ---------------------------------------------------------------------------
// Tests for shared UTC date helpers
// ---------------------------------------------------------------------------

describe("date-helpers", () => {
  describe("daysUntil", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-01T00:00:00.000Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns positive days for a future date", () => {
      expect(daysUntil("2025-06-10")).toBe(9);
    });

    it("returns negative days for a past date", () => {
      expect(daysUntil("2025-05-30")).toBe(-2);
    });

    it("returns 0 for today's date", () => {
      expect(daysUntil("2025-06-01")).toBe(0);
    });
  });

  describe("todayIso - UTC correctness (WR-01 regression tests)", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns correct date at UTC midnight", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-01T00:00:00.000Z"));
      expect(todayIso()).toBe("2025-06-01");
    });

    it("returns UTC date (2025-06-01) even when UTC+8 local is still June 1 afternoon", () => {
      // UTC+8: 2025-06-01T13:00+08:00 = 2025-06-01T05:00:00Z
      // UTC is Jun 1, local UTC+8 is also Jun 1 — both same
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-01T05:00:00.000Z"));
      expect(todayIso()).toBe("2025-06-01");
    });

    it("returns 2025-05-31 at 23:00 UTC even though UTC+8 local is June 1 07:00", () => {
      // 2025-05-31T23:00Z = 2025-06-01T07:00+08:00
      // UTC is May 31 — function MUST return May 31, not Jun 1
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-05-31T23:00:00.000Z"));
      expect(todayIso()).toBe("2025-05-31");
    });
  });

  describe("addDays", () => {
    it("adds 120 days correctly", () => {
      expect(addDays("2025-01-15", 120)).toBe("2025-05-15");
    });

    it("adds 15 days correctly", () => {
      expect(addDays("2025-03-01", 15)).toBe("2025-03-16");
    });

    it("handles month boundaries", () => {
      expect(addDays("2025-01-25", 10)).toBe("2025-02-04");
    });
  });

  describe("addYears", () => {
    it("adds 3 years correctly", () => {
      expect(addYears("2021-04-15", 3)).toBe("2024-04-15");
    });

    it("adds 10 years correctly", () => {
      expect(addYears("2021-04-15", 10)).toBe("2031-04-15");
    });
  });

  describe("isDateAfter", () => {
    it("returns true when dateA is after dateB", () => {
      expect(isDateAfter("2025-01-01", "2024-04-15")).toBe(true);
    });

    it("returns false when dateA is before dateB", () => {
      expect(isDateAfter("2022-01-10", "2024-04-15")).toBe(false);
    });

    it("returns false when dates are equal (same date is NOT after)", () => {
      expect(isDateAfter("2024-04-15", "2024-04-15")).toBe(false);
    });
  });
});
