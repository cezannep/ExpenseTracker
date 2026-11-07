"use client";

import React from "react";
import { formatPaiseToINR } from "@/lib/money";
import { useAppStore } from "@/stores/useAppStore";
import { Clock, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

export function BalanceCard() {
  const { getBalancePaise, getTotalIncomePaise, getTotalExpensePaise } = useAppStore();

  const balancePaise = getBalancePaise();
  const incomePaise = getTotalIncomePaise();
  const expensePaise = getTotalExpensePaise();

  // If negative, format with leading minus sign
  const isNegative = balancePaise < 0;
  const absBalance = Math.abs(balancePaise);
  const formattedBalance = `${isNegative ? "-" : ""}${formatPaiseToINR(absBalance, absBalance % 100 !== 0)}`;

  return (
    <div className="mx-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl bg-[#ffffff] dark:bg-[#12171f] border border-[#e2e8f0] dark:border-[#1d2633] p-5 shadow-sm relative overflow-hidden"
      >
        {/* Top Header Row: Current Balance with clock on left, Wallet on right */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300 stroke-[2]" />
            <span className="text-xs font-semibold tracking-tight">Current Balance</span>
          </div>

          <Wallet className="w-5 h-5 text-slate-400 dark:text-slate-400 stroke-[1.8]" />
        </div>

        {/* Balance Display & Glowing Spline Wave Graphic */}
        <div className="relative my-3 flex items-center justify-between">
          <div className="z-10">
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {formattedBalance}
            </p>
          </div>

          {/* Smooth Green Glowing Wave Curve on the right */}
          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-36 h-12 pointer-events-none opacity-90">
            <svg viewBox="0 0 160 50" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="balanceGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10D294" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10D294" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,38 C35,38 45,22 75,25 C105,28 125,8 160,12 L160,50 L0,50 Z"
                fill="url(#balanceGlow)"
              />
              <path
                d="M0,38 C35,38 45,22 75,25 C105,28 125,8 160,12"
                fill="none"
                stroke="#10D294"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Bottom Sub-Boxes: Income on Left, Expense on Right */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-1">
          {/* Income Sub-box */}
          <div className="bg-slate-50 dark:bg-[#18202a] border border-slate-200/80 dark:border-[#222d3b] rounded-2xl p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#8e9aa8] block leading-tight">
                Income
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white block tracking-tight truncate leading-tight mt-0.5">
                {formatPaiseToINR(incomePaise, incomePaise % 100 !== 0)}
              </span>
            </div>
          </div>

          {/* Expense Sub-box */}
          <div className="bg-slate-50 dark:bg-[#18202a] border border-slate-200/80 dark:border-[#222d3b] rounded-2xl p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-500 dark:text-rose-400 shrink-0">
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#8e9aa8] block leading-tight">
                Expense
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white block tracking-tight truncate leading-tight mt-0.5">
                {formatPaiseToINR(expensePaise, expensePaise % 100 !== 0)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
