"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAppStore } from "@/stores/useAppStore";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { TransactionRepository, UserRepository } from "@/repositories";
import { UserProfile } from "@/types";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, setUser, setTransactions } = useAppStore();
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let profile: UserProfile | null = null;
        try {
          profile = await UserRepository.getUserProfile(firebaseUser.uid);
        } catch (err) {
          console.warn("Firestore profile fetch error, fallback to Auth profile:", err);
        }

        if (!profile) {
          const now = new Date().toISOString();
          profile = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || "Personal Account",
            email: firebaseUser.email || "",
            photoURL: firebaseUser.photoURL || undefined,
            dailyLimitPaise: 15000,
            monthlyBudgetPaise: 450000,
            timezone: "Asia/Kolkata",
            currency: "INR",
            createdAt: now,
            updatedAt: now,
          };
          try {
            await UserRepository.createOrUpdateProfile(profile);
          } catch (err) {
            console.warn("Firestore profile creation error:", err);
          }
        }

        setUser(profile);

        // Fetch live Firestore transactions in background
        try {
          const txs = await TransactionRepository.getUserTransactions(firebaseUser.uid);
          if (txs) setTransactions(txs);
        } catch (err) {
          console.warn("Firestore transactions read error (using local state fallback):", err);
        }
      } else {
        const currentUser = useAppStore.getState().user;
        if (!currentUser) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setTransactions]);

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
