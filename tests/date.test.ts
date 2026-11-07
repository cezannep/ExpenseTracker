import { describe, it, expect } from "vitest";
import { 
  getLocalDateString, 
  isToday, 
  isYesterday, 
  formatDate, 
  formatRelativeOrDate,
  getGreeting, 
  getCurrentMonthString,
  addDays,
  isFutureDate
} from "../src/lib/date";

describe("Date and Timezone Utilities", () => {
  it("formats dates to YYYY-MM-DD", () => {
    const fixedDate = new Date(2026, 10, 6, 12, 0, 0); // 6 Nov 2026
    expect(getLocalDateString(fixedDate)).toBe("2026-11-06");
  });

  it("identifies today and yesterday correctly", () => {
    const todayStr = getLocalDateString(new Date());
    expect(isToday(todayStr)).toBe(true);
    expect(isYesterday(todayStr)).toBe(false);

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterdayDate);
    expect(isYesterday(yesterdayStr)).toBe(true);
    expect(isToday(yesterdayStr)).toBe(false);
  });

  it("adds and subtracts days accurately across month boundaries", () => {
    expect(addDays("2026-11-06", -1)).toBe("2026-11-05");
    expect(addDays("2026-11-01", -1)).toBe("2026-10-31");
    expect(addDays("2026-11-06", 1)).toBe("2026-11-07");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("checks if date is in the future", () => {
    const today = getLocalDateString(new Date());
    const tomorrow = addDays(today, 1);
    const yesterday = addDays(today, -1);

    expect(isFutureDate(tomorrow)).toBe(true);
    expect(isFutureDate(today)).toBe(false);
    expect(isFutureDate(yesterday)).toBe(false);
  });

  it("formats date strings into human-readable text", () => {
    const formatted = formatDate("2026-11-01");
    expect(formatted).toBe("1 Nov 2026");
    expect(formatted).not.toContain("(");
    expect(formatted).not.toContain(")");

    expect(formatDate("2026-11-05")).toBe("5 Nov 2026");
    expect(formatDate("2026-12-25")).toBe("25 Dec 2026");
  });

  it("formats relative or date consistently: Today only for current, Yesterday only for previous, actual date for all others", () => {
    const todayStr = getLocalDateString(new Date());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterdayDate);

    // Current date must return "Today"
    expect(formatRelativeOrDate(todayStr)).toBe("Today");

    // Previous date must return "Yesterday"
    expect(formatRelativeOrDate(yesterdayStr)).toBe("Yesterday");

    // All other dates must display the actual date in D MMM YYYY format
    expect(formatRelativeOrDate("2026-11-05")).toBe("5 Nov 2026");
    expect(formatRelativeOrDate("2026-11-01")).toBe("1 Nov 2026");
    expect(formatRelativeOrDate("2026-08-04")).toBe("4 Aug 2026");

    // Future date should display the actual date, never Today or Yesterday
    const tomorrowStr = addDays(todayStr, 1);
    expect(formatRelativeOrDate(tomorrowStr)).not.toBe("Today");
    expect(formatRelativeOrDate(tomorrowStr)).not.toBe("Yesterday");
    expect(formatRelativeOrDate(tomorrowStr)).toBe(formatDate(tomorrowStr));

    // Empty string edge case
    expect(formatRelativeOrDate("")).toBe("");
  });

  it("returns contextual greetings based on hour of day", () => {
    const morning = new Date(2026, 10, 6, 9, 0, 0);
    const afternoon = new Date(2026, 10, 6, 14, 0, 0);
    const evening = new Date(2026, 10, 6, 20, 0, 0);

    expect(getGreeting(morning)).toContain("Good Morning");
    expect(getGreeting(afternoon)).toContain("Good Afternoon");
    expect(getGreeting(evening)).toContain("Good Evening");
  });

  it("returns current month identifier in YYYY-MM format", () => {
    const fixedDate = new Date(2026, 10, 6, 12, 0, 0);
    expect(getCurrentMonthString(fixedDate)).toBe("2026-11");
  });
});
