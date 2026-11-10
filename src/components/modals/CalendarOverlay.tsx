"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import { getLocalDateString, addDays } from "@/lib/date";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SHORT_MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const WEEKDAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];

function getSundayOfWeek(dateStr: string): string {
  if (!dateStr) return dateStr;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day, 12, 0, 0);
  const dayOfWeek = date.getDay(); // 0 is Sunday
  date.setDate(date.getDate() - dayOfWeek);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatWeekDateRange(startDateStr: string, endDateStr: string): string {
  const [startY, startM, startD] = startDateStr.split("-").map(Number);
  const [endY, endM, endD] = endDateStr.split("-").map(Number);

  const startMonth = SHORT_MONTH_NAMES[startM - 1];
  const endMonth = SHORT_MONTH_NAMES[endM - 1];

  if (startY === endY) {
    if (startM === endM) {
      return `${startD} – ${endD} ${startMonth} ${startY}`;
    }
    return `${startD} ${startMonth} – ${endD} ${endMonth} ${startY}`;
  }
  return `${startD} ${startMonth} ${startY} – ${endD} ${endMonth} ${endY}`;
}

function CalendarOverlayContent() {
  const router = useRouter();
  const {
    closeCalendarModal,
    selectedHomeDate,
    setSelectedHomeDate,
    openAddModal,
  } = useAppStore();

  const todayStr = useMemo(() => getLocalDateString(), []);
  const initialActiveDate = selectedHomeDate || todayStr;

  // State inside calendar
  const [selectedDate, setSelectedDate] = useState(initialActiveDate);
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("monthly");
  const [note, setNote] = useState("");

  // Year and Month navigation state
  const [displayedYear, setDisplayedYear] = useState(() => {
    const [y] = initialActiveDate.split("-").map(Number);
    return y || new Date().getFullYear();
  });
  const [displayedMonthIndex, setDisplayedMonthIndex] = useState(() => {
    const [, m] = initialActiveDate.split("-").map(Number);
    return m ? m - 1 : new Date().getMonth();
  });

  // Weekly navigation state: points to Sunday of the active week
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    return getSundayOfWeek(initialActiveDate);
  });

  // Switch to Weekly mode centered on current month's weeks
  const handleSwitchToWeekly = () => {
    setViewMode("weekly");
    const [selY, selM] = selectedDate.split("-").map(Number);
    if (selY === displayedYear && selM === displayedMonthIndex + 1) {
      setCurrentWeekStart(getSundayOfWeek(selectedDate));
    } else {
      const firstDayOfMonth = `${displayedYear}-${String(displayedMonthIndex + 1).padStart(2, "0")}-01`;
      setCurrentWeekStart(getSundayOfWeek(firstDayOfMonth));
    }
  };

  const handleSwitchToMonthly = () => {
    setViewMode("monthly");
  };

  // Month navigation handlers (Monthly mode)
  const handlePrevMonth = () => {
    if (displayedMonthIndex === 0) {
      setDisplayedMonthIndex(11);
      setDisplayedYear((prev) => prev - 1);
    } else {
      setDisplayedMonthIndex((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayedMonthIndex === 11) {
      setDisplayedMonthIndex(0);
      setDisplayedYear((prev) => prev + 1);
    } else {
      setDisplayedMonthIndex((prev) => prev + 1);
    }
  };

  // Week navigation handlers (Weekly mode - navigate 1 week at a time)
  const handlePrevWeek = () => {
    const prevWeek = addDays(currentWeekStart, -7);
    setCurrentWeekStart(prevWeek);
    const midWeek = addDays(prevWeek, 3);
    const [y, m] = midWeek.split("-").map(Number);
    setDisplayedYear(y);
    setDisplayedMonthIndex(m - 1);
  };

  const handleNextWeek = () => {
    const nextWeek = addDays(currentWeekStart, 7);
    setCurrentWeekStart(nextWeek);
    const midWeek = addDays(nextWeek, 3);
    const [y, m] = midWeek.split("-").map(Number);
    setDisplayedYear(y);
    setDisplayedMonthIndex(m - 1);
  };

  const handlePrev = () => {
    if (viewMode === "monthly") {
      handlePrevMonth();
    } else {
      handlePrevWeek();
    }
  };

  const handleNext = () => {
    if (viewMode === "monthly") {
      handleNextMonth();
    } else {
      handleNextWeek();
    }
  };

  // Compute days for monthly grid
  const monthlyGridDays = useMemo(() => {
    const firstDayIndex = new Date(displayedYear, displayedMonthIndex, 1).getDay(); // 0 is Sunday
    const totalDaysInMonth = new Date(displayedYear, displayedMonthIndex + 1, 0).getDate();

    const leadingEmptySlots = Array(firstDayIndex).fill(null);
    const monthDays = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

    return [...leadingEmptySlots, ...monthDays];
  }, [displayedYear, displayedMonthIndex]);

  // Compute 7 days for weekly mode (Sunday to Saturday for currentWeekStart)
  const weeklyGridDays = useMemo(() => {
    const week: { dayNum: number; dateStr: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const dateStr = addDays(currentWeekStart, i);
      const parts = dateStr.split("-");
      const dayNum = parseInt(parts[2], 10);
      week.push({ dayNum, dateStr });
    }
    return week;
  }, [currentWeekStart]);

  // Compute displayed date range for weekly mode (e.g. "1 – 7 Nov 2026", "29 Nov – 5 Dec 2026")
  const weekRangeLabel = useMemo(() => {
    if (weeklyGridDays.length < 7) return "";
    return formatWeekDateRange(weeklyGridDays[0].dateStr, weeklyGridDays[6].dateStr);
  }, [weeklyGridDays]);

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedHomeDate(dateStr);
    setCurrentWeekStart(getSundayOfWeek(dateStr));
    const [y, m] = dateStr.split("-").map(Number);
    setDisplayedYear(y);
    setDisplayedMonthIndex(m - 1);
  };

  const handleNewExpense = () => {
    setSelectedHomeDate(selectedDate);
    closeCalendarModal();
    openAddModal("expense", selectedDate, note.trim() || undefined);
    setNote("");
  };

  const handleOpenSettings = () => {
    closeCalendarModal();
    router.push("/settings");
  };

  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.92, opacity: 0, y: 10 }}
      transition={{ type: "spring", damping: 25, stiffness: 350 }}
      className="relative w-full max-w-[370px] mx-auto rounded-[2rem] p-6 bg-white/90 dark:bg-[#070e1b]/70 backdrop-blur-3xl border border-slate-200/80 dark:border-white/[0.18] shadow-2xl shadow-slate-900/10 dark:shadow-2xl overflow-hidden text-slate-900 dark:text-white z-10"
    >
      {/* Subtle Ambient Reflections */}
      <div className="absolute -top-20 -left-20 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Row: Weekly/Monthly Toggle Pill on Left, Settings Icon on Right */}
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-slate-100/90 dark:bg-white/[0.08] p-1 rounded-full border border-slate-200/80 dark:border-white/10">
          <button
            type="button"
            onClick={handleSwitchToWeekly}
            className={`px-4 py-1 rounded-full text-xs transition-all active:scale-95 ${
              viewMode === "weekly"
                ? "bg-white text-slate-900 dark:bg-white dark:text-black font-semibold shadow-xs"
                : "text-slate-500 dark:text-slate-400 font-medium active:text-slate-900 dark:active:text-white"
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={handleSwitchToMonthly}
            className={`px-4 py-1 rounded-full text-xs transition-all active:scale-95 ${
              viewMode === "monthly"
                ? "bg-white text-slate-900 dark:bg-white dark:text-black font-semibold shadow-xs"
                : "text-slate-500 dark:text-slate-400 font-medium active:text-slate-900 dark:active:text-white"
            }`}
          >
            Monthly
          </button>
        </div>

        <button
          type="button"
          onClick={handleOpenSettings}
          className="p-1.5 rounded-full text-slate-500 active:text-slate-900 active:bg-slate-100 dark:text-slate-300 dark:active:text-white dark:active:bg-white/10 active:scale-95 transition-all"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 stroke-[1.8]" />
        </button>
      </div>

      {/* Month & Year / Week Range Navigation Row */}
      <div className="flex items-center justify-between mt-5 mb-3">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {viewMode === "monthly"
            ? `${MONTH_NAMES[displayedMonthIndex]} ${displayedYear}`
            : weekRangeLabel}
        </h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="w-8 h-8 rounded-xl bg-slate-100/90 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-white flex items-center justify-center active:bg-slate-200/80 dark:active:bg-white/20 active:scale-95 transition-all"
            aria-label={viewMode === "monthly" ? "Previous Month" : "Previous Week"}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="w-8 h-8 rounded-xl bg-slate-100/90 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-white flex items-center justify-center active:bg-slate-200/80 dark:active:bg-white/20 active:scale-95 transition-all"
            aria-label={viewMode === "monthly" ? "Next Month" : "Next Week"}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Column Headers (S, M, T, W, T, F, S) */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-1.5">
        {WEEKDAY_HEADERS.map((day, idx) => (
          <span key={idx}>{day}</span>
        ))}
      </div>

      {/* Calendar Grid Body */}
      {viewMode === "monthly" ? (
        <div className="grid grid-cols-7 text-center gap-y-2.5 py-1">
          {monthlyGridDays.map((dayNum, idx) => {
            if (!dayNum) return <div key={`empty-${idx}`} className="w-8 h-8 mx-auto" />;

            const dayDateStr = `${displayedYear}-${String(displayedMonthIndex + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const isSelected = dayDateStr === selectedDate;
            const isFuture = dayDateStr > todayStr;

            return (
              <button
                key={dayDateStr}
                type="button"
                disabled={isFuture}
                onClick={() => handleSelectDate(dayDateStr)}
                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm transition-all ${
                  isSelected
                    ? "bg-[#10B981] text-white font-bold shadow-md shadow-emerald-500/30 scale-105"
                    : isFuture
                    ? "text-slate-300 dark:text-slate-600 cursor-not-allowed dark:opacity-40"
                    : "text-slate-800 dark:text-white font-medium active:bg-slate-200/80 dark:active:bg-white/20 active:scale-95"
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-7 text-center gap-y-2.5 py-3">
          {weeklyGridDays.map((item) => {
            const isSelected = item.dateStr === selectedDate;
            const isFuture = item.dateStr > todayStr;

            return (
              <button
                key={item.dateStr}
                type="button"
                disabled={isFuture}
                onClick={() => handleSelectDate(item.dateStr)}
                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm transition-all ${
                  isSelected
                    ? "bg-[#10B981] text-white font-bold shadow-md shadow-emerald-500/30 scale-105"
                    : isFuture
                    ? "text-slate-300 dark:text-slate-600 cursor-not-allowed dark:opacity-40"
                    : "text-slate-800 dark:text-white font-medium active:bg-slate-200/80 dark:active:bg-white/20 active:scale-95"
                }`}
              >
                {item.dayNum}
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom Section: Add a note field & New Expense Button */}
      <div className="mt-5 pt-3.5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Pencil className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Add a note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full text-xs text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleNewExpense}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#108A5E] active:bg-[#0e7c54] text-white font-semibold text-xs shadow-md shadow-emerald-700/20 dark:shadow-emerald-950/40 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Expense</span>
        </button>
      </div>
    </motion.div>
  );
}

export function CalendarOverlay() {
  const { isCalendarModalOpen, closeCalendarModal, selectedHomeDate } = useAppStore();

  if (!isCalendarModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Strong Backdrop Blur that keeps underlying dashboard visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCalendarModal}
          className="fixed inset-0 bg-slate-900/30 dark:bg-slate-950/50 backdrop-blur-md max-w-md mx-auto"
        />

        {/* Content keyed by selectedHomeDate so state initializes cleanly */}
        <CalendarOverlayContent key={selectedHomeDate || "cal"} />
      </div>
    </AnimatePresence>
  );
}
