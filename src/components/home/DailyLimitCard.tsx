"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Target } from "lucide-react";

export function DailyLimitCard() {
  const { user, getSpentToday } = useAppStore();

  const dailyLimit = user?.dailyLimit || 1000;
  const spentToday = getSpentToday();
  const remaining = dailyLimit - spentToday;
  const percentage = Math.min(Math.round((spentToday / dailyLimit) * 100), 100);
  const isExceeded = spentToday > dailyLimit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mx-5 p-5 rounded-3xl bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-900/5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Target className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Daily Budget
          </span>
        </div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/50">
          {formatCurrency(dailyLimit)} Limit
        </span>
      </div>

      <div className="flex items-baseline justify-between mb-3">
        <div>
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(spentToday)}
          </span>
          <span className="text-xs font-medium text-slate-400 ml-1.5">spent today</span>
        </div>

        <div className="text-right">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              isExceeded
                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            }`}
          >
            {isExceeded ? "Exceeded" : `${formatCurrency(remaining)} left`}
          </span>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full transition-colors ${
            isExceeded
              ? "bg-gradient-to-r from-rose-500 to-rose-600 shadow-sm shadow-rose-500/50"
              : "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-sm shadow-emerald-500/50"
          }`}
        />
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        {isExceeded ? (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="text-rose-500 font-medium">You have crossed your limit by {formatCurrency(spentToday - dailyLimit)}</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>You are within your safe spending limit.</span>
          </>
        )}
      </div>
    </motion.div>
  );
}

