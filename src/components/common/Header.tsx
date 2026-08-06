"use client";

import React, { useState, useEffect } from "react";
import { getGreeting, formatDate, getLocalDateString } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { User, Sun, Moon } from "lucide-react";

export function Header() {
  const { user, isDarkMode, toggleDarkMode } = useAppStore();

  // Reactive state for current date and greeting that ticks automatically when date changes
  const [currentDateStr, setCurrentDateStr] = useState(() => getLocalDateString());
  const [greeting, setGreeting] = useState(() => getGreeting());

  useEffect(() => {
    // Tick timer to check date change across midnight (or hourly for greeting update)
    const interval = setInterval(() => {
      const freshDateStr = getLocalDateString();
      if (freshDateStr !== currentDateStr) {
        setCurrentDateStr(freshDateStr);
      }
      const freshGreeting = getGreeting();
      if (freshGreeting !== greeting) {
        setGreeting(freshGreeting);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [currentDateStr, greeting]);

  const currentDateFormatted = formatDate(currentDateStr);

  return (
    <header className="px-5 pt-5 pb-3 flex items-center justify-between bg-[#f8fafc]/95 dark:bg-[#071b3a]/95 backdrop-blur-2xl fixed top-0 left-0 right-0 max-w-md mx-auto z-40 border-b border-[#d6dce5] dark:border-[#123c73] shadow-xs">
      <div>
        <p className="text-[11px] font-bold text-[#10d2c3] tracking-wider uppercase">
          {currentDateFormatted}
        </p>
        <h1 className="text-xl font-extrabold text-[#071b3a] dark:text-white tracking-tight">
          {greeting}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2.5">
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-full bg-[#f8fafc] dark:bg-[#0b2854] text-[#071b3a] dark:text-slate-200 active:bg-slate-200 dark:active:bg-[#123c73] transition-all active:scale-95 shadow-sm border border-[#d6dce5] dark:border-[#123c73]"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#071b3a]" />}
        </button>

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10d2c3] to-[#123c73] p-[2px] shadow-md shadow-[#10d2c3]/20">
          <div className="w-full h-full rounded-full bg-[#ffffff] dark:bg-[#031023] flex items-center justify-center text-[#10d2c3] font-bold overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-[#10d2c3]" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
