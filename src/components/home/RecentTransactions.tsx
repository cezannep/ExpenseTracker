"use client";

import React from "react";
import { Transaction } from "@/types";
import { formatRelativeOrDate, formatTime, getLocalDateString } from "@/lib/utils";
import { formatPaiseToINR } from "@/lib/money";
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
  FileText,
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
  onEdit?: (tx: Transaction) => void;
  showDate?: boolean;
}

export function TransactionCard({ transaction, onDelete, onEdit, showDate }: TransactionItemProps) {
  const openEditModal = useAppStore((state) => state.openEditModal);
  const Icon = CATEGORY_ICONS[transaction.category] || HelpCircle;
  const isIncome = transaction.type === "income";
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(transaction);
    } else {
      openEditModal(transaction);
    }
  };

  const formattedDate = formatRelativeOrDate(transaction.date);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={handleEdit}
        className="p-3 rounded-2xl bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] active:bg-slate-50 dark:active:bg-[#151c27] shadow-xs"
      >
        <div className="flex items-center">
          {/* Rounded Square Icon Box */}
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#18202a] border border-slate-200/80 dark:border-[#222d3b] flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 mr-3">
            <Icon className="w-4 h-4 stroke-[1.8]" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {transaction.category}
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#8e9aa8] leading-tight mt-0.5 line-clamp-1">
              {showDate
                ? transaction.note
                  ? `${transaction.note} • ${formattedDate}`
                  : formattedDate
                : transaction.note || formattedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p
              className={`text-sm font-bold leading-tight ${
                isIncome
                  ? "text-emerald-500 dark:text-emerald-400"
                  : "text-rose-500 dark:text-rose-400"
              }`}
            >
              {isIncome ? "+" : "-"}{formatPaiseToINR(transaction.amountPaise, transaction.amountPaise % 100 !== 0)}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-[#8e9aa8] leading-tight mt-0.5">
              {formatTime(transaction.createdAt)}
            </p>
          </div>

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              className="text-slate-400 active:text-rose-500 active:scale-90 transition-all p-1.5 ml-1"
              title="Delete"
              aria-label="Delete transaction"
            >
              <Trash2 className="w-3.5 h-3.5" />
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
  const { transactions, deleteTransaction, openEditModal, selectedHomeDate } = useAppStore();

  const targetDate = selectedHomeDate || getLocalDateString();

  const activeDayTransactions = React.useMemo(() => {
    return transactions
      .filter((tx) => (tx.date || getLocalDateString()) === targetDate)
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [transactions, targetDate]);

  const dateHeadingLabel = React.useMemo(() => {
    return formatRelativeOrDate(targetDate);
  }, [targetDate]);

  return (
    <div className="mx-5 space-y-2.5">
      {/* Header: Title on Left, Count on Right */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {dateHeadingLabel}
        </h3>
        <span className="text-xs font-medium text-slate-500 dark:text-[#8e9aa8]">
          {activeDayTransactions.length} {activeDayTransactions.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Transaction List or Clean Empty State */}
      <AnimatePresence mode="wait">
        <motion.div
          key={targetDate}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="space-y-2"
        >
          {activeDayTransactions.length === 0 ? (
            <div className="py-10 px-4 rounded-3xl bg-slate-50/70 dark:bg-[#12171f]/60 border border-slate-200/80 dark:border-[#1d2633] flex flex-col items-center justify-center text-center">
              <FileText className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2 stroke-[1.5]" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                No transactions yet
              </p>
              <p className="text-xs text-slate-500 dark:text-[#8e9aa8] mt-0.5">
                Add an income or expense to get started.
              </p>
            </div>
          ) : (
            activeDayTransactions.map((tx) => (
              <TransactionCard 
                key={tx.id} 
                transaction={tx} 
                onDelete={deleteTransaction}
                onEdit={openEditModal}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
