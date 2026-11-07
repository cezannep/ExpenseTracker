"use client";

import React, { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { ExpenseCategory, IncomeSource, TransactionType, Transaction } from "@/types";
import { paiseToRupees, rupeesToPaise } from "@/lib/money";
import { getLocalDateString } from "@/lib/date";
import { transactionFormSchema } from "@/schemas";
import { X, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Travel",
  "Shopping",
  "Medical",
  "Entertainment",
  "Bills",
  "Education",
  "Home",
  "Others",
];

const INCOME_SOURCES: IncomeSource[] = [
  "Salary",
  "Cash",
  "Gift",
  "Bank Transfer",
  "Other",
];

interface FormContentProps {
  initialType: TransactionType;
  editingTransaction: Transaction | null;
  initialDate: string;
  initialNote?: string;
  onClose: () => void;
}

function TransactionFormContent({ initialType, editingTransaction, initialDate, initialNote, onClose }: FormContentProps) {
  const isEditing = Boolean(editingTransaction);
  const { addTransaction, updateTransaction } = useAppStore();

  const [type, setType] = useState<TransactionType>(
    editingTransaction ? editingTransaction.type : initialType
  );
  const [amount, setAmount] = useState<string>(
    editingTransaction ? paiseToRupees(editingTransaction.amountPaise).toString() : ""
  );
  const [category, setCategory] = useState<string>(
    editingTransaction
      ? editingTransaction.category
      : initialType === "income"
      ? "Salary"
      : "Food"
  );
  const [note, setNote] = useState<string>(
    editingTransaction?.note || initialNote || ""
  );
  const [date, setDate] = useState<string>(
    editingTransaction?.date || initialDate || getLocalDateString()
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedAmount = parseFloat(amount);
    const validationResult = transactionFormSchema.safeParse({
      amount: parsedAmount,
      type,
      category,
      note: note.trim() || undefined,
      date,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message || "Invalid transaction input";
      setFormError(firstError);
      return;
    }

    const amountPaise = rupeesToPaise(parsedAmount);

    setIsSubmitting(true);
    try {
      if (isEditing && editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          type,
          amountPaise,
          category,
          note: note.trim() || undefined,
          date,
        });
      } else {
        await addTransaction({
          type,
          amountPaise,
          category,
          note: note.trim() || undefined,
          date,
        });
      }
      onClose();
    } catch (err: unknown) {
      console.error("Error submitting transaction:", err);
      setFormError(err instanceof Error ? err.message : "Failed to save transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Sheet Handle */}
      <div className="w-12 h-1.5 bg-[#d6dce5] dark:bg-[#123c73] rounded-full mx-auto mb-5 opacity-80" />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-[#071b3a] dark:text-white tracking-tight">
          {isEditing ? "Edit Transaction" : type === "expense" ? "Add Expense" : "Add Income"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full text-slate-400 active:text-[#071b3a] dark:active:text-slate-200 active:bg-slate-100 dark:active:bg-[#0b2854] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {formError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
          {formError}
        </div>
      )}

      {/* Type Selector Tabs */}
      <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-[#18202a] rounded-2xl mb-5 border border-slate-200 dark:border-[#222d3b]">
        <button
          type="button"
          onClick={() => {
            setType("expense");
            if (!isEditing) setCategory("Food");
          }}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            type === "expense"
              ? "bg-slate-900 text-rose-400 dark:bg-white dark:text-rose-500 shadow-sm"
              : "text-slate-500 dark:text-[#8e9aa8]"
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => {
            setType("income");
            if (!isEditing) setCategory("Salary");
          }}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            type === "income"
              ? "bg-slate-900 text-emerald-400 dark:bg-white dark:text-emerald-500 shadow-sm"
              : "text-slate-500 dark:text-[#8e9aa8]"
          }`}
        >
          Income
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-[#8e9aa8] mb-1 tracking-wide uppercase">
            Amount (₹)
          </label>
          <input
            type="number"
            step="any"
            placeholder="0.00"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-3xl font-extrabold px-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#18202a] border border-slate-200 dark:border-[#222d3b] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all"
          />
        </div>

        {/* Category Options */}
        <div className="w-full min-w-0">
          <label className="block text-xs font-bold text-slate-500 dark:text-[#8e9aa8] mb-2 tracking-wide uppercase">
            Category
          </label>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-nowrap pb-1 pt-0.5 overscroll-x-contain touch-pan-x w-full">
            {(type === "expense" ? EXPENSE_CATEGORIES : INCOME_SOURCES).map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap active:scale-95 ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs font-bold"
                      : "bg-slate-50 dark:bg-[#18202a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#222d3b] hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {cat}
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Note Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-[#8e9aa8] mb-1 tracking-wide uppercase">
              Date
            </label>
            <input
              type="date"
              max={getLocalDateString()}
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#18202a] border border-slate-200 dark:border-[#222d3b] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-[#8e9aa8] mb-1 tracking-wide uppercase">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="Lunch, taxi, etc."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#18202a] border border-slate-200 dark:border-[#222d3b] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Save / Update Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 mt-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isEditing ? "Updating..." : "Saving..."}</span>
            </>
          ) : (
            <span>{isEditing ? "Update Transaction" : "Save Transaction"}</span>
          )}
        </button>
      </form>
    </div>
  );
}

export function AddTransactionSheet() {
  const { isAddModalOpen, closeAddModal, activeAddType, editingTransaction, prefilledDate, prefilledNote, selectedHomeDate } = useAppStore();

  const initialDate = editingTransaction?.date || prefilledDate || selectedHomeDate || getLocalDateString();
  const initialNote = editingTransaction?.note || prefilledNote || "";
  const formKey = isAddModalOpen 
    ? `${editingTransaction?.id || 'new'}-${activeAddType}-${initialDate}-${initialNote}` 
    : 'closed';

  return (
    <AnimatePresence>
      {isAddModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAddModal}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 max-w-md mx-auto"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white dark:bg-[#12171f] backdrop-blur-2xl rounded-t-[2rem] border-t border-slate-200 dark:border-[#1d2633] p-6 pb-28 shadow-2xl overflow-y-auto overflow-x-hidden max-h-[90vh]"
          >
            <TransactionFormContent
              key={formKey}
              initialType={activeAddType}
              editingTransaction={editingTransaction}
              initialDate={initialDate}
              initialNote={initialNote}
              onClose={closeAddModal}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
