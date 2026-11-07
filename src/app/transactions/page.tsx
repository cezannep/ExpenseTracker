"use client";

import React, { useState } from "react";
import { Header } from "@/components/common/Header";
import { useAppStore } from "@/stores/useAppStore";
import { TransactionCard } from "@/components/home/RecentTransactions";
import { Search, Filter, Calendar, ChevronDown, RotateCcw } from "lucide-react";
import { paiseToRupees } from "@/lib/money";
import { formatRelativeOrDate, getLocalDateString } from "@/lib/utils";

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
  const { transactions, deleteTransaction, openEditModal, openCalendarModal, selectedHomeDate, setSelectedHomeDate } = useAppStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const todayStr = getLocalDateString();
  const activeDate = selectedDate || selectedHomeDate || todayStr;
  const isSearchActive = Boolean(search.trim());

  const filteredTransactions = React.useMemo(() => {
    return transactions
      .filter((tx) => {
        // Type match
        if (typeFilter !== "all" && tx.type !== typeFilter) return false;

        // Category match
        if (categoryFilter !== "all" && tx.category !== categoryFilter) return false;

        // Date match (if not searching across all dates)
        if (!isSearchActive && activeDate && tx.date !== activeDate) return false;

        // Search query match (note, category, or rupee amount)
        if (isSearchActive) {
          const query = search.toLowerCase();
          const categoryMatch = tx.category.toLowerCase().includes(query);
          const noteMatch = tx.note?.toLowerCase().includes(query) || false;
          const rupeeAmount = paiseToRupees(tx.amountPaise).toString();
          const amountMatch = rupeeAmount.includes(query);
          return categoryMatch || noteMatch || amountMatch;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [transactions, search, typeFilter, categoryFilter, activeDate, isSearchActive]);

  const handleDateClick = () => {
    openCalendarModal();
  };

  const dateButtonLabel = formatRelativeOrDate(activeDate);

  return (
    <div className="space-y-3.5 pb-6">
      <Header />

      {/* Page Title in Main Content Section */}
      <div className="px-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Transactions
        </h1>
      </div>

      <div className="px-5 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by note, category, or amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-xs"
          />
        </div>

        {/* Filter Controls Row: Filters Button on Left, Date Button on Right */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              setTypeFilter("all");
              setCategoryFilter("all");
              setSelectedDate("");
              setSelectedHomeDate(todayStr);
              setSearch("");
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filters</span>
            {(typeFilter !== "all" || categoryFilter !== "all" || selectedDate || search || (selectedHomeDate && selectedHomeDate !== todayStr)) && (
              <RotateCcw className="w-3 h-3 text-emerald-400 ml-1" />
            )}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={handleDateClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateButtonLabel}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Type Segmented Control Tabs (All | Income | Expense) */}
        <div className="flex items-center justify-between p-1 bg-slate-100 dark:bg-[#12171f] rounded-2xl border border-slate-200/80 dark:border-[#1d2633]">
          {(["all", "income", "expense"] as const).map((t) => {
            const isTabActive = typeFilter === t;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`flex-1 py-1.5 text-xs capitalize transition-all rounded-full ${
                  isTabActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-xs"
                    : "text-slate-500 dark:text-[#8e9aa8] font-medium hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            );
          })}
        </div>

        {/* Category Filter Chips Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
              categoryFilter === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-xs"
                : "bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] text-slate-700 dark:text-slate-300 font-medium hover:text-white"
            }`}
          >
            All Categories
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const isCatActive = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                  isCatActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-black font-bold shadow-xs"
                    : "bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] text-slate-700 dark:text-slate-300 font-medium hover:text-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Transactions List */}
        <div className="space-y-2 pt-1">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center bg-white/60 dark:bg-[#12171f]/50 rounded-3xl border border-slate-200/80 dark:border-[#1d2633]">
              <p className="text-slate-500 dark:text-[#8e9aa8] text-xs font-medium">
                No matching transactions found.
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onDelete={deleteTransaction}
                onEdit={openEditModal}
                showDate={isSearchActive}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
