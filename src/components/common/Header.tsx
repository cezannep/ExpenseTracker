"use client";

import React from "react";
import { getGreeting, formatDate } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { User, Sun, Moon } from "lucide-react";

export function Header() {
  const { user, isDarkMode, toggleDarkMode } = useAppStore();
  const greeting = getGreeting();
  const currentDate = formatDate(new Date().toISOString());

  return (
    <header className="px-5 pt-5 pb-3 flex items-center justify-between bg-slate-50/95 dark:bg-[#0b0f19]/95 backdrop-blur-2xl fixed top-0 left-0 right-0 max-w-md mx-auto z-40 border-b border-slate-200/60 dark:border-slate-800/60 shadow-xs">
      <div>
        <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
          {currentDate}
        </p>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {greeting}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2.5">
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-full bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-300/80 dark:hover:bg-slate-700/80 transition-all active:scale-95 shadow-sm border border-slate-300/40 dark:border-slate-700/50"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 p-[2px] shadow-md shadow-indigo-500/10">
          <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

