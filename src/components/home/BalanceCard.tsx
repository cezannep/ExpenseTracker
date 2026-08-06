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
      className="mx-5 p-6 rounded-[2rem] bg-gradient-to-br from-[#071b3a] via-[#0b2854] to-[#071b3a] text-white shadow-xl shadow-[#071b3a]/20 relative overflow-hidden border border-[#123c73]"
    >
      {/* Accent Glow Orbs */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-[#10d2c3]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-[#10d2c3]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between text-slate-300 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#10d2c3]">
          <Wallet className="w-3.5 h-3.5 text-[#10d2c3]" /> Current Balance
        </span>
      </div>

      {/* Large Balance Display */}
      <motion.div
        key={balance}
        initial={{ scale: 0.96, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="text-4xl font-black tracking-tight mb-6 text-white"
      >
        {formatCurrency(balance)}
      </motion.div>

      {/* Income & Expense Breakdown */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#123c73]">
        <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-[#10d2c3]/10 border border-[#10d2c3]/20">
          <div className="p-2 rounded-xl bg-[#10d2c3]/20 text-[#10d2c3]">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Income</p>
            <p className="text-sm font-extrabold text-[#10d2c3]">{formatCurrency(income)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Expense</p>
            <p className="text-sm font-extrabold text-rose-400">{formatCurrency(expense)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

