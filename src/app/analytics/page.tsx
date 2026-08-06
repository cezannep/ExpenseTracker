"use client";

import React from "react";
import { Header } from "@/components/common/Header";
import { useAppStore } from "@/stores/useAppStore";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { TrendingUp, PieChart as PieIcon, BarChart2, Award, Zap, Activity } from "lucide-react";

const COLORS = ["#10D2C3", "#123C73", "#4FE5D9", "#0B2854", "#0CB6A8", "#071B3A", "#24DACD", "#099287"];

export default function AnalyticsPage() {
  const { transactions, getBalance, getTotalIncome, getTotalExpense } = useAppStore();

  const balance = getBalance();
  const income = getTotalIncome();
  const expense = getTotalExpense();

  // Category breakdown for pie chart
  const categoryData = React.useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const map: Record<string, number> = {};
    expenses.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });

    return Object.keys(map).map((cat) => ({
      name: cat,
      value: map[cat],
    }));
  }, [transactions]);

  // Statistics calculations
  const stats = React.useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    if (!expenses.length) return { highestDay: "N/A", mostUsedCategory: "N/A", avgDaily: 0 };

    // Most used category
    const catCounts: Record<string, number> = {};
    expenses.forEach((t) => {
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    });
    const mostUsedCat = Object.keys(catCounts).reduce((a, b) =>
      catCounts[a] > catCounts[b] ? a : b
    );

    // Daily spending map
    const dailyMap: Record<string, number> = {};
    expenses.forEach((t) => {
      dailyMap[t.date] = (dailyMap[t.date] || 0) + t.amount;
    });
    const highestSpendingDate = Object.keys(dailyMap).reduce((a, b) =>
      dailyMap[a] > dailyMap[b] ? a : b
    );

    const totalDays = Object.keys(dailyMap).length || 1;
    const avgDailySpend = Math.round(expense / totalDays);

    return {
      highestDay: highestSpendingDate,
      mostUsedCategory: mostUsedCat,
      avgDaily: avgDailySpend,
    };
  }, [transactions, expense]);

  return (
    <div className="space-y-4 pb-6">
      <Header />

      <div className="px-5 space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-[#071b3a] dark:text-slate-50">
          Analytics & Insights
        </h2>

        {/* Executive Summary Card */}
        <div className="p-5 rounded-3xl bg-[#ffffff] dark:bg-[#071b3a] border border-[#d6dce5] dark:border-[#123c73] shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#071b3a]/70 dark:text-slate-300 uppercase tracking-wide">
            <TrendingUp className="w-4 h-4 text-[#10d2c3]" /> Summary Breakdown
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            <div className="p-2.5 rounded-2xl bg-[#f8fafc] dark:bg-[#0b2854]">
              <p className="text-[10px] text-slate-500 font-medium">Income</p>
              <p className="text-xs font-extrabold text-[#10d2c3]">
                {formatCurrency(income)}
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#f8fafc] dark:bg-[#0b2854]">
              <p className="text-[10px] text-slate-500 font-medium">Expense</p>
              <p className="text-xs font-extrabold text-rose-500 dark:text-rose-400">
                {formatCurrency(expense)}
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#f8fafc] dark:bg-[#0b2854]">
              <p className="text-[10px] text-slate-500 font-medium">Net Savings</p>
              <p className="text-xs font-extrabold text-[#10d2c3]">
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="p-5 rounded-3xl bg-[#ffffff] dark:bg-[#071b3a] border border-[#d6dce5] dark:border-[#123c73] shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#071b3a]/70 dark:text-slate-300 uppercase tracking-wide">
            <PieIcon className="w-4 h-4 text-[#10d2c3]" /> Category Breakdown
          </div>

          {categoryData.length ? (
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value)), "Spent"]}
                    contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No expenses to display chart.</p>
          )}

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {categoryData.slice(0, 6).map((cat, i) => (
              <div key={cat.name} className="flex items-center space-x-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-slate-600 dark:text-slate-400 truncate">{cat.name}</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 ml-auto">
                  {formatCurrency(cat.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Statistics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <Award className="w-4 h-4 text-blue-500 mb-2" />
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Most Used Category</p>
            <p className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {stats.mostUsedCategory}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <Zap className="w-4 h-4 text-amber-500 mb-2" />
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Avg Daily Spend</p>
            <p className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {formatCurrency(stats.avgDaily)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
