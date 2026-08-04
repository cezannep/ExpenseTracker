"use client";

import React, { useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";

export function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  return <>{children}</>;
}
