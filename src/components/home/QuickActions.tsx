"use client";

import React from "react";
import { PlusCircle, ArrowDownLeft } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { motion } from "framer-motion";

export function QuickActions() {
  const { openAddModal } = useAppStore();

  return (
    <div className="mx-5 grid grid-cols-2 gap-3.5">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => openAddModal("expense")}
        className="flex items-center justify-center space-x-2.5 py-3.5 px-4 rounded-2xl bg-rose-500/10 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider border border-rose-500/20 shadow-sm active:bg-rose-500/20 transition-all"
      >
        <PlusCircle className="w-4 h-4 text-rose-500" />
        <span>Add Expense</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => openAddModal("income")}
        className="flex items-center justify-center space-x-2.5 py-3.5 px-4 rounded-2xl bg-[#10d2c3]/10 dark:bg-[#10d2c3]/10 text-[#10d2c3] font-bold text-xs uppercase tracking-wider border border-[#10d2c3]/20 shadow-sm active:bg-[#10d2c3]/20 transition-all"
      >
        <ArrowDownLeft className="w-4 h-4 text-[#10d2c3]" />
        <span>Add Income</span>
      </motion.button>
    </div>
  );
}

