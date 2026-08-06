"use client";

import React from "react";

export function MobileContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh h-screen w-full bg-[#f8fafc] dark:bg-[#031023] flex flex-col items-center justify-center text-[#071b3a] dark:text-slate-100 transition-colors duration-300 relative overflow-hidden selection:bg-[#10d2c3]/20 selection:text-[#10d2c3]">
      {/* Background Ambient Glowing Orbs */}
      <div className="fixed top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#10d2c3]/10 dark:bg-[#10d2c3]/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#123c73]/10 dark:bg-[#123c73]/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Fixed Mobile Frame Shell */}
      <div className="w-full max-w-md h-full bg-[#ffffff]/95 dark:bg-[#071b3a]/95 backdrop-blur-3xl border-x border-[#d6dce5] dark:border-[#123c73] shadow-2xl relative flex flex-col overflow-hidden">
        {/* Independent Inner Scroll Area */}
        <main className="flex-1 overflow-y-auto pt-24 pb-28 scrollbar-none">
          {children}
        </main>
      </div>
    </div>
  );
}

