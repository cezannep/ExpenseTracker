"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { motion } from "framer-motion";

export function BalanceCard() {
  const { getBalance, getTotalIncome, getTotalExpense } = useAppStore();

  const balance = getBalance();
  const income = getTotalIncome();
  const expense = getTotalExpense();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-5 p-6 rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 dark:from-[#0f172a] dark:via-[#111827] dark:to-[#0f172a] text-white shadow-2xl shadow-indigo-950/20 relative overflow-hidden border border-slate-800/80"
    >
      {/* Dynamic Glow Background Orbs */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between text-slate-400 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-slate-300/90">
          <Wallet className="w-3.5 h-3.5 text-indigo-400" /> Current Balance
        </span>
      </div>

      {/* Large Balance Display */}
      <motion.div
        key={balance}
        initial={{ scale: 0.96, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="text-4xl font-black tracking-tight mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300"
      >
        {formatCurrency(balance)}
      </motion.div>

      {/* Income & Expense Breakdown */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Income</p>
            <p className="text-sm font-bold text-emerald-400">{formatCurrency(income)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expense</p>
            <p className="text-sm font-bold text-rose-400">{formatCurrency(expense)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

