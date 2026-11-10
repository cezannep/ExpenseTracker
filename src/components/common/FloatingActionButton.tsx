"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { motion } from "framer-motion";

export function FloatingActionButton() {
  const { openAddModal } = useAppStore();

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={() => openAddModal("expense")}
      className="fixed bottom-20 right-6 max-w-md z-40 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-500 dark:to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/35 active:scale-95 transition-all focus:outline-none ring-4 ring-indigo-500/20"
      aria-label="Add Transaction"
    >
      <Plus className="w-7 h-7 stroke-[2.5]" />
    </motion.button>
  );
}

