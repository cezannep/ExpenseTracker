"use client";

import React from "react";
import { Transaction } from "@/types";
import { formatCurrency, formatDate, formatTime, getLocalDateString, isToday, isYesterday } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Stethoscope, 
  Film, 
  Receipt, 
  GraduationCap, 
  Home as HomeIcon, 
  HelpCircle,
  Briefcase,
  Gift,
  Landmark,
  Wallet,
  Trash2
} from "lucide-react";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Food: Utensils,
  Travel: Car,
  Shopping: ShoppingBag,
  Medical: Stethoscope,
  Entertainment: Film,
  Bills: Receipt,
  Education: GraduationCap,
  Home: HomeIcon,
  Others: HelpCircle,
  Salary: Briefcase,
  Gift: Gift,
  "Bank Transfer": Landmark,
  Cash: Wallet,
};

interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
}

export function TransactionCard({ transaction, onDelete }: TransactionItemProps) {
  const Icon = CATEGORY_ICONS[transaction.category] || HelpCircle;
  const isIncome = transaction.type === "income";
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="p-3.5 rounded-2xl bg-[#ffffff]/95 dark:bg-[#071b3a]/95 backdrop-blur-xl border border-[#d6dce5] dark:border-[#123c73] shadow-sm flex items-center justify-between transition-all active:bg-slate-100/80 dark:active:bg-[#0b2854]"
      >
        <div className="flex items-center space-x-3.5">
          <div
            className={`p-2.5 rounded-2xl flex items-center justify-center border ${
              isIncome
                ? "bg-[#10d2c3]/10 text-[#10d2c3] border-[#10d2c3]/20"
                : "bg-[#071b3a]/10 text-[#071b3a] dark:text-slate-200 border-[#071b3a]/20"
            }`}
          >
            <Icon className="w-4 h-4 stroke-[2.2]" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#071b3a] dark:text-white tracking-tight">
              {transaction.category}
            </h4>
            <p className="text-xs text-[#071b3a]/60 dark:text-slate-400 line-clamp-1 max-w-[150px]">
              {transaction.note || transaction.date}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p
              className={`text-sm font-extrabold tracking-tight ${
                isIncome ? "text-[#10d2c3]" : "text-rose-500 dark:text-rose-400"
              }`}
            >
              {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
            </p>
            <p className="text-[10px] font-medium text-slate-400">
              {formatTime(transaction.createdAt)}
            </p>
          </div>

          {onDelete && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-slate-400 active:text-rose-500 active:bg-rose-500/20 transition-all p-2 rounded-xl border border-[#d6dce5] dark:border-[#123c73]"
              title="Delete transaction"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
            </button>
          )}
        </div>
      </motion.div>

      {onDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            onDelete(transaction.id);
          }}
        />
      )}
    </>
  );
}

export function RecentTransactionsGrouped() {
  const { transactions, deleteTransaction, selectedHomeDate } = useAppStore();

  // Filter transactions for the selected home date only
  const activeDayTransactions = React.useMemo(() => {
    const targetDate = selectedHomeDate || getLocalDateString();
    return transactions
      .filter((tx) => (tx.date || getLocalDateString()) === targetDate)
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [transactions, selectedHomeDate]);

  // Compute date header label matching exact requirement:
  // "Today" for current date, "Yesterday" for 1 day prior, "6 Aug 2026", etc.
  const dateHeadingLabel = React.useMemo(() => {
    const targetDate = selectedHomeDate || getLocalDateString();
    if (isToday(targetDate)) return "Today";
    if (isYesterday(targetDate)) return "Yesterday";
    return formatDate(targetDate);
  }, [selectedHomeDate]);

  return (
    <div className="mx-5 space-y-3">
      {/* Date Heading Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#071b3a]/70 dark:text-slate-300">
          {dateHeadingLabel}
        </h3>
        <span className="text-[10px] font-bold text-slate-400">
          {activeDayTransactions.length} {activeDayTransactions.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Transaction List or Empty State */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedHomeDate}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          {activeDayTransactions.length === 0 ? (
            <div className="p-8 text-center bg-[#ffffff]/90 dark:bg-[#071b3a]/90 rounded-3xl border border-[#d6dce5] dark:border-[#123c73]">
              <p className="text-[#071b3a]/60 dark:text-slate-400 text-xs font-medium">
                No transactions recorded for this day.
              </p>
            </div>
          ) : (
            activeDayTransactions.map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} onDelete={deleteTransaction} />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
