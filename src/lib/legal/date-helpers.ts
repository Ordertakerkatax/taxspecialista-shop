/**
 * Shared UTC-correct date helpers for BIR legal deadline calculations.
 *
 * All functions use UTC methods (getUTCFullYear, getUTCMonth, getUTCDate) to
 * avoid timezone off-by-one errors on UTC+8 servers (Philippines). See WR-01.
 *
 * No external dependencies. No side effects. Pure functions.
 */

/**
 * Returns the number of days from today (UTC) until the given ISO date.
 * Negative if the date is in the past.
 *
 * Fix WR-01: uses Date.UTC with getUTCFullYear/getUTCMonth/getUTCDate so
 * "today" is always UTC-based, not local-time-based.
 */
export function daysUntil(iso: string): number {
  const today = new Date();
  const todayUTC = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  );
  const target = new Date(`${iso}T00:00:00.000Z`);
  const targetUTC = target.getTime();
  return Math.round((targetUTC - todayUTC) / (1000 * 60 * 60 * 24));
}

/**
 * Returns today's date as an ISO 8601 YYYY-MM-DD string in UTC.
 *
 * Fix WR-01: uses getUTCFullYear/getUTCMonth/getUTCDate so "today" is UTC,
 * preventing off-by-one errors on UTC+8 servers between midnight and 8am local.
 */
export function todayIso(): string {
  const today = new Date();
  const yyyy = today.getUTCFullYear();
  const mm = String(today.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(today.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Adds the given number of days to an ISO date string.
 * Returns result as ISO 8601 YYYY-MM-DD string.
 */
export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Adds the given number of years to an ISO date string.
 * Returns result as ISO 8601 YYYY-MM-DD string.
 */
export function addYears(iso: string, years: number): string {
  const date = new Date(`${iso}T00:00:00.000Z`);
  date.setUTCFullYear(date.getUTCFullYear() + years);
  return date.toISOString().slice(0, 10);
}

/**
 * Returns true if dateA is strictly after dateB (UTC comparison).
 * Returns false if the dates are equal.
 */
export function isDateAfter(dateA: string, dateB: string): boolean {
  return (
    new Date(`${dateA}T00:00:00.000Z`).getTime() >
    new Date(`${dateB}T00:00:00.000Z`).getTime()
  );
}
