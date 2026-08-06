"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/common/Header";
import { BalanceCard } from "@/components/home/BalanceCard";
import { DailyLimitCard } from "@/components/home/DailyLimitCard";
import { QuickActions } from "@/components/home/QuickActions";
import { RecentTransactionsGrouped } from "@/components/home/RecentTransactions";
import { useAppStore } from "@/stores/useAppStore";

export default function HomePage() {
  const resetHomeDateToToday = useAppStore((state) => state.resetHomeDateToToday);

  // Automatically reset selected date to Today whenever user lands or returns to Home Screen
  useEffect(() => {
    resetHomeDateToToday();
  }, [resetHomeDateToToday]);

  return (
    <div className="space-y-5 pb-6">
      <Header />
      <BalanceCard />
      <DailyLimitCard />
      <QuickActions />
      
      <div className="pt-2">
        <RecentTransactionsGrouped />
      </div>
    </div>
  );
}
