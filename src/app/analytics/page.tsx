"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/common/Header";
import { useAppStore } from "@/stores/useAppStore";
import { formatPaiseToINR } from "@/lib/money";
import { AnalyticsService } from "@/services/analyticsService";
import { BudgetService } from "@/services/budgetService";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Bookmark, Zap } from "lucide-react";

const DONUT_COLORS = ["#10D294", "#34D399", "#94A3B8", "#475569", "#38BDF8", "#F43F5E", "#A855F7"];

export default function AnalyticsPage() {
  const { transactions, user, getMonthlySpentPaise } = useAppStore();
  const [timeRange, setTimeRange] = useState<"month" | "last_month" | "year">("month");

  // Filter transactions by selected range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    return transactions.filter((tx) => {
      if (!tx.date) return false;
      const [y, m] = tx.date.split("-").map(Number);
      if (timeRange === "month") {
        return y === currentYear && m === currentMonth + 1;
      } else if (timeRange === "last_month") {
        const lastMonth = currentMonth === 0 ? 12 : currentMonth;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return y === lastMonthYear && m === lastMonth;
      } else {
        return y === currentYear;
      }
    });
  }, [transactions, timeRange]);

  const analytics = useMemo(() => {
    return AnalyticsService.computeAnalytics(filteredTransactions);
  }, [filteredTransactions]);

  const monthlySpentPaise = getMonthlySpentPaise();
  const monthlyBudgetPaise = user?.monthlyBudgetPaise || BudgetService.DEFAULT_MONTHLY_BUDGET_PAISE;
  const monthlyProgress = useMemo(() => {
    return BudgetService.calculateMonthlyProgress(monthlySpentPaise, monthlyBudgetPaise);
  }, [monthlySpentPaise, monthlyBudgetPaise]);

  // Donut chart items
  const chartData = useMemo(() => {
    if (analytics.categoryBreakdown.length === 0) {
      return [{ name: "No expenses", value: 1, percentage: "0.0" }];
    }
    const total = analytics.totalExpensePaise;
    return analytics.categoryBreakdown.slice(0, 4).map((item) => ({
      name: item.name,
      value: item.valuePaise,
      percentage: total > 0 ? ((item.valuePaise / total) * 100).toFixed(1) : "0.0",
    }));
  }, [analytics.categoryBreakdown, analytics.totalExpensePaise]);

  const totalExpensePaise = analytics.totalExpensePaise;
  const hasExpenses = analytics.categoryBreakdown.length > 0;

  const isNetSavingsNegative = analytics.netSavingsPaise < 0;
  const absNetSavings = Math.abs(analytics.netSavingsPaise);
  const formattedNetSavings = `${isNetSavingsNegative ? "-" : ""}${formatPaiseToINR(
    absNetSavings,
    absNetSavings % 100 !== 0
  )}`;

  return (
    <div className="space-y-3.5 pb-6">
      <Header />

      {/* Page Title in Main Content Section */}
      <div className="px-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Analytics & Insights
        </h1>
      </div>

      <div className="px-5 space-y-3">
        {/* Time Range Tabs (This Month | Last Month | This Year) */}
        <div className="flex items-center justify-between p-1 bg-slate-100 dark:bg-[#12171f] rounded-2xl border border-slate-200/80 dark:border-[#1d2633]">
          {(
            [
              { id: "month", label: "This Month" },
              { id: "last_month", label: "Last Month" },
              { id: "year", label: "This Year" },
            ] as const
          ).map((t) => {
            const isActive = timeRange === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-xs"
                    : "text-slate-500 dark:text-[#8e9aa8] active:scale-95"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* 3-Column Summary Card (Income | Expense | Net Savings) */}
        <div className="rounded-2xl bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] p-4 grid grid-cols-3 divide-x divide-slate-200 dark:divide-[#1d2633] text-center shadow-xs">
          <div className="px-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#8e9aa8] block mb-1">
              Income
            </span>
            <span className="text-sm sm:text-base font-bold text-emerald-500 dark:text-emerald-400 block tracking-tight truncate">
              {formatPaiseToINR(analytics.totalIncomePaise, analytics.totalIncomePaise % 100 !== 0)}
            </span>
          </div>

          <div className="px-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#8e9aa8] block mb-1">
              Expense
            </span>
            <span className="text-sm sm:text-base font-bold text-rose-500 dark:text-rose-400 block tracking-tight truncate">
              {formatPaiseToINR(analytics.totalExpensePaise, analytics.totalExpensePaise % 100 !== 0)}
            </span>
          </div>

          <div className="px-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#8e9aa8] block mb-1">
              Net Savings
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block tracking-tight truncate">
              {formattedNetSavings}
            </span>
          </div>
        </div>

        {/* Monthly Target Budget Card */}
        <div className="rounded-2xl bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
              Monthly Target Budget
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
              {formatPaiseToINR(monthlyBudgetPaise)}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <div>
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {formatPaiseToINR(monthlySpentPaise, monthlySpentPaise % 100 !== 0)}
              </span>
              <span className="text-xs text-slate-500 dark:text-[#8e9aa8] ml-1.5 font-medium">
                spent this month
              </span>
            </div>

            <span className="text-xs font-semibold text-emerald-500 dark:text-emerald-400">
              {monthlyProgress.isExceeded
                ? `Exceeded`
                : `${formatPaiseToINR(monthlyProgress.remainingMonthPaise)} left`}
            </span>
          </div>

          <div className="w-full h-2 bg-slate-100 dark:bg-[#18202a] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                monthlyProgress.isExceeded ? "bg-rose-500" : "bg-white dark:bg-white"
              }`}
              style={{ width: `${Math.min(monthlyProgress.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Category Breakdown Donut Chart Card */}
        <div className="rounded-2xl bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] p-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Category Breakdown
          </h3>

          <div className="grid grid-cols-2 items-center gap-3">
            {/* Donut Chart with Centered Total */}
            <div className="relative w-full h-36 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={60}
                    paddingAngle={hasExpenses ? 3 : 0}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={hasExpenses ? DONUT_COLORS[index % DONUT_COLORS.length] : "#334155"}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Text inside Donut Ring */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {formatPaiseToINR(totalExpensePaise, totalExpensePaise % 100 !== 0)}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-[#8e9aa8] leading-tight mt-0.5 font-medium">
                  Total Expense
                </span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-2">
              {hasExpenses ? (
                chartData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                      />
                      <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-slate-500 dark:text-[#8e9aa8] font-medium ml-2 shrink-0">
                      {item.percentage}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No recorded expenses.</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom 2 Key Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] p-3.5 space-y-1 shadow-xs">
            <Bookmark className="w-4 h-4 text-slate-400 mb-1" />
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#8e9aa8] block">
              Most Used Category
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-white block tracking-tight truncate">
              {analytics.mostUsedCategory || "None"}
            </span>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] p-3.5 space-y-1 shadow-xs">
            <Zap className="w-4 h-4 text-slate-400 mb-1" />
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#8e9aa8] block">
              Avg Daily Spend
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-white block tracking-tight truncate">
              {formatPaiseToINR(
                analytics.averageDailySpendPaise,
                analytics.averageDailySpendPaise % 100 !== 0
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
