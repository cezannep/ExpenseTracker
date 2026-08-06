"use client";

import React, { useState } from "react";
import { Header } from "@/components/common/Header";
import { useAppStore } from "@/stores/useAppStore";
import { TransactionCard } from "@/components/home/RecentTransactions";
import { Search, Filter, RotateCcw } from "lucide-react";
import { Category } from "@/types";

const ALL_CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Medical",
  "Entertainment",
  "Bills",
  "Education",
  "Home",
  "Salary",
  "Cash",
  "Gift",
  "Bank Transfer",
  "Others",
];

export default function TransactionsPage() {
  const { transactions, deleteTransaction } = useAppStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      // Type match
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;

      // Category match
      if (categoryFilter !== "all" && tx.category !== categoryFilter) return false;

      // Search query match (note or category)
      if (search.trim()) {
        const query = search.toLowerCase();
        const categoryMatch = tx.category.toLowerCase().includes(query);
        const noteMatch = tx.note?.toLowerCase().includes(query) || false;
        const amountMatch = tx.amount.toString().includes(query);
        return categoryMatch || noteMatch || amountMatch;
      }

      return true;
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  return (
    <div className="space-y-4 pb-6">
      <Header />

      <div className="px-5 space-y-3">
        <h2 className="text-xl font-bold tracking-tight text-[#071b3a] dark:text-slate-50">
          Transactions
        </h2>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by note, category, or amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#ffffff] dark:bg-[#071b3a] border border-[#d6dce5] dark:border-[#123c73] text-xs font-medium text-[#071b3a] dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10d2c3] shadow-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#071b3a]/70 dark:text-slate-400 font-semibold">
            <span className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#10d2c3]" /> Filters
            </span>

            {(typeFilter !== "all" || categoryFilter !== "all" || search) && (
              <button
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setCategoryFilter("all");
                }}
                className="text-[#10d2c3] flex items-center gap-1 active:opacity-75"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Type Filter Tabs */}
          <div className="grid grid-cols-3 p-1 bg-slate-200/60 dark:bg-[#0b2854] rounded-xl text-xs font-semibold">
            {(["all", "income", "expense"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`py-1.5 rounded-lg capitalize transition-all ${
                  typeFilter === t
                    ? "bg-[#071b3a] text-[#10d2c3] dark:bg-[#10d2c3] dark:text-[#071b3a] shadow-xs"
                    : "text-[#071b3a]/60 dark:text-slate-300 active:text-[#071b3a]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Category Horizontal Scroll */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === "all"
                  ? "bg-[#10d2c3] text-[#071b3a]"
                  : "bg-[#ffffff] dark:bg-[#071b3a] border border-[#d6dce5] dark:border-[#123c73] text-[#071b3a] dark:text-slate-300"
              }`}
            >
              All Categories
            </button>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  categoryFilter === cat
                    ? "bg-[#10d2c3] text-[#071b3a]"
                    : "bg-[#ffffff] dark:bg-[#071b3a] border border-[#d6dce5] dark:border-[#123c73] text-[#071b3a] dark:text-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="pt-2 space-y-2">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800">
              <p className="text-slate-500 text-sm font-medium">No matching transactions found.</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onDelete={(id) => deleteTransaction(id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
