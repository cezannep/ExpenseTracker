"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { Download, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PWAInstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hide prompt immediately whenever user navigates away from Home screen ("/")
  useEffect(() => {
    if (pathname !== "/") {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
      setShowPrompt(false);
    }
  }, [pathname]);

  useEffect(() => {
    // 1. Standalone / Installed Check
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      return;
    }

    // 2. Session Dismissal Check
    const sessionDismissed = sessionStorage.getItem("pwa_prompt_dismissed");
    if (sessionDismissed === "true") {
      return;
    }

    // 3. Listen for install eligibility
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Only show if user is currently on the Home screen ("/")
      if (window.location.pathname === "/") {
        setShowPrompt(true);

        // Auto-dismiss prompt after 3 seconds if un-interacted
        if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
        autoDismissTimerRef.current = setTimeout(() => {
          setShowPrompt(false);
        }, 2000);
      }
    };

    const appInstalledHandler = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", appInstalledHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", appInstalledHandler);
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
    };
  }, []);

  const handleDismiss = () => {
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    sessionStorage.setItem("pwa_prompt_dismissed", "true");
    setShowPrompt(false);
  };

  const handleInstallClick = async () => {
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    } else {
      sessionStorage.setItem("pwa_prompt_dismissed", "true");
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  // Do not render if not on Home screen
  if (pathname !== "/") {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="fixed bottom-24 left-4 right-4 z-40 max-w-md mx-auto bg-gradient-to-r from-[#071b3a] via-[#0b2854] to-[#071b3a] text-white rounded-2xl p-4 shadow-2xl border border-[#10d2c3]/30 backdrop-blur-xl flex items-center justify-between pointer-events-auto"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#10d2c3]/20 text-[#10d2c3] border border-[#10d2c3]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold tracking-tight">Install App</h4>
              <p className="text-[10px] text-slate-300">Add to home screen for native experience</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-[#10d2c3] text-[#071b3a] active:scale-95 font-bold text-xs shadow-md transition-all flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full text-slate-400 active:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


