"use client";

import React, { useState, useMemo, useEffect } from "react";
import { getLocalDateString, isToday, isYesterday, formatDate, addDays } from "@/lib/utils";
import { formatPaiseToINR } from "@/lib/money";
import { BudgetService } from "@/services/budgetService";
import { useAppStore } from "@/stores/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Calendar as CalendarIcon } from "lucide-react";

export function DailyLimitCard() {
  const { user, transactions, selectedHomeDate, setSelectedHomeDate, openCalendarModal } = useAppStore();

  const rawDailyLimit = user?.dailyLimitPaise || BudgetService.DEFAULT_DAILY_LIMIT_PAISE;
  const dailyLimitPaise = rawDailyLimit > 0 && rawDailyLimit < 1000 ? rawDailyLimit * 100 : rawDailyLimit;

  const [currentDateStr, setCurrentDateStr] = useState(() => getLocalDateString());

  useEffect(() => {
    const handleRecheck = () => {
      const freshDate = getLocalDateString();
      if (freshDate !== currentDateStr) {
        setCurrentDateStr(freshDate);
      }
    };

    window.addEventListener("focus", handleRecheck);
    window.addEventListener("visibilitychange", handleRecheck);
    const timer = setInterval(handleRecheck, 30000);

    return () => {
      window.removeEventListener("focus", handleRecheck);
      window.removeEventListener("visibilitychange", handleRecheck);
      clearInterval(timer);
    };
  }, [currentDateStr]);

  const todayStr = getLocalDateString();
  const dateToDisplay = selectedHomeDate || todayStr;

  const activeBudgetPaiseForDate = useMemo(() => {
    return BudgetService.resolveDailyBudgetForDate({
      date: dateToDisplay,
      history: user?.dailyBudgetHistory || {},
      currentDailyLimitPaise: dailyLimitPaise,
    });
  }, [user?.dailyBudgetHistory, dateToDisplay, dailyLimitPaise]);

  const spentPaiseForSelectedDate = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense" && t.date === dateToDisplay)
      .reduce((sum, t) => sum + t.amountPaise, 0);
  }, [transactions, dateToDisplay]);

  const spendingStats = useMemo(() => {
    return BudgetService.calculateDailySpending(spentPaiseForSelectedDate, activeBudgetPaiseForDate);
  }, [spentPaiseForSelectedDate, activeBudgetPaiseForDate]);

  const isCurrentDay = isToday(dateToDisplay);
  const canGoLeft = true;
  const canGoRight = dateToDisplay < todayStr;

  const handlePrev = () => {
    setSelectedHomeDate(addDays(dateToDisplay, -1));
  };

  const handleNext = () => {
    if (canGoRight) {
      setSelectedHomeDate(addDays(dateToDisplay, 1));
    }
  };

  const handleCalendarClick = () => {
    openCalendarModal();
  };

  return (
    <div className="mx-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="rounded-3xl bg-[#ffffff] dark:bg-[#12171f] border border-[#e2e8f0] dark:border-[#1d2633] p-4 shadow-sm space-y-2.5 relative overflow-hidden"
      >
        {/* Top Row: Target Icon + Daily Budget on Left, Limit Badge on Right */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[2]" />
            <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
              Daily Budget
            </span>

            {!isCurrentDay && (
              <button
                type="button"
                onClick={() => setSelectedHomeDate(todayStr)}
                className="text-[10px] font-semibold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full"
                title="Return to today"
              >
                Today
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCalendarClick}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Pick date"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#18202a] px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-[#222d3b] whitespace-nowrap">
              {formatPaiseToINR(activeBudgetPaiseForDate)} limit
            </span>
          </div>
        </div>

        {/* Swipeable Middle Section: Spent Today and Progress */}
        <AnimatePresence mode="wait">
          <motion.div
            key={dateToDisplay}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_e, { offset }) => {
              if (offset.x < -40 && canGoRight) {
                handleNext();
              } else if (offset.x > 40 && canGoLeft) {
                handlePrev();
              }
            }}
          >
            {/* Amount Spent Display */}
            <div className="flex items-baseline mt-1 mb-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {formatPaiseToINR(spendingStats.spentPaise)}
              </span>
              <span className="text-xs text-slate-500 dark:text-[#8e9aa8] ml-1.5 font-medium">
                spent {isCurrentDay ? "today" : isYesterday(dateToDisplay) ? "yesterday" : `on ${formatDate(dateToDisplay)}`}
              </span>
            </div>

            {/* Clean Progress Track */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-[#18202a] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(spendingStats.percentage, 100)}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`h-full rounded-full transition-all ${
                  spendingStats.isExceeded
                    ? "bg-rose-500"
                    : "bg-emerald-400"
                }`}
              />
            </div>

            {/* Remaining Amount on bottom right */}
            <div className="flex justify-end pt-1">
              <span className="text-[11px] text-slate-500 dark:text-[#8e9aa8] font-medium">
                {spendingStats.isExceeded
                  ? `Exceeded by ${formatPaiseToINR(spendingStats.overagePaise)}`
                  : `${formatPaiseToINR(spendingStats.remainingPaise)} left`}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
