"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Activity", href: "/transactions", icon: ArrowLeftRight },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto px-4 pb-3 pt-2 pointer-events-none bg-gradient-to-t from-slate-50 dark:from-[#0b0f19] via-slate-50/80 dark:via-[#0b0f19]/80 to-transparent">
      <nav className="pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-full px-3 py-2 shadow-2xl shadow-slate-900/20 dark:shadow-slate-950/60">
        <div className="flex items-center justify-around relative">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-[10px] font-semibold transition-all duration-200",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-indigo-50 dark:bg-indigo-950/60 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-4 h-4 mb-0.5 transition-transform", isActive ? "scale-110 stroke-[2.5px]" : "stroke-[1.8px]")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

