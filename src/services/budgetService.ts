import { getLocalDateString } from "@/lib/date";

export interface BudgetResolutionOptions {
  date: string; // Target date YYYY-MM-DD
  history?: Record<string, number>; // Map of YYYY-MM-DD -> amountPaise
  currentDailyLimitPaise: number;
  defaultDailyLimitPaise?: number;
}

export class BudgetService {
  public static readonly DEFAULT_DAILY_LIMIT_PAISE = 15000; // ₹150
  public static readonly DEFAULT_MONTHLY_BUDGET_PAISE = 450000; // ₹4,500

  /**
   * Resolves the effective daily budget for any given date D based on historical snapshots.
   * Specification (design.md Section 7.5):
   * 1. If an explicit snapshot exists for date D, use it.
   * 2. Otherwise, find the latest snapshot dated on or before D.
   * 3. If no earlier snapshot exists, use initial default budget.
   * 4. A budget change made today does not retroactively change prior dates.
   */
  static resolveDailyBudgetForDate(options: BudgetResolutionOptions): number {
    const { date, history = {}, currentDailyLimitPaise, defaultDailyLimitPaise = this.DEFAULT_DAILY_LIMIT_PAISE } = options;
    const today = getLocalDateString();

    // Helper to normalize any legacy rupee integers (< 1000) into paise
    const normalize = (amount: number | undefined): number | undefined => {
      if (amount === undefined || amount === null || isNaN(amount)) return undefined;
      if (amount > 0 && amount < 1000) return Math.round(amount * 100);
      return Math.round(amount);
    };

    // 1. Direct snapshot match
    if (history[date] !== undefined) {
      return normalize(history[date])!;
    }

    // 2. Search for the latest snapshot dated on or before `date`
    const recordedDatesBeforeOrOn = Object.keys(history)
      .filter((d) => d <= date)
      .sort((a, b) => a.localeCompare(b));

    if (recordedDatesBeforeOrOn.length > 0) {
      const latestPriorDate = recordedDatesBeforeOrOn[recordedDatesBeforeOrOn.length - 1];
      return normalize(history[latestPriorDate])!;
    }

    // 3. For future or current date if no snapshot yet, return current daily limit
    const cleanCurrent = normalize(currentDailyLimitPaise);
    if (date >= today) {
      return (cleanCurrent && cleanCurrent > 0) ? cleanCurrent : defaultDailyLimitPaise;
    }

    // 4. Historical date prior to any recorded snapshot
    return defaultDailyLimitPaise;
  }

  /**
   * Calculates spending and overage statistics for a given date in integer paise.
   */
  static calculateDailySpending(
    spentPaise: number,
    budgetLimitPaise: number
  ): {
    spentPaise: number;
    budgetLimitPaise: number;
    remainingPaise: number;
    overagePaise: number;
    percentage: number;
    isExceeded: boolean;
  } {
    const isExceeded = spentPaise > budgetLimitPaise;
    const remainingPaise = isExceeded ? 0 : Math.max(0, budgetLimitPaise - spentPaise);
    const overagePaise = isExceeded ? spentPaise - budgetLimitPaise : 0;
    const percentage = budgetLimitPaise > 0 
      ? Math.min(Math.round((spentPaise / budgetLimitPaise) * 100), 100) 
      : 100;

    return {
      spentPaise,
      budgetLimitPaise,
      remainingPaise,
      overagePaise,
      percentage,
      isExceeded,
    };
  }

  /**
   * Calculates monthly budget progress for a target month (YYYY-MM).
   */
  static calculateMonthlyProgress(
    spentMonthPaise: number,
    monthlyBudgetPaise: number
  ): {
    spentMonthPaise: number;
    monthlyBudgetPaise: number;
    remainingMonthPaise: number;
    isExceeded: boolean;
    percentage: number;
  } {
    const isExceeded = spentMonthPaise > monthlyBudgetPaise;
    const remainingMonthPaise = isExceeded ? 0 : Math.max(0, monthlyBudgetPaise - spentMonthPaise);
    const percentage = monthlyBudgetPaise > 0 
      ? Math.min(Math.round((spentMonthPaise / monthlyBudgetPaise) * 100), 100) 
      : 100;

    return {
      spentMonthPaise,
      monthlyBudgetPaise,
      remainingMonthPaise,
      isExceeded,
      percentage,
    };
  }
}

