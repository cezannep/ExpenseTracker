import { describe, it, expect } from "vitest";
import { sanitizeCSVField } from "../src/lib/export-csv";

describe("CSV Export & Formula Injection Prevention", () => {
  it("prefixes dangerous leading characters with an apostrophe", () => {
    // Formula characters: =, +, -, @, \t, \r
    expect(sanitizeCSVField("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
    expect(sanitizeCSVField("+123456")).toBe("'+123456");
    expect(sanitizeCSVField("-200")).toBe("'-200");
    expect(sanitizeCSVField("@special")).toBe("'@special");
  });

  it("leaves standard safe text untouched", () => {
    expect(sanitizeCSVField("Dinner at restaurant")).toBe("Dinner at restaurant");
    expect(sanitizeCSVField("Travel")).toBe("Travel");
    expect(sanitizeCSVField("")).toBe("");
  });

  it("escapes internal double quotes properly", () => {
    expect(sanitizeCSVField('Dinner at "Grand" Hotel')).toBe('Dinner at ""Grand"" Hotel');
  });

  it("handles null and undefined gracefully", () => {
    expect(sanitizeCSVField(null)).toBe("");
    expect(sanitizeCSVField(undefined)).toBe("");
  });
});

