import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Transaction, UserProfile, Category, CreateTransactionInput, UpdateTransactionInput } from "../types";
import { TransactionService } from "../services/transactionService";
import { BudgetService } from "../services/budgetService";
import { UserRepository } from "../repositories";
import { getLocalDateString, getCurrentMonthString } from "../lib/date";

export interface FilterState {
  searchQuery: string;
  type: "all" | "income" | "expense";
  period: "all" | "today" | "week" | "month" | "year";
  category: Category | string | "all";
}

export interface AppState {
  // Auth & Profile
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateDailyLimit: (limitPaise: number) => Promise<void>;
  updateMonthlyBudget: (budgetPaise: number) => Promise<void>;

  // Dashboard Active Date
  selectedHomeDate: string;
  setSelectedHomeDate: (date: string) => void;
  resetHomeDateToToday: () => void;

  // Transactions
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (tx: CreateTransactionInput) => Promise<Transaction>;
  updateTransaction: (id: string, updates: UpdateTransactionInput) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Modals & Edit Flow
  isAddModalOpen: boolean;
  activeAddType: "expense" | "income";
  editingTransaction: Transaction | null;
  prefilledDate: string | null;
  prefilledNote: string | null;
  openAddModal: (type?: "expense" | "income", date?: string, note?: string) => void;
  openEditModal: (tx: Transaction) => void;
  closeAddModal: () => void;

  // Calendar Overlay Modal
  isCalendarModalOpen: boolean;
  openCalendarModal: () => void;
  closeCalendarModal: () => void;

  // Filters
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Offline & Synchronization
  isOnline: boolean;
  isSyncing: boolean;
  setIsOnline: (online: boolean) => void;
  syncPendingQueue: () => Promise<void>;

  // Derived Financial Computations (in integer Paise)
  getBalancePaise: () => number;
  getTotalIncomePaise: () => number;
  getTotalExpensePaise: () => number;
  getSpentForDatePaise: (date: string) => number;
  getSpentTodayPaise: () => number;
  getDailyBudgetForDatePaise: (date?: string) => number;
  getMonthlySpentPaise: (monthStr?: string) => number;

  // Compatibility aliases
  getBalance: () => number;
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getSpentToday: () => number;
  getRemainingDailyLimit: () => number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => {
        // Normalize legacy properties if user profile is loaded
        if (user) {
          let dailyLimitPaise = user.dailyLimitPaise !== undefined 
            ? user.dailyLimitPaise 
            : Math.round((user.dailyLimit || 150) * 100);
          if (dailyLimitPaise > 0 && dailyLimitPaise < 1000) {
            dailyLimitPaise = Math.round(dailyLimitPaise * 100);
          }

          let monthlyBudgetPaise = user.monthlyBudgetPaise !== undefined
            ? user.monthlyBudgetPaise
            : Math.round((user.monthlyBudget || 4500) * 100);
          if (monthlyBudgetPaise > 0 && monthlyBudgetPaise < 10000) {
            monthlyBudgetPaise = Math.round(monthlyBudgetPaise * 100);
          }

          const dailyBudgetHistory: Record<string, number> = {};
          if (user.dailyBudgetHistory) {
            for (const [d, v] of Object.entries(user.dailyBudgetHistory)) {
              dailyBudgetHistory[d] = (v > 0 && v < 1000) ? Math.round(v * 100) : Math.round(v);
            }
          }

          set({
            user: {
              ...user,
              dailyLimitPaise,
              monthlyBudgetPaise,
              dailyBudgetHistory,
              timezone: user.timezone || "Asia/Kolkata",
              currency: "INR",
            },
          });
        } else {
          set({ user: null });
        }
      },

      selectedHomeDate: getLocalDateString(),
      setSelectedHomeDate: (date) => set({ selectedHomeDate: date }),
      resetHomeDateToToday: () => set({ selectedHomeDate: getLocalDateString() }),

      updateDailyLimit: async (limitPaise) => {
        const currentUser = get().user;
        const todayStr = getLocalDateString();
        const cleanPaise = Math.round(limitPaise);

        set((state) => {
          if (!state.user) return { user: null };
          const updatedHistory = {
            ...(state.user.dailyBudgetHistory || {}),
            [todayStr]: cleanPaise,
          };
          return {
            user: {
              ...state.user,
              dailyLimitPaise: cleanPaise,
              dailyBudgetHistory: updatedHistory,
            },
          };
        });

        if (currentUser?.uid) {
          try {
            await UserRepository.updateDailyLimit(currentUser.uid, cleanPaise);
            await UserRepository.saveDailyBudgetSnapshot(currentUser.uid, todayStr, cleanPaise);
          } catch (err) {
            console.error("Firestore sync error on updateDailyLimit:", err);
          }
        }
      },

      updateMonthlyBudget: async (budgetPaise) => {
        const currentUser = get().user;
        const cleanPaise = Math.round(budgetPaise);
        set((state) => ({
          user: state.user ? { ...state.user, monthlyBudgetPaise: cleanPaise } : null,
        }));
        if (currentUser?.uid) {
          try {
            await UserRepository.updateMonthlyBudget(currentUser.uid, cleanPaise);
          } catch (err) {
            console.error("Firestore sync error on updateMonthlyBudget:", err);
          }
        }
      },

      transactions: [],
      setTransactions: (rawTransactions) => {
        // Automatically migrate any legacy records loaded from Firestore or older versions
        const normalized = rawTransactions.map((tx) => ({
          ...tx,
          amountPaise: tx.amountPaise !== undefined ? tx.amountPaise : Math.round((tx.amount || 0) * 100),
          syncStatus: tx.syncStatus || "synced",
        }));
        set({ transactions: normalized });
      },

      addTransaction: async (input) => {
        const currentUser = get().user;
        const userId = currentUser?.uid || "guest";

        // Create transaction via service (enqueues & synchronizes)
        const newTx = await TransactionService.createTransaction(userId, input);

        // Optimistically update local store and reflect chosen date on daily dashboard
        set((state) => ({
          transactions: [newTx, ...state.transactions],
          selectedHomeDate: input.date,
        }));

        return newTx;
      },

      updateTransaction: async (id, updates) => {
        const currentUser = get().user;
        const userId = currentUser?.uid || "guest";

        // Optimistic store update
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
          ...(updates.date ? { selectedHomeDate: updates.date } : {}),
        }));

        await TransactionService.updateTransaction(userId, id, updates);
      },

      deleteTransaction: async (id) => {
        const currentUser = get().user;
        const userId = currentUser?.uid || "guest";

        // Filter out optimistically
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));

        try {
          await TransactionService.deleteTransaction(userId, id);
        } catch (err) {
          console.error("Failed to delete transaction:", err);
          throw err;
        }
      },

      // Modal management
      isAddModalOpen: false,
      activeAddType: "expense",
      editingTransaction: null,
      prefilledDate: null,
      prefilledNote: null,

      openAddModal: (type = "expense", date, note) =>
        set({
          isAddModalOpen: true,
          activeAddType: type,
          editingTransaction: null,
          prefilledDate: date || get().selectedHomeDate || getLocalDateString(),
          prefilledNote: note || null,
        }),

      openEditModal: (tx) =>
        set({
          isAddModalOpen: true,
          activeAddType: tx.type,
          editingTransaction: tx,
          prefilledDate: tx.date,
          prefilledNote: null,
        }),

      closeAddModal: () =>
        set({ isAddModalOpen: false, editingTransaction: null, prefilledDate: null, prefilledNote: null }),

      // Calendar Overlay Modal
      isCalendarModalOpen: false,
      openCalendarModal: () => set({ isCalendarModalOpen: true }),
      closeCalendarModal: () => set({ isCalendarModalOpen: false }),

      // Filters
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

      // Theme
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

      // Sync & Connectivity
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      isSyncing: false,
      setIsOnline: (online) => set({ isOnline: online }),

      syncPendingQueue: async () => {
        const currentUser = get().user;
        if (!currentUser?.uid) return;
        set({ isSyncing: true });
        try {
          await TransactionService.processQueue(currentUser.uid);
          // Refresh transactions from repository
          const txs = await UserRepository.getUserProfile(currentUser.uid);
          if (txs) {
            set((state) => ({
              transactions: state.transactions.map((t) => ({ ...t, syncStatus: "synced" })),
            }));
          }
        } catch (err) {
          console.error("Error syncing pending queue:", err);
        } finally {
          set({ isSyncing: false });
        }
      },

      // Derived Computations in integer Paise
      getTotalIncomePaise: () => {
        return get()
          .transactions.filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amountPaise, 0);
      },

      getTotalExpensePaise: () => {
        return get()
          .transactions.filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amountPaise, 0);
      },

      getBalancePaise: () => {
        return get().getTotalIncomePaise() - get().getTotalExpensePaise();
      },

      getSpentForDatePaise: (dateString: string) => {
        return get()
          .transactions.filter((t) => t.type === "expense" && t.date === dateString)
          .reduce((sum, t) => sum + t.amountPaise, 0);
      },

      getSpentTodayPaise: () => {
        const today = getLocalDateString();
        return get().getSpentForDatePaise(today);
      },

      getDailyBudgetForDatePaise: (dateString?: string) => {
        const targetDate = dateString || get().selectedHomeDate || getLocalDateString();
        const user = get().user;
        return BudgetService.resolveDailyBudgetForDate({
          date: targetDate,
          history: user?.dailyBudgetHistory || {},
          currentDailyLimitPaise: user?.dailyLimitPaise || BudgetService.DEFAULT_DAILY_LIMIT_PAISE,
        });
      },

      getMonthlySpentPaise: (monthStr?: string) => {
        const targetMonth = monthStr || getCurrentMonthString();
        return get()
          .transactions.filter((t) => t.type === "expense" && t.date.startsWith(targetMonth))
          .reduce((sum, t) => sum + t.amountPaise, 0);
      },

      // Legacy compatibility getters (returning paise)
      getBalance: () => get().getBalancePaise(),
      getTotalIncome: () => get().getTotalIncomePaise(),
      getTotalExpense: () => get().getTotalExpensePaise(),
      getSpentToday: () => get().getSpentTodayPaise(),
      getRemainingDailyLimit: () => {
        const budget = get().getDailyBudgetForDatePaise();
        const spent = get().getSpentTodayPaise();
        return Math.max(0, budget - spent);
      },
    }),
    {
      name: "expense-tracker-storage-v4",
      partialize: (state) => ({
        user: state.user,
        transactions: state.transactions,
        isDarkMode: state.isDarkMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          if (state.user.dailyLimitPaise && state.user.dailyLimitPaise > 0 && state.user.dailyLimitPaise < 1000) {
            state.user.dailyLimitPaise = Math.round(state.user.dailyLimitPaise * 100);
          }
          if (state.user.monthlyBudgetPaise && state.user.monthlyBudgetPaise > 0 && state.user.monthlyBudgetPaise < 10000) {
            state.user.monthlyBudgetPaise = Math.round(state.user.monthlyBudgetPaise * 100);
          }
          if (state.user.dailyBudgetHistory) {
            for (const [k, v] of Object.entries(state.user.dailyBudgetHistory)) {
              if (v > 0 && v < 1000) {
                state.user.dailyBudgetHistory[k] = Math.round(v * 100);
              }
            }
          }
        }
      },
    }
  )
);
