"use client";

import React, { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { ExpenseCategory, IncomeSource } from "@/types";
import { X, Check } from "lucide-react";
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

export function AddTransactionSheet() {
  const { isAddModalOpen, closeAddModal, activeAddType, addTransaction, user } = useAppStore();
  const [type, setType] = useState<"expense" | "income">(activeAddType);
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("Food");
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setType(activeAddType);
    setCategory(activeAddType === "income" ? "Salary" : "Food");
  }, [activeAddType, isAddModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await addTransaction({
        userId: user?.uid || "demo-user-123",
        type,
        amount: parsedAmount,
        category: category as any,
        note: note.trim() || undefined,
        date,
      });
      setAmount("");
      setNote("");
      closeAddModal();
    } catch (err) {
      console.error("Error submitting transaction:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-[#ffffff]/98 dark:bg-[#071b3a]/98 backdrop-blur-2xl rounded-t-[2.5rem] border-t border-[#d6dce5] dark:border-[#123c73] p-6 pb-28 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              {/* Sheet Handle */}
              <div className="w-12 h-1.5 bg-[#d6dce5] dark:bg-[#123c73] rounded-full mx-auto mb-5 opacity-80" />

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-[#071b3a] dark:text-white tracking-tight">
                  {type === "expense" ? "Add Expense" : "Add Income"}
                </h2>
                <button
                  onClick={closeAddModal}
                  className="p-1.5 rounded-full text-slate-400 active:text-[#071b3a] dark:active:text-slate-200 active:bg-slate-100 dark:active:bg-[#0b2854] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Type Selector Tabs */}
              <div className="grid grid-cols-2 p-1.5 bg-[#f8fafc] dark:bg-[#0b2854] rounded-2xl mb-5 border border-[#d6dce5] dark:border-[#123c73]">
                <button
                  type="button"
                  onClick={() => {
                    setType("expense");
                    setCategory("Food");
                  }}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                    type === "expense"
                      ? "bg-[#071b3a] text-rose-400 shadow-sm"
                      : "text-[#071b3a]/60 dark:text-slate-300 active:text-[#071b3a]"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType("income");
                    setCategory("Salary");
                  }}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                    type === "income"
                      ? "bg-[#071b3a] text-[#10d2c3] shadow-sm"
                      : "text-[#071b3a]/60 dark:text-slate-300 active:text-[#071b3a]"
                  }`}
                >
                  Income
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-bold text-[#071b3a]/70 dark:text-slate-400 mb-1 tracking-wide uppercase">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-3xl font-black px-4 py-3 rounded-2xl bg-[#f8fafc] dark:bg-[#0b2854] border border-[#d6dce5] dark:border-[#123c73] text-[#071b3a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10d2c3] transition-all"
                  />
                </div>

                {/* Category Options */}
                <div>
                  <label className="block text-xs font-bold text-[#071b3a]/70 dark:text-slate-400 mb-2 tracking-wide uppercase">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1 scrollbar-none">
                    {(type === "expense" ? EXPENSE_CATEGORIES : INCOME_SOURCES).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          category === cat
                            ? "bg-[#071b3a] text-[#10d2c3] border border-[#10d2c3]/40 shadow-sm"
                            : "bg-[#f8fafc] dark:bg-[#0b2854] text-[#071b3a] dark:text-slate-300 active:bg-slate-200 dark:active:bg-[#123c73] border border-[#d6dce5] dark:border-[#123c73]"
                        }`}
                      >
                        {cat}
                        {category === cat && <Check className="w-3.5 h-3.5 text-[#10d2c3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Note Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#071b3a]/70 dark:text-slate-400 mb-1 tracking-wide uppercase">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-[#f8fafc] dark:bg-[#0b2854] border border-[#d6dce5] dark:border-[#123c73] text-[#071b3a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10d2c3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#071b3a]/70 dark:text-slate-400 mb-1 tracking-wide uppercase">
                      Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Lunch, taxi, etc."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-[#f8fafc] dark:bg-[#0b2854] border border-[#d6dce5] dark:border-[#123c73] text-[#071b3a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10d2c3]"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 mt-3 rounded-2xl bg-[#071b3a] dark:bg-[#10d2c3] dark:text-[#071b3a] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#071b3a]/30 dark:shadow-[#10d2c3]/20 active:scale-[0.98] transition-all focus:outline-none ring-2 ring-[#10d2c3]/40 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Transaction"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
}

