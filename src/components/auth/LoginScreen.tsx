"use client";

import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAppStore } from "@/stores/useAppStore";
import { Wallet, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function LoginScreen() {
  const { setUser } = useAppStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsSigningIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setUser({
        uid: user.uid,
        name: user.displayName || "Personal Account",
        email: user.email || "",
        photoURL: user.photoURL || undefined,
        dailyLimit: 150,
        createdAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      setErrorMsg(error.message || "Failed to sign in with Google. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#070a11]/70 flex flex-col justify-between p-6 text-white relative overflow-hidden shadow-2xl border-x border-slate-800/80">
      {/* Ambient Glow Effects */}
      <div className="absolute top-10 left-10 w-56 h-56 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-56 h-56 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />


      {/* Hero Title & Description */}
      <div className="mt-[80%]">
        <div className="">
          <h1 className="text-4xl font-black tracking-tight text-white leading-tight">
            Smart, Simple <br />
            <span className="text-white/40">
              Expense Tracking
            </span>
          </h1>
          <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-xs mt-3">
            Track daily budgets, monitor expenses, and analyze spending patterns with mobile-first simplicity.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pb-8">
        {errorMsg && (
          <p className="text-xs text-rose-400 text-center font-medium bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
            {errorMsg}
          </p>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={isSigningIn}
          onClick={handleGoogleSignIn}
          className="w-full py-4 rounded-2xl bg-white text-slate-900 font-bold text-sm flex items-center justify-center space-x-3 shadow-xl shadow-white/5 hover:bg-slate-100 transition-all active:bg-slate-200 cursor-pointer disabled:opacity-70"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.2.01 10.04.01 12c0 1.96.46 3.8 1.28 5.42l3.99-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.94 1.19 15.23 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{isSigningIn ? "Connecting to Google..." : "Sign In with Google"}</span>
        </motion.button>
      </div>
    </div>
  );
}
