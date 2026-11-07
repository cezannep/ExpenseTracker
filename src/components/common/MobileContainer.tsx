"use client";

import React from "react";

export function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh h-screen w-full bg-[#f8fafc] dark:bg-[#07090d] flex flex-col items-center justify-center text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* Background Subtle Ambient Glows */}
      <div className="fixed top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/5 dark:bg-slate-800/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Fixed Mobile Shell Container */}
      <div className="w-full max-w-md h-full bg-[#ffffff] dark:bg-[#0b0e14] border-x border-[#e2e8f0] dark:border-[#1d2633] shadow-2xl relative flex flex-col overflow-hidden">
        {/* Independent Inner Scroll Area */}
        <main className="flex-1 overflow-y-auto pt-16 pb-24 scrollbar-none">
          {children}
        </main>
      </div>
    </div>
  );
}
