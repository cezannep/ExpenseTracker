"use client";

import React from "react";
import { Plus, ArrowUpRight } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { motion } from "framer-motion";

export function QuickActions() {
  const { openAddModal, selectedHomeDate } = useAppStore();

  return (
    <div className="mx-5 grid grid-cols-2 gap-3">
      {/* Left Action: Add Expense (Solid White Pill Button) */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => openAddModal("expense", selectedHomeDate)}
        className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-black font-bold text-xs shadow-sm active:opacity-90 transition-all"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Add Expense</span>
      </motion.button>

      {/* Right Action: Add Income (Outlined Card Button) */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => openAddModal("income", selectedHomeDate)}
        className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-white dark:bg-[#12171f] border border-[#e2e8f0] dark:border-[#1d2633] text-slate-900 dark:text-white font-bold text-xs shadow-sm active:bg-slate-50 dark:active:bg-[#18202a] transition-all"
      >
        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
        <span>Add Income</span>
      </motion.button>
    </div>
  );
}
