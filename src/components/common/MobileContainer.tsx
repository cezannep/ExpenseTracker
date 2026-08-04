"use client";

import React from "react";

export function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh h-screen w-full bg-slate-100 dark:bg-[#070a11] flex flex-col items-center justify-center text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden selection:bg-indigo-500/20 selection:text-indigo-500">
      {/* Background Ambient Glowing Orbs */}
      <div className="fixed top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Fixed Mobile Frame Shell */}
      <div className="w-full max-w-md h-full bg-slate-50/90 dark:bg-[#0b0f19]/90 backdrop-blur-3xl border-x border-slate-200/80 dark:border-slate-800/60 shadow-2xl relative flex flex-col overflow-hidden">
        {/* Independent Inner Scroll Area */}
        <main className="flex-1 overflow-y-auto pt-24 pb-28 scrollbar-none">
          {children}
        </main>
      </div>
    </div>
  );
}

