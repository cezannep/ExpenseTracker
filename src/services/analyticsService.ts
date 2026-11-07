import { Transaction } from "@/types";

export interface CategoryBreakdownItem {
  name: string;
  valuePaise: number;
  count: number;
}

export interface AnalyticsSummary {
  totalIncomePaise: number;
  totalExpensePaise: number;
  netSavingsPaise: number;
  categoryBreakdown: CategoryBreakdownItem[];
  mostUsedCategory: string;
  highestSpendingCategory: string;
  averageDailySpendPaise: number;
  activeExpenseDaysCount: number;
}

export class AnalyticsService {
  /**
   * Filters transactions by an optional start date and end date (inclusive, YYYY-MM-DD).
   */
  static filterByDateRange(
    transactions: Transaction[],
    startDate?: string,
    endDate?: string
  ): Transaction[] {
    return transactions.filter((t) => {
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    });
  }

  /**
   * Computes comprehensive financial analytics and insights in integer paise.
   */
  static computeAnalytics(transactions: Transaction[]): AnalyticsSummary {
    let totalIncomePaise = 0;
    let totalExpensePaise = 0;

    const categoryMap: Record<string, { valuePaise: number; count: number }> = {};
    const expenseDatesSet = new Set<string>();

    for (const tx of transactions) {
      if (tx.type === "income") {
        totalIncomePaise += tx.amountPaise;
      } else if (tx.type === "expense") {
        totalExpensePaise += tx.amountPaise;
        expenseDatesSet.add(tx.date);

        if (!categoryMap[tx.category]) {
          categoryMap[tx.category] = { valuePaise: 0, count: 0 };
        }
        categoryMap[tx.category].valuePaise += tx.amountPaise;
        categoryMap[tx.category].count += 1;
      }
    }

    const netSavingsPaise = totalIncomePaise - totalExpensePaise;

    // Convert map to sorted breakdown
    const categoryBreakdown: CategoryBreakdownItem[] = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      valuePaise: categoryMap[cat].valuePaise,
      count: categoryMap[cat].count,
    }));

    // Sort descending by value
    categoryBreakdown.sort((a, b) => b.valuePaise - a.valuePaise);

    // Most used category (highest count)
    let mostUsedCategory = "N/A";
    let maxCount = 0;
    for (const cat of categoryBreakdown) {
      if (cat.count > maxCount) {
        maxCount = cat.count;
        mostUsedCategory = cat.name;
      }
    }

    const highestSpendingCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0].name : "N/A";

    // Average daily spend: total expenses / distinct dates with at least 1 expense
    const activeExpenseDaysCount = expenseDatesSet.size;
    const averageDailySpendPaise = activeExpenseDaysCount > 0 
      ? Math.round(totalExpensePaise / activeExpenseDaysCount) 
      : 0;

    return {
      totalIncomePaise,
      totalExpensePaise,
      netSavingsPaise,
      categoryBreakdown,
      mostUsedCategory,
      highestSpendingCategory,
      averageDailySpendPaise,
      activeExpenseDaysCount,
    };
  }
}

