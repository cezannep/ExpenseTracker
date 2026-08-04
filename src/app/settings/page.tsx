"use client";

import React, { useState } from "react";
import { Header } from "@/components/common/Header";
import { useAppStore } from "@/stores/useAppStore";
import { exportTransactionsToCSV } from "@/lib/export-csv";
import { formatCurrency } from "@/lib/utils";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { 
  User, 
  Target, 
  Download, 
  Moon, 
  Sun, 
  Info, 
  Check, 
  Edit3,
  Smartphone,
  LogOut
} from "lucide-react";

export default function SettingsPage() {
  const { user, setUser, updateDailyLimit, updateMonthlyBudget, transactions, isDarkMode, toggleDarkMode } = useAppStore();
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [newLimit, setNewLimit] = useState(user?.dailyLimit ? user.dailyLimit.toString() : "150");

  const [isEditingMonthly, setIsEditingMonthly] = useState(false);
  const [newMonthlyBudget, setNewMonthlyBudget] = useState(user?.monthlyBudget ? user.monthlyBudget.toString() : "4500");

  const handleSaveLimit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newLimit);
    if (!isNaN(val) && val >= 10) {
      updateDailyLimit(val);
      setIsEditingLimit(false);
    }
  };

  const handleSaveMonthly = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newMonthlyBudget);
    if (!isNaN(val) && val >= 100) {
      updateMonthlyBudget(val);
      setIsEditingMonthly(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setUser(null);
  };

  return (
    <div className="space-y-4 pb-8">
      <Header />

      <div className="px-5 space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Settings
        </h2>

        {/* Profile Card */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20 overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {user?.name || "Personal Account"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || "cezan@example.com"}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Daily Spending Limit Form */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Daily Spending Limit
              </span>
            </div>
            {!isEditingLimit && (
              <button
                onClick={() => setIsEditingLimit(true)}
                className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            )}
          </div>

          {isEditingLimit ? (
            <form onSubmit={handleSaveLimit} className="flex gap-2 pt-1">
              <input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className="flex-1 px-3 py-2 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter limit"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Save
              </button>
            </form>
          ) : (
            <p className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {formatCurrency(user?.dailyLimit || 150)}
            </p>
          )}
        </div>

        {/* Monthly Budget Target Form */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Monthly Target Budget
              </span>
            </div>
            {!isEditingMonthly && (
              <button
                onClick={() => setIsEditingMonthly(true)}
                className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            )}
          </div>

          {isEditingMonthly ? (
            <form onSubmit={handleSaveMonthly} className="flex gap-2 pt-1">
              <input
                type="number"
                value={newMonthlyBudget}
                onChange={(e) => setNewMonthlyBudget(e.target.value)}
                className="flex-1 px-3 py-2 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter monthly target"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Save
              </button>
            </form>
          ) : (
            <p className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {formatCurrency(user?.monthlyBudget || 4500)}
            </p>
          )}
        </div>

        {/* Preferences Section */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Preferences & Data
          </h4>

          {/* Export CSV */}
          <button
            onClick={() => exportTransactionsToCSV(transactions)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <Download className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Export Transactions CSV</p>
                <p className="text-[10px] text-slate-400">Download complete financial log</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">.CSV</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Dark Mode</p>
                <p className="text-[10px] text-slate-400">Switch theme appearance</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">{isDarkMode ? "On" : "Off"}</span>
          </button>
        </div>

        {/* PWA & System Information */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <Info className="w-4 h-4 text-blue-600" /> Application Details
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">App Name</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">Personal Expense Tracker PWA</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Version</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">1.0.0 (PWA Ready)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Framework</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">Next.js 16 (App Router)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
