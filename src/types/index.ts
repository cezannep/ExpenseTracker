export type TransactionType = "income" | "expense";

export type ExpenseCategory =
  | "Food"
  | "Travel"
  | "Shopping"
  | "Medical"
  | "Entertainment"
  | "Bills"
  | "Education"
  | "Home"
  | "Others";

export type IncomeSource =
  | "Salary"
  | "Cash"
  | "Gift"
  | "Bank Transfer"
  | "Other";

export type Category = ExpenseCategory | IncomeSource;

export type SyncStatus = "pending" | "synced" | "failed";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amountPaise: number;
  category: Category | string;
  note?: string;
  date: string; // YYYY-MM-DD in user's local timezone
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  syncStatus?: SyncStatus;
  
  // Legacy migration property (if read from older local cache versions)
  amount?: number;
}

export interface DailyBudgetSnapshot {
  date: string; // YYYY-MM-DD
  amountPaise: number;
  createdAt: string;
  updatedAt: string;

  // Legacy migration property
  dailyLimit?: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  dailyLimitPaise: number;
  monthlyBudgetPaise?: number;
  timezone: string; // e.g. "Asia/Kolkata"
  currency: "INR";
  createdAt: string;
  updatedAt: string;

  // Legacy properties for smooth migration
  dailyLimit?: number;
  monthlyBudget?: number;
  dailyBudgetHistory?: Record<string, number>;
}

export interface PendingOperation {
  operationId: string;
  entityId: string;
  entityType: "transaction" | "dailyBudget" | "userProfile";
  operation: "create" | "update" | "delete";
  payload?: unknown;
  createdAt: string;
  status: "pending" | "processing" | "failed";
  retryCount: number;
  lastError?: string;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  totalIncomePaise: number;
  totalExpensePaise: number;
  netSavingsPaise: number;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amountPaise: number;
  category: Category | string;
  note?: string;
  date: string;
}

export interface UpdateTransactionInput {
  type?: TransactionType;
  amountPaise?: number;
  category?: Category | string;
  note?: string;
  date?: string;
}
