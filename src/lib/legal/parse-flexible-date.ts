/**
 * Flexible date parser for BIR legal tools.
 *
 * Accepts three input formats and always returns an ISO YYYY-MM-DD string:
 *   - ISO:          "2026-03-15"
 *   - US:           "03/15/2026" or "3/15/2026"
 *   - Natural:      "March 15, 2026" | "Mar 15, 2026" | "march 15, 2026"
 *   - Day-first:    "15 March 2026" | "15 Mar 2026"
 *
 * No external dependencies. Uses regex + Date constructor for validation.
 * Threats addressed: T-quick-01 — validates Date object matches extracted
 * components to prevent Date constructor coercion of invalid dates (Feb 30, etc).
 */

const MONTH_NAMES: Record<string, number> = {
  january: 1,  jan: 1,
  february: 2, feb: 2,
  march: 3,    mar: 3,
  april: 4,    apr: 4,
  may: 5,
  june: 6,     jun: 6,
  july: 7,     jul: 7,
  august: 8,   aug: 8,
  september: 9, sep: 9, sept: 9,
  october: 10, oct: 10,
  november: 11, nov: 11,
  december: 12, dec: 12,
};

/**
 * Validate that a year/month/day combination forms a real calendar date.
 * Constructs a UTC Date from the parts and checks that the Date constructor
 * did not silently coerce the values (e.g. Feb 30 → Mar 2).
 */
function validateParts(year: number, month: number, day: number): boolean {
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() + 1 === month &&
    d.getUTCDate() === day
  );
}

/** Zero-pad a number to two digits. */
function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Parse a date string in ISO, US, or natural language format and return an
 * ISO YYYY-MM-DD string. Throws an Error with a descriptive message if the
 * input cannot be parsed or represents an invalid calendar date.
 */
export function parseFlexibleDate(input: string): string {
  if (!input || input.trim() === "") {
    throw new Error(
      "Invalid date: ''. Expected ISO (YYYY-MM-DD), US (MM/DD/YYYY), or natural (Month DD, YYYY)."
    );
  }

  const trimmed = input.trim();

  // Pattern 1: ISO YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (!validateParts(year, month, day)) {
      throw new Error(
        `Invalid date: '${input}'. Expected ISO (YYYY-MM-DD), US (MM/DD/YYYY), or natural (Month DD, YYYY).`
      );
    }
    return trimmed; // already ISO, return as-is
  }

  // Pattern 2: US MM/DD/YYYY (supports 1 or 2 digit month/day)
  const usMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const month = parseInt(usMatch[1], 10);
    const day = parseInt(usMatch[2], 10);
    const year = parseInt(usMatch[3], 10);
    if (!validateParts(year, month, day)) {
      throw new Error(
        `Invalid date: '${input}'. Expected ISO (YYYY-MM-DD), US (MM/DD/YYYY), or natural (Month DD, YYYY).`
      );
    }
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  // Pattern 3: Natural "Month DD, YYYY" or "Month DD YYYY" (comma optional)
  const naturalMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (naturalMatch) {
    const monthName = naturalMatch[1].toLowerCase();
    const day = parseInt(naturalMatch[2], 10);
    const year = parseInt(naturalMatch[3], 10);
    const month = MONTH_NAMES[monthName];
    if (month === undefined || !validateParts(year, month, day)) {
      throw new Error(
        `Invalid date: '${input}'. Expected ISO (YYYY-MM-DD), US (MM/DD/YYYY), or natural (Month DD, YYYY).`
      );
    }
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  // Pattern 4: Day-first natural "DD Month YYYY"
  const dayFirstMatch = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (dayFirstMatch) {
    const day = parseInt(dayFirstMatch[1], 10);
    const monthName = dayFirstMatch[2].toLowerCase();
    const year = parseInt(dayFirstMatch[3], 10);
    const month = MONTH_NAMES[monthName];
    if (month === undefined || !validateParts(year, month, day)) {
      throw new Error(
        `Invalid date: '${input}'. Expected ISO (YYYY-MM-DD), US (MM/DD/YYYY), or natural (Month DD, YYYY).`
      );
    }
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  // No pattern matched
  throw new Error(
    `Invalid date: '${input}'. Expected ISO (YYYY-MM-DD), US (MM/DD/YYYY), or natural (Month DD, YYYY).`
  );
}
