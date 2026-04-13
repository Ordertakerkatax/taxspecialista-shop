import { describe, it, expect } from "vitest";
import { parseFlexibleDate } from "@/lib/legal/parse-flexible-date";

describe("parseFlexibleDate", () => {
  describe("ISO YYYY-MM-DD passthrough", () => {
    it("returns ISO date as-is", () => {
      expect(parseFlexibleDate("2026-03-15")).toBe("2026-03-15");
    });

    it("returns ISO date as-is for another valid date", () => {
      expect(parseFlexibleDate("2021-12-31")).toBe("2021-12-31");
    });

    it("returns ISO date as-is for leap year date", () => {
      expect(parseFlexibleDate("2024-02-29")).toBe("2024-02-29");
    });
  });

  describe("US format MM/DD/YYYY", () => {
    it("converts MM/DD/YYYY to ISO", () => {
      expect(parseFlexibleDate("03/15/2026")).toBe("2026-03-15");
    });

    it("converts single-digit month and day", () => {
      expect(parseFlexibleDate("1/5/2024")).toBe("2024-01-05");
    });

    it("converts end-of-year date correctly", () => {
      expect(parseFlexibleDate("12/31/2021")).toBe("2021-12-31");
    });
  });

  describe("Natural language: Month DD, YYYY", () => {
    it("converts full month name", () => {
      expect(parseFlexibleDate("March 15, 2026")).toBe("2026-03-15");
    });

    it("converts abbreviated month name", () => {
      expect(parseFlexibleDate("Mar 15, 2026")).toBe("2026-03-15");
    });

    it("is case-insensitive for month name", () => {
      expect(parseFlexibleDate("march 15, 2026")).toBe("2026-03-15");
    });

    it("handles all 12 months by name", () => {
      expect(parseFlexibleDate("January 1, 2024")).toBe("2024-01-01");
      expect(parseFlexibleDate("February 28, 2023")).toBe("2023-02-28");
      expect(parseFlexibleDate("April 30, 2025")).toBe("2025-04-30");
      expect(parseFlexibleDate("December 31, 2021")).toBe("2021-12-31");
    });

    it("handles abbreviated months for all months", () => {
      expect(parseFlexibleDate("Jan 1, 2024")).toBe("2024-01-01");
      expect(parseFlexibleDate("Feb 28, 2023")).toBe("2023-02-28");
      expect(parseFlexibleDate("Dec 31, 2021")).toBe("2021-12-31");
    });
  });

  describe("Natural language: DD Month YYYY (day-first)", () => {
    it("converts day-first format with full month name", () => {
      expect(parseFlexibleDate("15 March 2026")).toBe("2026-03-15");
    });

    it("converts day-first with abbreviated month", () => {
      expect(parseFlexibleDate("15 Mar 2026")).toBe("2026-03-15");
    });

    it("converts day-first end of year", () => {
      expect(parseFlexibleDate("31 December 2021")).toBe("2021-12-31");
    });
  });

  describe("Invalid dates — should throw", () => {
    it("throws for an empty string", () => {
      expect(() => parseFlexibleDate("")).toThrow();
    });

    it("throws for a non-date string", () => {
      expect(() => parseFlexibleDate("not-a-date")).toThrow();
    });

    it("throws for invalid month in ISO format (month 13)", () => {
      expect(() => parseFlexibleDate("2026-13-45")).toThrow();
    });

    it("throws for invalid day in ISO format (day 32)", () => {
      expect(() => parseFlexibleDate("2026-01-32")).toThrow();
    });

    it("throws for non-leap year Feb 29", () => {
      expect(() => parseFlexibleDate("02/29/2025")).toThrow();
    });

    it("throws with a descriptive error message", () => {
      expect(() => parseFlexibleDate("foobar")).toThrowError(
        /Invalid date.*foobar/i
      );
    });
  });
});
