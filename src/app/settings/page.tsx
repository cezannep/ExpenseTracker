"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Header } from "@/components/common/Header";
import { useAppStore } from "@/stores/useAppStore";
import { exportTransactionsToCSV } from "@/lib/export-csv";
import { formatPaiseToINR, paiseToRupees, rupeesToPaise } from "@/lib/money";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { 
  Target, 
  Calendar, 
  Download, 
  Moon, 
  Info, 
  Code, 
  Layers, 
  ChevronRight,
  LogOut,
  X
} from "lucide-react";

export default function SettingsPage() {
  const { user, setUser, updateDailyLimit, updateMonthlyBudget, transactions, isDarkMode, toggleDarkMode } = useAppStore();

  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [newLimitRupees, setNewLimitRupees] = useState(() =>
    user?.dailyLimitPaise ? paiseToRupees(user.dailyLimitPaise).toString() : "150"
  );

  const [isEditingMonthly, setIsEditingMonthly] = useState(false);
  const [newMonthlyBudgetRupees, setNewMonthlyBudgetRupees] = useState(() =>
    user?.monthlyBudgetPaise ? paiseToRupees(user.monthlyBudgetPaise).toString() : "4500"
  );

  const [showSignOutPrompt, setShowSignOutPrompt] = useState(false);

  const handleSaveLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newLimitRupees);
    if (!isNaN(val) && val >= 10) {
      await updateDailyLimit(rupeesToPaise(val));
      setIsEditingLimit(false);
    }
  };

  const handleSaveMonthly = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newMonthlyBudgetRupees);
    if (!isNaN(val) && val >= 100) {
      await updateMonthlyBudget(rupeesToPaise(val));
      setIsEditingMonthly(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign out error:", e);
    }
    setUser(null);
  };

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "D";

  return (
    <div className="space-y-3.5 pb-8">
      <Header />

      {/* Page Title in Main Content Section */}
      <div className="px-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>
      </div>

      <div className="px-5 space-y-3">
        {/* Profile Card */}
        <div
          onClick={() => setShowSignOutPrompt(true)}
          className="rounded-2xl bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] p-3.5 flex items-center justify-between cursor-pointer active:bg-slate-50 dark:active:bg-[#151c27] active:scale-[0.99] transition-all shadow-xs"
        >
          <div className="flex items-center">
            {/* Avatar Circle */}
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#18202a] border border-slate-200 dark:border-[#222d3b] text-slate-800 dark:text-white font-bold text-sm flex items-center justify-center shrink-0 mr-3 overflow-hidden relative">
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.name || "User Avatar"}
                  fill
                  sizes="40px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {user?.name || "Devu Devu"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#8e9aa8] leading-tight mt-0.5">
                {user?.email || "sunuhacker@gmail.com"}
              </p>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Budget Settings Section */}
        <div className="space-y-2.5">
          {/* Daily Spending Limit Item */}
          <div
            onClick={() => {
              setNewLimitRupees(
                user?.dailyLimitPaise ? paiseToRupees(user.dailyLimitPaise).toString() : "150"
              );
              setIsEditingLimit(true);
            }}
            className="rounded-2xl bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] p-3.5 flex items-center justify-between cursor-pointer active:bg-slate-50 dark:active:bg-[#151c27] active:scale-[0.99] transition-all shadow-xs"
          >
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#18202a] border border-slate-200/80 dark:border-[#222d3b] flex items-center justify-center text-slate-700 dark:text-slate-300 mr-3 shrink-0">
                <Target className="w-4 h-4 stroke-[2]" />
              </div>

              <div>
                <span className="text-xs text-slate-500 dark:text-[#8e9aa8] font-medium block leading-tight">
                  Daily Spending Limit
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white block leading-tight mt-0.5">
                  {formatPaiseToINR(user?.dailyLimitPaise || 15000)}
                </span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Monthly Target Budget Item */}
          <div
            onClick={() => {
              setNewMonthlyBudgetRupees(
                user?.monthlyBudgetPaise ? paiseToRupees(user.monthlyBudgetPaise).toString() : "4500"
              );
              setIsEditingMonthly(true);
            }}
            className="rounded-2xl bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] p-3.5 flex items-center justify-between cursor-pointer active:bg-slate-50 dark:active:bg-[#151c27] active:scale-[0.99] transition-all shadow-xs"
          >
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#18202a] border border-slate-200/80 dark:border-[#222d3b] flex items-center justify-center text-slate-700 dark:text-slate-300 mr-3 shrink-0">
                <Calendar className="w-4 h-4 stroke-[2]" />
              </div>

              <div>
                <span className="text-xs text-slate-500 dark:text-[#8e9aa8] font-medium block leading-tight">
                  Monthly Target Budget
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white block leading-tight mt-0.5">
                  {formatPaiseToINR(user?.monthlyBudgetPaise || 450000)}
                </span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Preferences & Data Section */}
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
            Preferences & Data
          </h4>

          {/* Export Transactions CSV */}
          <div
            onClick={() => exportTransactionsToCSV(transactions)}
            className="rounded-2xl bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] p-3.5 flex items-center justify-between cursor-pointer active:bg-slate-50 dark:active:bg-[#151c27] active:scale-[0.99] transition-all shadow-xs"
          >
            <div className="flex items-center">
              <Download className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block leading-tight">
                  Export Transactions CSV
                </span>
                <span className="text-[11px] text-slate-500 dark:text-[#8e9aa8] block leading-tight mt-0.5">
                  Download complete financial log
                </span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Dark Mode Toggle */}
          <div
            onClick={toggleDarkMode}
            className="rounded-2xl bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] p-3.5 flex items-center justify-between cursor-pointer active:bg-slate-50 dark:active:bg-[#151c27] active:scale-[0.99] transition-all shadow-xs"
          >
            <div className="flex items-center">
              <Moon className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block leading-tight">
                  Dark Mode
                </span>
                <span className="text-[11px] text-slate-500 dark:text-[#8e9aa8] block leading-tight mt-0.5">
                  Switch theme appearance
                </span>
              </div>
            </div>

            {/* iOS Style Emerald Switch Toggle */}
            <div
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                isDarkMode ? "bg-emerald-500" : "bg-slate-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  isDarkMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Application Details Section */}
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
            Application Details
          </h4>

          <div className="rounded-2xl bg-white dark:bg-[#12171f] border border-slate-200/80 dark:border-[#1d2633] p-3.5 divide-y divide-slate-100 dark:divide-[#1d2633] shadow-xs">
            <div className="flex items-center justify-between py-2 first:pt-0">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" /> App Name
              </span>
              <span className="text-xs text-slate-500 dark:text-[#8e9aa8] font-medium">
                Personal Expense Tracker PWA
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Code className="w-4 h-4 text-slate-400" /> Version
              </span>
              <span className="text-xs text-slate-500 dark:text-[#8e9aa8] font-medium">
                2.0.0 (PWA Ready)
              </span>
            </div>

            <div className="flex items-center justify-between py-2 last:pb-0">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" /> Framework
              </span>
              <span className="text-xs text-slate-500 dark:text-[#8e9aa8] font-medium">
                Next.js 16 (App Router)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Limit Edit Modal */}
      {isEditingLimit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-5">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#12171f] border border-slate-200 dark:border-[#1d2633] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Daily Spending Limit
              </h3>
              <button
                onClick={() => setIsEditingLimit(false)}
                className="p-1 rounded-full text-slate-400 active:text-slate-600 dark:active:text-white active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLimit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-[#8e9aa8] block mb-1.5">
                  Amount in ₹
                </label>
                <input
                  type="number"
                  min="10"
                  step="1"
                  value={newLimitRupees}
                  onChange={(e) => setNewLimitRupees(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#18202a] border border-slate-200 dark:border-[#222d3b] text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  placeholder="e.g. 150"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingLimit(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#18202a] text-slate-700 dark:text-slate-300 font-bold text-xs active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black font-bold text-xs shadow-sm active:scale-[0.98] transition-all"
                >
                  Save Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Monthly Budget Edit Modal */}
      {isEditingMonthly && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-5">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#12171f] border border-slate-200 dark:border-[#1d2633] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Monthly Target Budget
              </h3>
              <button
                onClick={() => setIsEditingMonthly(false)}
                className="p-1 rounded-full text-slate-400 active:text-slate-600 dark:active:text-white active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMonthly} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-[#8e9aa8] block mb-1.5">
                  Amount in ₹
                </label>
                <input
                  type="number"
                  min="100"
                  step="1"
                  value={newMonthlyBudgetRupees}
                  onChange={(e) => setNewMonthlyBudgetRupees(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#18202a] border border-slate-200 dark:border-[#222d3b] text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  placeholder="e.g. 4500"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingMonthly(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#18202a] text-slate-700 dark:text-slate-300 font-bold text-xs active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black font-bold text-xs shadow-sm active:scale-[0.98] transition-all"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOutPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-5">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#12171f] border border-slate-200 dark:border-[#1d2633] p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-500">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Sign Out
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8e9aa8] mt-0.5">
                  Are you sure you want to sign out of your account?
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutPrompt(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#18202a] text-slate-700 dark:text-slate-300 font-bold text-xs active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSignOutPrompt(false);
                  handleSignOut();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-sm active:bg-rose-600 active:scale-[0.98] transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
