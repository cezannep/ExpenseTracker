"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatDate, getLocalDateString } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { Sun, Moon, Check, CloudOff, RefreshCw } from "lucide-react";

export function Header() {
  const { user, isDarkMode, toggleDarkMode, isOnline, setIsOnline, isSyncing, syncPendingQueue, transactions } = useAppStore();

  const [currentDateStr, setCurrentDateStr] = useState(() => getLocalDateString());

  const pendingCount = transactions.filter((t) => t.syncStatus === "pending").length;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const handleFocus = () => {
      const freshDate = getLocalDateString();
      if (freshDate !== currentDateStr) {
        setCurrentDateStr(freshDate);
      }
    };
    window.addEventListener("visibilitychange", handleFocus);
    window.addEventListener("focus", handleFocus);

    const interval = setInterval(handleFocus, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [currentDateStr, setIsOnline, syncPendingQueue]);

  const currentDateFormatted = formatDate(currentDateStr);
  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "D";

  return (
    <header className="px-5 py-2.5 bg-[#ffffff]/95 dark:bg-[#0b0e14]/95 backdrop-blur-xl fixed top-0 left-0 right-0 max-w-md mx-auto z-40 border-b border-[#e2e8f0]/40 dark:border-[#1d2633]/60 flex items-center justify-between">
      {/* Left: Date + Sync Status */}
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
          {currentDateFormatted}
        </span>

        {!isOnline ? (
          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30">
            <CloudOff className="w-3 h-3" /> Offline
          </span>
        ) : isSyncing ? (
          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <RefreshCw className="w-3 h-3 animate-spin" /> Syncing
          </span>
        ) : pendingCount > 0 ? (
          <button
            onClick={() => syncPendingQueue()}
            className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 active:scale-95"
            title="Click to retry sync"
          >
            <RefreshCw className="w-3 h-3" /> {pendingCount} Pending
          </button>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Check className="w-3 h-3 stroke-[2.5]" /> Synced
          </span>
        )}
      </div>

      {/* Right: Theme Toggle + Profile Avatar */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleDarkMode}
          className="p-1 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors active:scale-95"
          aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-slate-300 hover:text-amber-300 transition-colors" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-[#18202a] border border-slate-300 dark:border-[#222d3b] flex items-center justify-center text-slate-800 dark:text-white text-xs font-bold overflow-hidden relative shadow-xs">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.name || "User Avatar"}
              fill
              sizes="28px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span>{userInitial}</span>
          )}
        </div>
      </div>
    </header>
  );
}
