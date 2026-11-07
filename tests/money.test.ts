import { describe, it, expect } from "vitest";
import { rupeesToPaise, paiseToRupees, formatPaiseToINR, sumPaise } from "../src/lib/money";

describe("Money Utilities (Paise & Rupee arithmetic)", () => {
  it("converts rupees to integer paise accurately", () => {
    expect(rupeesToPaise(100)).toBe(10000);
    expect(rupeesToPaise(0.5)).toBe(50);
    expect(rupeesToPaise(123.45)).toBe(12345);
    expect(rupeesToPaise("250.75")).toBe(25075);
    expect(rupeesToPaise(-10)).toBe(0);
    expect(rupeesToPaise("invalid")).toBe(0);
  });

  it("converts integer paise back to fractional rupees", () => {
    expect(paiseToRupees(10000)).toBe(100);
    expect(paiseToRupees(50)).toBe(0.5);
    expect(paiseToRupees(12345)).toBe(123.45);
    expect(paiseToRupees(0)).toBe(0);
  });

  it("formats paise into Indian Rupee currency strings", () => {
    const formatted = formatPaiseToINR(15000);
    expect(formatted).toContain("150");
    expect(formatted).toMatch(/₹|Rs/);
  });

  it("sums an array of paise integers safely without floating point drift", () => {
    const values = [10050, 20025, 30025]; // 100.50 + 200.25 + 300.25 = 601.00 -> 60100 paise
    expect(sumPaise(values)).toBe(60100);
  });
});

