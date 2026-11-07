/**
 * Date and timezone utilities supporting consistent local calendar representation.
 * Default timezone: Asia/Kolkata (IST).
 */

export const DEFAULT_TIMEZONE = "Asia/Kolkata";

/**
 * Gets the current date string in YYYY-MM-DD format for a given date and timezone.
 * Uses Intl.DateTimeFormat to avoid UTC vs local boundary discrepancies.
 */
export function getLocalDateString(date: Date = new Date(), timeZone: string = DEFAULT_TIMEZONE): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch {
    // Fallback if timezone identifier is unsupported
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

/**
 * Checks if a given date string (YYYY-MM-DD or ISO string) matches today's local date.
 */
export function isToday(dateString: string, timeZone: string = DEFAULT_TIMEZONE): boolean {
  if (!dateString) return false;
  const dateOnly = dateString.includes("T") ? dateString.split("T")[0] : dateString;
  return dateOnly === getLocalDateString(new Date(), timeZone);
}

/**
 * Checks if a given date string matches yesterday's local date.
 */
export function isYesterday(dateString: string, timeZone: string = DEFAULT_TIMEZONE): boolean {
  if (!dateString) return false;
  const dateOnly = dateString.includes("T") ? dateString.split("T")[0] : dateString;
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateOnly === getLocalDateString(d, timeZone);
}

/**
 * Checks if a given date string is in the future relative to today's local date.
 */
export function isFutureDate(dateString: string, timeZone: string = DEFAULT_TIMEZONE): boolean {
  if (!dateString) return false;
  const dateOnly = dateString.includes("T") ? dateString.split("T")[0] : dateString;
  return dateOnly > getLocalDateString(new Date(), timeZone);
}

/**
 * Adds or subtracts days from a YYYY-MM-DD date string, returning the new YYYY-MM-DD string.
 */
export function addDays(dateString: string, days: number, timeZone: string = DEFAULT_TIMEZONE): string {
  if (!dateString) return getLocalDateString(new Date(), timeZone);
  const dateOnly = dateString.includes("T") ? dateString.split("T")[0] : dateString;
  const parts = dateOnly.split("-");
  if (parts.length !== 3) return dateString;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day, 12, 0, 0);
  d.setDate(d.getDate() + days);
  return getLocalDateString(d, timeZone);
}

/**
 * Formats a date string (YYYY-MM-DD or ISO) into localized human-readable format: D MMM YYYY (e.g. "5 Nov 2026").
 */
export function formatDate(dateString: string, timeZone: string = DEFAULT_TIMEZONE): string {
  if (!dateString) return "";
  const dateOnly = dateString.includes("T") ? dateString.split("T")[0] : dateString;
  const parts = dateOnly.split("-");
  if (parts.length !== 3) {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-IN", {
      timeZone,
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day, 12, 0, 0);

  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("en-IN", {
    timeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Formats a date string with consistent relative naming across all transaction sections:
 * - "Today" ONLY for the current date.
 * - "Yesterday" ONLY for the previous date.
 * - D MMM YYYY (e.g., "5 Nov 2026") for all other dates.
 */
export function formatRelativeOrDate(dateString: string, timeZone: string = DEFAULT_TIMEZONE): string {
  if (!dateString) return "";
  if (isToday(dateString, timeZone)) return "Today";
  if (isYesterday(dateString, timeZone)) return "Yesterday";
  return formatDate(dateString, timeZone);
}

/**
 * Formats an ISO 8601 string into time (e.g. "1:45 PM").
 */
export function formatTime(isoString: string, timeZone: string = DEFAULT_TIMEZONE): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Returns a contextual time-of-day greeting based on hour.
 */
export function getGreeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Good Morning 👋";
  if (hour < 17) return "Good Afternoon ☀️";
  return "Good Evening 🌙";
}

/**
 * Returns current month identifier in YYYY-MM format.
 */
export function getCurrentMonthString(date: Date = new Date(), timeZone: string = DEFAULT_TIMEZONE): string {
  const dateStr = getLocalDateString(date, timeZone);
  return dateStr.substring(0, 7); // "YYYY-MM"
}
