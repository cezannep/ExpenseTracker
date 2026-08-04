import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Transaction, UserProfile, Category } from "../types";
import { TransactionRepository, UserRepository } from "../repositories";

interface FilterState {
  searchQuery: string;
  type: "all" | "income" | "expense";
  period: "all" | "today" | "week" | "month" | "year";
  category: Category | "all";
}

interface AppState {
  // Auth & Profile
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateDailyLimit: (limit: number) => Promise<void>;
  updateMonthlyBudget: (budget: number) => Promise<void>;

  // Transactions
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, "id">>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Filters
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Modals & UI State
  isAddModalOpen: boolean;
  activeAddType: "expense" | "income";
  openAddModal: (type?: "expense" | "income") => void;
  closeAddModal: () => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Derived Calculations
  getBalance: () => number;
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getSpentToday: () => number;
  getRemainingDailyLimit: () => number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null, // Start unauthenticated so LoginScreen displays initially
      setUser: (user) => set({ user }),

      updateDailyLimit: async (limit) => {
        const currentUser = get().user;
        set((state) => ({
          user: state.user ? { ...state.user, dailyLimit: limit } : null,
        }));
        if (currentUser?.uid) {
          try {
            await UserRepository.updateDailyLimit(currentUser.uid, limit);
          } catch (err) {
            console.error("Firestore sync error on updateDailyLimit:", err);
          }
        }
      },

      updateMonthlyBudget: async (budget) => {
        const currentUser = get().user;
        set((state) => ({
          user: state.user ? { ...state.user, monthlyBudget: budget } : null,
        }));
        if (currentUser?.uid) {
          try {
            await UserRepository.updateMonthlyBudget(currentUser.uid, budget);
          } catch (err) {
            console.error("Firestore sync error on updateMonthlyBudget:", err);
          }
        }
      },

      transactions: [],
      setTransactions: (transactions) => set({ transactions }),

      addTransaction: async (tx) => {
        const currentUser = get().user;
        const tempId = `tx-${Date.now()}`;
        const createdAt = new Date().toISOString();
        const newTx: Transaction = {
          ...tx,
          id: tempId,
          userId: currentUser?.uid || "guest",
          createdAt,
        };

        // Optimistic UI update
        set((state) => ({
          transactions: [newTx, ...state.transactions],
        }));

        if (currentUser?.uid) {
          try {
            const inserted = await TransactionRepository.addTransaction(newTx);
            set((state) => ({
              transactions: state.transactions.map((t) =>
                t.id === tempId ? inserted : t
              ),
            }));
          } catch (err) {
            console.error("Firestore sync error on addTransaction:", err);
          }
        }
      },

      updateTransaction: async (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
        try {
          await TransactionRepository.updateTransaction(id, updates);
        } catch (err) {
          console.error("Firestore sync error on updateTransaction:", err);
        }
      },

      deleteTransaction: async (id) => {
        // Optimistic local state update
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));

        // Only call Firestore deleteDoc if it's a real Firestore document ID (not a local temp ID)
        if (!id.startsWith("tx-")) {
          try {
            await TransactionRepository.deleteTransaction(id);
          } catch (err) {
            console.error("Firestore sync error on deleteTransaction:", err);
          }
        }
      },

      filters: {
        searchQuery: "",
        type: "all",
        period: "all",
        category: "all",
      },

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      resetFilters: () =>
        set({
          filters: { searchQuery: "", type: "all", period: "all", category: "all" },
        }),

      isAddModalOpen: false,
      activeAddType: "expense",
      openAddModal: (type = "expense") =>
        set({ isAddModalOpen: true, activeAddType: type }),
      closeAddModal: () => set({ isAddModalOpen: false }),

      isDarkMode: false,
      toggleDarkMode: () =>
        set((state) => {
          const nextMode = !state.isDarkMode;
          if (typeof window !== "undefined") {
            if (nextMode) {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
          return { isDarkMode: nextMode };
        }),

      // Derived Summary Logic (Always Balance = Total Income - Total Expense)
      getTotalIncome: () => {
        return get()
          .transactions.filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getTotalExpense: () => {
        return get()
          .transactions.filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getBalance: () => {
        return get().getTotalIncome() - get().getTotalExpense();
      },

      getSpentToday: () => {
        const today = new Date().toISOString().split("T")[0];
        return get()
          .transactions.filter((t) => t.type === "expense" && t.date === today)
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getRemainingDailyLimit: () => {
        const limit = get().user?.dailyLimit || 150;
        return limit - get().getSpentToday();
      },
    }),
    {
      name: "expense-tracker-storage-v3",
      partialize: (state) => ({
        user: state.user,
        transactions: state.transactions,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
