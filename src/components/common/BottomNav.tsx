"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, BarChart2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Activity", href: "/transactions", icon: ArrowLeftRight },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-[#ffffff]/95 dark:bg-[#0b0e14]/95 backdrop-blur-xl border-t border-[#e2e8f0] dark:border-[#1d2633] px-3 py-2">
      <nav className="flex items-center justify-between">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-all duration-150 flex flex-col items-center justify-center active:scale-95",
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-black font-bold px-4 py-1.5 rounded-2xl shadow-sm"
                  : "text-slate-500 dark:text-[#8e9aa8] active:text-slate-900 dark:active:text-white px-3 py-1.5"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 mb-0.5",
                  isActive
                    ? "text-white dark:text-black stroke-[2.2px]"
                    : "text-slate-500 dark:text-[#8e9aa8] stroke-[1.8px]"
                )}
              />
              <span
                className={cn(
                  "text-[10px]",
                  isActive
                    ? "font-bold text-white dark:text-black"
                    : "font-medium text-slate-500 dark:text-[#8e9aa8]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
