"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/common/Header";
import { BalanceCard } from "@/components/home/BalanceCard";
import { DailyLimitCard } from "@/components/home/DailyLimitCard";
import { QuickActions } from "@/components/home/QuickActions";
import { RecentTransactionsGrouped } from "@/components/home/RecentTransactions";
import { useAppStore } from "@/stores/useAppStore";
import { getGreeting } from "@/lib/utils";

export default function HomePage() {
  const resetHomeDateToToday = useAppStore((state) => state.resetHomeDateToToday);
  const [greeting, setGreeting] = useState(() => getGreeting());

  useEffect(() => {
    resetHomeDateToToday();
    const timer = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(timer);
  }, [resetHomeDateToToday]);

  return (
    <div className="space-y-3.5 pb-6">
      <Header />

      {/* Page Title in Main Content Section */}
      <div className="px-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {greeting}
        </h1>
      </div>

      <BalanceCard />
      <DailyLimitCard />
      <QuickActions />
      <RecentTransactionsGrouped />
    </div>
  );
}
