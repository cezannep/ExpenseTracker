"use client";

import React, { useState, useMemo, useEffect } from "react";
import { formatCurrency, formatDate, getLocalDateString, isToday, isYesterday } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Target, ChevronLeft, ChevronRight } from "lucide-react";

export function DailyLimitCard() {
  const { user, transactions, selectedHomeDate, setSelectedHomeDate } = useAppStore();
  const dailyLimit = user?.dailyLimit || 1000;

  // Auto-reset state tick at midnight
  const [currentDateStr, setCurrentDateStr] = useState(() => getLocalDateString());

  useEffect(() => {
    // Check every minute if local date string has changed (e.g. crossed midnight 11:59 PM -> 12:00 AM)
    const timer = setInterval(() => {
      const freshDate = getLocalDateString();
      if (freshDate !== currentDateStr) {
        setCurrentDateStr(freshDate);
        setSelectedHomeDate(freshDate);
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [currentDateStr, setSelectedHomeDate]);

  // Extract all distinct dates that have expense transactions (plus Today)
  const availableDates = useMemo(() => {
    const todayStr = getLocalDateString();
    const dateSet = new Set<string>();
    dateSet.add(todayStr);

    transactions.forEach((tx) => {
      if (tx.date) dateSet.add(tx.date);
    });

    // Sort dates ascending (oldest to newest)
    return Array.from(dateSet).sort((a, b) => a.localeCompare(b));
  }, [transactions]);

  const currentIndex = useMemo(() => {
    const idx = availableDates.indexOf(selectedHomeDate);
    return idx !== -1 ? idx : availableDates.length - 1;
  }, [availableDates, selectedHomeDate]);

  const dateToDisplay = availableDates[currentIndex] || getLocalDateString();

  // Compute date-specific historical budget snapshot
  const activeBudgetForDate = useMemo(() => {
    const history = user?.dailyBudgetHistory || {};
    const todayStr = getLocalDateString();

    // 1. If there is an explicit snapshot recorded for dateToDisplay, use it
    if (history[dateToDisplay] !== undefined) {
      return history[dateToDisplay];
    }

    // 2. For historical dates (dates BEFORE today):
    // Search only among recorded snapshots on or BEFORE dateToDisplay
    const recordedDatesBeforeOrOnDate = Object.keys(history)
      .filter((d) => d <= dateToDisplay)
      .sort((a, b) => a.localeCompare(b));

    if (recordedDatesBeforeOrOnDate.length > 0) {
      const latestDate = recordedDatesBeforeOrOnDate[recordedDatesBeforeOrOnDate.length - 1];
      return history[latestDate];
    }

    // 3. Fallback for old historical dates prior to any snapshot being created:
    if (dateToDisplay < todayStr) {
      return 150; // Sensible historical default limit for past days before snapshotting existed
    }

    return dailyLimit;
  }, [user?.dailyBudgetHistory, dateToDisplay, dailyLimit]);

  // Compute spending for selected date
  const spentForSelectedDate = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense" && t.date === dateToDisplay)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, dateToDisplay]);

  const remaining = activeBudgetForDate - spentForSelectedDate;
  const percentage = activeBudgetForDate > 0 
    ? Math.min(Math.round((spentForSelectedDate / activeBudgetForDate) * 100), 100) 
    : 100;
  const isExceeded = spentForSelectedDate > activeBudgetForDate;

  // Date Header Label
  const dateLabel = useMemo(() => {
    if (isToday(dateToDisplay)) return "Today";
    if (isYesterday(dateToDisplay)) return "Yesterday";
    return formatDate(dateToDisplay);
  }, [dateToDisplay]);

  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < availableDates.length - 1;

  const handlePrev = () => {
    if (canGoLeft) setSelectedHomeDate(availableDates[currentIndex - 1]);
  };

  const handleNext = () => {
    if (canGoRight) setSelectedHomeDate(availableDates[currentIndex + 1]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mx-5 p-5 rounded-3xl bg-[#ffffff]/90 dark:bg-[#071b3a]/90 backdrop-blur-xl border border-[#d6dce5] dark:border-[#123c73] shadow-sm relative overflow-hidden"
    >
      {/* Top Bar with Date Navigation */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#10d2c3]/10 text-[#10d2c3]">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-[#071b3a] dark:text-slate-100 uppercase tracking-wider block">
              Daily Budget
            </span>
            <span className="text-[10px] font-bold text-[#10d2c3]">
              {dateLabel} {dateToDisplay !== getLocalDateString() && `(${dateToDisplay})`}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handlePrev}
            disabled={!canGoLeft}
            className="p-1 rounded-lg border border-[#d6dce5] dark:border-[#123c73] text-[#071b3a] dark:text-slate-200 active:bg-slate-100 dark:active:bg-[#0b2854] disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={!canGoRight}
            className="p-1 rounded-lg border border-[#d6dce5] dark:border-[#123c73] text-[#071b3a] dark:text-slate-200 active:bg-slate-100 dark:active:bg-[#0b2854] disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-[#071b3a] dark:text-slate-100 bg-[#f8fafc] dark:bg-[#0b2854] px-2.5 py-1 rounded-full border border-[#d6dce5] dark:border-[#123c73] ml-1">
            {formatCurrency(activeBudgetForDate)} Limit
          </span>
        </div>
      </div>

      {/* Swipeable Animated Card Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={dateToDisplay}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset }) => {
            if (offset.x < -40 && canGoRight) {
              handleNext();
            } else if (offset.x > 40 && canGoLeft) {
              handlePrev();
            }
          }}
          className="cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-2xl font-black text-[#071b3a] dark:text-white tracking-tight">
                {formatCurrency(spentForSelectedDate)}
              </span>
              <span className="text-xs font-medium text-[#071b3a]/60 dark:text-slate-400 ml-1.5">
                spent {isToday(dateToDisplay) ? "today" : "on this day"}
              </span>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  isExceeded
                    ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    : "bg-[#10d2c3]/10 text-[#10d2c3] border-[#10d2c3]/20"
                }`}
              >
                {isExceeded ? "Exceeded" : `${formatCurrency(remaining)} left`}
              </span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-2.5 bg-[#f8fafc] dark:bg-[#0b2854] rounded-full overflow-hidden p-0.5 border border-[#d6dce5] dark:border-[#123c73]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full rounded-full transition-colors ${
                isExceeded
                  ? "bg-gradient-to-r from-rose-500 to-rose-600 shadow-sm shadow-rose-500/50"
                  : "bg-gradient-to-r from-[#10d2c3] to-[#24dacd] shadow-sm shadow-[#10d2c3]/40"
              }`}
            />
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#071b3a]/70 dark:text-slate-400">
            {isExceeded ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="text-rose-500 font-medium">
                  Crossed limit by {formatCurrency(spentForSelectedDate - activeBudgetForDate)}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10d2c3] shrink-0" />
                <span>Within safe spending limit for {dateLabel}.</span>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
