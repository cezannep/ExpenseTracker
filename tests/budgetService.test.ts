import { describe, it, expect } from "vitest";
import { BudgetService } from "../src/services/budgetService";

describe("BudgetService (Historical Resolution & Overspending)", () => {
  it("resolves exact snapshot when date exists in history", () => {
    const history = {
      "2026-11-01": 20000,
      "2026-11-05": 30000,
    };

    const resolved = BudgetService.resolveDailyBudgetForDate({
      date: "2026-11-05",
      history,
      currentDailyLimitPaise: 50000,
    });

    expect(resolved).toBe(30000);
  });

  it("resolves latest prior snapshot when target date has no explicit snapshot", () => {
    const history = {
      "2026-11-01": 20000,
      "2026-11-04": 35000,
    };

    // On 2026-11-05, should inherit the 2026-11-04 snapshot (35000)
    const resolved = BudgetService.resolveDailyBudgetForDate({
      date: "2026-11-05",
      history,
      currentDailyLimitPaise: 50000,
    });

    expect(resolved).toBe(35000);
  });

  it("falls back to default daily limit for past dates before any snapshot", () => {
    const history = {
      "2026-11-05": 30000,
    };

    // 2026-10-01 is prior to 2026-11-05
    const resolved = BudgetService.resolveDailyBudgetForDate({
      date: "2026-10-01",
      history,
      currentDailyLimitPaise: 50000,
      defaultDailyLimitPaise: 15000,
    });

    expect(resolved).toBe(15000);
  });

  it("calculates daily spending progress and overage accurately", () => {
    // Within budget: spent ₹150, limit ₹200 -> 15000 paise spent, 20000 paise limit
    const safe = BudgetService.calculateDailySpending(15000, 20000);
    expect(safe.isExceeded).toBe(false);
    expect(safe.remainingPaise).toBe(5000);
    expect(safe.overagePaise).toBe(0);
    expect(safe.percentage).toBe(75);

    // Exceeded budget: spent ₹250, limit ₹200 -> 25000 paise spent, 20000 paise limit
    const exceeded = BudgetService.calculateDailySpending(25000, 20000);
    expect(exceeded.isExceeded).toBe(true);
    expect(exceeded.remainingPaise).toBe(0);
    expect(exceeded.overagePaise).toBe(5000);
    expect(exceeded.percentage).toBe(100);
  });

  it("evaluates historical budget when recording backdated transactions", () => {
    // User records an expense of ₹250 on 3 Nov, where historical limit was ₹200 (20000 paise)
    const limitPaise = 20000;
    const historicalExpensePaise = 25000;

    const result = BudgetService.calculateDailySpending(historicalExpensePaise, limitPaise);
    expect(result.isExceeded).toBe(true);
    expect(result.overagePaise).toBe(5000); // Exceeded by ₹50
    expect(result.remainingPaise).toBe(0);
  });

  it("calculates monthly target budget progress", () => {
    // Spent 200000 paise out of 400000 paise limit (50%)
    const progress = BudgetService.calculateMonthlyProgress(200000, 400000);
    expect(progress.isExceeded).toBe(false);
    expect(progress.remainingMonthPaise).toBe(200000);
    expect(progress.percentage).toBe(50);
  });

  it("normalizes legacy rupee snapshots (< 1000) to integer paise", () => {
    const history = {
      "2026-11-05": 150, // Legacy rupee value: ₹150 instead of 15000 paise
    };

    const resolved = BudgetService.resolveDailyBudgetForDate({
      date: "2026-11-05",
      history,
      currentDailyLimitPaise: 150,
    });

    expect(resolved).toBe(15000); // Successfully normalized to 15000 paise
  });
});
