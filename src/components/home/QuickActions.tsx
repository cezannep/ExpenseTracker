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
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => openAddModal("expense")}
        className="flex items-center justify-center space-x-2.5 py-3.5 px-4 rounded-2xl bg-rose-500/10 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider border border-rose-500/20 shadow-sm hover:bg-rose-500/15 transition-all"
      >
        <PlusCircle className="w-4 h-4 text-rose-500" />
        <span>Add Expense</span>
      </motion.button>

      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => openAddModal("income")}
        className="flex items-center justify-center space-x-2.5 py-3.5 px-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider border border-emerald-500/20 shadow-sm hover:bg-emerald-500/15 transition-all"
      >
        <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
        <span>Add Income</span>
      </motion.button>
    </div>
  );
}

