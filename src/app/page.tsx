"use client";

import React from "react";
import { Header } from "@/components/common/Header";
import { BalanceCard } from "@/components/home/BalanceCard";
import { DailyLimitCard } from "@/components/home/DailyLimitCard";
import { QuickActions } from "@/components/home/QuickActions";
import { RecentTransactionsGrouped } from "@/components/home/RecentTransactions";

export default function HomePage() {
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
