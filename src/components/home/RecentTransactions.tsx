"use client";

import React from "react";
import { Transaction } from "@/types";
import { formatCurrency, formatTime, isToday, isYesterday } from "@/lib/utils";
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
import { motion } from "framer-motion";

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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm flex items-center justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
    >
      <div className="flex items-center space-x-3.5">
        <div
          className={`p-2.5 rounded-2xl flex items-center justify-center border ${
            isIncome
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/20"
          }`}
        >
          <Icon className="w-4 h-4 stroke-[2.2]" />
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            {transaction.category}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[150px]">
            {transaction.note || transaction.date}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p
            className={`text-sm font-extrabold tracking-tight ${
              isIncome ? "text-emerald-500" : "text-rose-500 dark:text-rose-400"
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
            onClick={() => onDelete(transaction.id)}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity p-1.5 rounded-lg hover:bg-rose-500/10"
            title="Delete transaction"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function RecentTransactionsGrouped() {
  const { transactions, deleteTransaction } = useAppStore();

  const grouped = React.useMemo(() => {
    const groups: { label: string; items: Transaction[] }[] = [];
    const todayItems: Transaction[] = [];
    const yesterdayItems: Transaction[] = [];
    const olderItems: Transaction[] = [];

    transactions.forEach((tx: Transaction) => {
      if (isToday(tx.date)) {
        todayItems.push(tx);
      } else if (isYesterday(tx.date)) {
        yesterdayItems.push(tx);
      } else {
        olderItems.push(tx);
      }
    });

    if (todayItems.length) groups.push({ label: "Today", items: todayItems });
    if (yesterdayItems.length) groups.push({ label: "Yesterday", items: yesterdayItems });
    if (olderItems.length) groups.push({ label: "Earlier", items: olderItems });

    return groups;
  }, [transactions]);

  if (!transactions.length) {
    return (
      <div className="mx-5 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800">
        <p className="text-slate-500 text-sm font-medium">No transactions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-5 space-y-4">
      {grouped.map((group) => (
        <div key={group.label} className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            {group.label}
          </h3>
          <div className="space-y-2">
            {group.items.map((tx: Transaction) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onDelete={(id) => deleteTransaction(id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
