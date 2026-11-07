import { describe, it, expect } from "vitest";
import { AnalyticsService } from "../src/services/analyticsService";
import { Transaction } from "../src/types";

describe("AnalyticsService (Totals, Breakdown, Averages)", () => {
  const mockTransactions: Transaction[] = [
    {
      id: "tx-1",
      userId: "user-1",
      type: "income",
      amountPaise: 500000, // ₹5000
      category: "Salary",
      date: "2026-11-01",
      createdAt: "2026-11-01T10:00:00Z",
      updatedAt: "2026-11-01T10:00:00Z",
    },
    {
      id: "tx-2",
      userId: "user-1",
      type: "expense",
      amountPaise: 20000, // ₹200
      category: "Food",
      date: "2026-11-01",
      createdAt: "2026-11-01T13:00:00Z",
      updatedAt: "2026-11-01T13:00:00Z",
    },
    {
      id: "tx-3",
      userId: "user-1",
      type: "expense",
      amountPaise: 30000, // ₹300
      category: "Food",
      date: "2026-11-02",
      createdAt: "2026-11-02T12:00:00Z",
      updatedAt: "2026-11-02T12:00:00Z",
    },
    {
      id: "tx-4",
      userId: "user-1",
      type: "expense",
      amountPaise: 50000, // ₹500
      category: "Travel",
      date: "2026-11-02",
      createdAt: "2026-11-02T18:00:00Z",
      updatedAt: "2026-11-02T18:00:00Z",
    },
  ];

  it("calculates total income, total expense, and net savings accurately in paise", () => {
    const result = AnalyticsService.computeAnalytics(mockTransactions);

    expect(result.totalIncomePaise).toBe(500000);
    expect(result.totalExpensePaise).toBe(100000); // 20000 + 30000 + 50000 = 100000
    expect(result.netSavingsPaise).toBe(400000); // 500000 - 100000 = 400000
  });

  it("identifies the most used expense category by transaction count", () => {
    const result = AnalyticsService.computeAnalytics(mockTransactions);

    // Food has 2 transactions, Travel has 1
    expect(result.mostUsedCategory).toBe("Food");
  });

  it("calculates average daily spend based on distinct expense dates", () => {
    const result = AnalyticsService.computeAnalytics(mockTransactions);

    // Total expense = 100000 paise across 2 distinct dates (2026-11-01 and 2026-11-02) -> 50000 paise/day (₹500/day)
    expect(result.activeExpenseDaysCount).toBe(2);
    expect(result.averageDailySpendPaise).toBe(50000);
  });

  it("handles empty transaction array gracefully without dividing by zero", () => {
    const emptyResult = AnalyticsService.computeAnalytics([]);

    expect(emptyResult.totalIncomePaise).toBe(0);
    expect(emptyResult.totalExpensePaise).toBe(0);
    expect(emptyResult.netSavingsPaise).toBe(0);
    expect(emptyResult.averageDailySpendPaise).toBe(0);
    expect(emptyResult.mostUsedCategory).toBe("N/A");
  });

  it("filters transactions accurately by date range", () => {
    const filtered = AnalyticsService.filterByDateRange(mockTransactions, "2026-11-02", "2026-11-02");
    expect(filtered.length).toBe(2); // Only tx-3 and tx-4
  });
});

