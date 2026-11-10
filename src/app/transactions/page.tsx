"use client";

import React, { useState } from "react";
import { Header } from "@/components/common/Header";
import { useAppStore } from "@/stores/useAppStore";
import { TransactionCard } from "@/components/home/RecentTransactions";
import { Search, Filter, Calendar, ChevronDown, RotateCcw, X } from "lucide-react";
import { formatPaiseToINR, paiseToRupees } from "@/lib/money";
import { formatRelativeOrDate, getLocalDateString } from "@/lib/utils";
import { Transaction } from "@/types";

const ALL_CATEGORIES = [
  "Food",  
  "Petrol",
  "Shopping",
  "Travel",
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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getMonthKey(dateStr?: string, createdAt?: string): string {
  if (dateStr && dateStr.length >= 7) {
    return dateStr.substring(0, 7);
  }
  if (createdAt && createdAt.length >= 7) {
    return createdAt.substring(0, 7);
  }
  return getLocalDateString().substring(0, 7);
}

function formatMonthKey(monthKey: string): string {
  const parts = monthKey.split("-");
  if (parts.length >= 2) {
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
      return `${MONTH_NAMES[monthNum - 1]} ${year}`;
    }
  }
  return monthKey;
}

interface MonthGroup {
  monthKey: string;
  monthTitle: string;
  totalExpensePaise: number;
  totalIncomePaise: number;
  transactions: Transaction[];
}

export default function TransactionsPage() {
  const {
    transactions,
    deleteTransaction,
    openEditModal,
    openCalendarModal,
    selectedHomeDate,
    isCalendarModalOpen,
  } = useAppStore();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [calendarOpenedFromHere, setCalendarOpenedFromHere] = useState(false);
  const prevModalOpen = React.useRef(isCalendarModalOpen);

  React.useEffect(() => {
    if (prevModalOpen.current && !isCalendarModalOpen && calendarOpenedFromHere) {
      setSelectedDate(selectedHomeDate);
      setCalendarOpenedFromHere(false);
    }
    prevModalOpen.current = isCalendarModalOpen;
  }, [isCalendarModalOpen, calendarOpenedFromHere, selectedHomeDate]);

  const isSearchActive = Boolean(search.trim());

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      // Type match
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;

      // Category match
      if (categoryFilter !== "all" && tx.category !== categoryFilter) return false;

      // Date match (only if user explicitly selected a date filter)
      if (selectedDate && tx.date !== selectedDate) return false;

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
    });
  }, [transactions, search, typeFilter, categoryFilter, selectedDate, isSearchActive]);

  // Group transactions by Month and Year (newest month first, newest transactions first within month)
  const groupedByMonth: MonthGroup[] = React.useMemo(() => {
    const groupsMap = new Map<string, {
      totalExpensePaise: number;
      totalIncomePaise: number;
      transactions: Transaction[];
    }>();

    for (const tx of filteredTransactions) {
      const key = getMonthKey(tx.date, tx.createdAt);
      let group = groupsMap.get(key);
      if (!group) {
        group = {
          totalExpensePaise: 0,
          totalIncomePaise: 0,
          transactions: [],
        };
        groupsMap.set(key, group);
      }
      group.transactions.push(tx);
      if (tx.type === "expense") {
        group.totalExpensePaise += tx.amountPaise;
      } else if (tx.type === "income") {
        group.totalIncomePaise += tx.amountPaise;
      }
    }

    // Sort months descending (newest month first)
    const sortedMonthKeys = Array.from(groupsMap.keys()).sort((a, b) => b.localeCompare(a));

    return sortedMonthKeys.map((key) => {
      const group = groupsMap.get(key)!;
      // Sort transactions within each month: newest date first, then newest createdAt first
      group.transactions.sort((a, b) => {
        const dateA = a.date || "";
        const dateB = b.date || "";
        if (dateA !== dateB) {
          return dateB.localeCompare(dateA);
        }
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      return {
        monthKey: key,
        monthTitle: formatMonthKey(key),
        totalExpensePaise: group.totalExpensePaise,
        totalIncomePaise: group.totalIncomePaise,
        transactions: group.transactions,
      };
    });
  }, [filteredTransactions]);

  const handleDateClick = () => {
    setCalendarOpenedFromHere(true);
    openCalendarModal();
  };

  const hasActiveFilters =
    typeFilter !== "all" || categoryFilter !== "all" || selectedDate !== "" || isSearchActive;

  const handleResetFilters = () => {
    setTypeFilter("all");
    setCategoryFilter("all");
    setSelectedDate("");
    setSearch("");
  };

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
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] text-xs font-medium text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
          >
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filters</span>
            {hasActiveFilters && (
              <RotateCcw className="w-3 h-3 text-emerald-400 ml-1" />
            )}
          </button>

          <div className="relative">
            {selectedDate ? (
              <div className="flex items-center gap-1.5 bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                <button
                  type="button"
                  onClick={handleDateClick}
                  className="flex items-center gap-1.5 active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatRelativeOrDate(selectedDate)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate("")}
                  className="p-0.5 text-slate-400 active:text-slate-600 dark:active:text-white active:scale-95 ml-0.5"
                  title="Clear date filter"
                  aria-label="Clear date filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDateClick}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] text-xs font-medium text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>All Dates</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            )}
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
                    : "text-slate-500 dark:text-[#8e9aa8] font-medium active:scale-95"
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
                : "bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] text-slate-700 dark:text-slate-300 font-medium active:scale-95"
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
                    : "bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] text-slate-700 dark:text-slate-300 font-medium active:scale-95"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Transactions List Grouped by Month */}
        <div className="space-y-4 pt-1">
          {groupedByMonth.length === 0 ? (
            <div className="py-12 text-center bg-white/60 dark:bg-[#12171f]/50 rounded-3xl border border-slate-200/80 dark:border-[#1d2633]">
              <p className="text-slate-500 dark:text-[#8e9aa8] text-xs font-medium">
                No matching transactions found.
              </p>
            </div>
          ) : (
            groupedByMonth.map((group) => (
              <section key={group.monthKey} className="space-y-2">
                {/* Monthly Expense Summary Header */}
                <div className="flex items-center justify-between px-1.5 pt-1">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                      {group.monthTitle}
                    </h2>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-[#8e9aa8]">
                      • {group.transactions.length} {group.transactions.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="flex items-baseline gap-1.5 justify-end">
                      <span className="text-[11px] font-medium text-slate-500 dark:text-[#8e9aa8]">
                        {typeFilter === "income" ? "Total Income:" : "Total Spent:"}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          typeFilter === "income"
                            ? "text-emerald-500 dark:text-emerald-400"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {typeFilter === "income"
                          ? `+${formatPaiseToINR(group.totalIncomePaise, group.totalIncomePaise % 100 !== 0)}`
                          : formatPaiseToINR(group.totalExpensePaise, group.totalExpensePaise % 100 !== 0)}
                      </span>
                    </div>
                    {typeFilter === "all" && group.totalIncomePaise > 0 && (
                      <div className="text-[10px] font-medium text-emerald-500 dark:text-emerald-400">
                        Income: +{formatPaiseToINR(group.totalIncomePaise, group.totalIncomePaise % 100 !== 0)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Individual Transactions for this month */}
                <div className="space-y-2">
                  {group.transactions.map((tx) => (
                    <TransactionCard
                      key={tx.id}
                      transaction={tx}
                      onDelete={deleteTransaction}
                      onEdit={openEditModal}
                      showDate={true}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
