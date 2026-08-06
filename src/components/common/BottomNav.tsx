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
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto px-4 pb-3 pt-2 pointer-events-none bg-gradient-to-t from-[#f8fafc] dark:from-[#031023] via-[#f8fafc]/80 dark:via-[#031023]/80 to-transparent">
      <nav className="pointer-events-auto bg-[#ffffff]/95 dark:bg-[#071b3a]/95 backdrop-blur-2xl border border-[#d6dce5] dark:border-[#123c73] rounded-full px-3 py-2 shadow-2xl shadow-[#071b3a]/15">
        <div className="flex items-center justify-around relative">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-[10px] font-bold transition-all duration-200 active:scale-95",
                  isActive
                    ? "text-[#10d2c3]"
                    : "text-[#071b3a]/60 dark:text-slate-400 active:text-[#071b3a] dark:active:text-slate-200"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-[#10d2c3]/15 dark:bg-[#10d2c3]/20 rounded-full border border-[#10d2c3]/30 -z-10"
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

