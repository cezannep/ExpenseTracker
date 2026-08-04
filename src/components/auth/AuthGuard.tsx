"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAppStore } from "@/stores/useAppStore";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { TransactionRepository, UserRepository } from "@/repositories";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, setUser, setTransactions } = useAppStore();
  // If user is already loaded from local storage, don't show blocking spinner on refresh
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let profile = null;
        try {
          // Fetch profile from Firestore asynchronously
          profile = await UserRepository.getUserProfile(firebaseUser.uid);
        } catch (err) {
          console.warn("Firestore profile fetch error, fallback to Auth profile:", err);
        }

        if (!profile) {
          profile = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || "Personal Account",
            email: firebaseUser.email || "",
            photoURL: firebaseUser.photoURL || undefined,
            dailyLimit: 150,
            createdAt: new Date().toISOString(),
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
        // If logged out from Firebase and no local user
        if (!user) {
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
