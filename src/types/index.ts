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

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: Category;
  note?: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO String
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  dailyLimit: number;
  monthlyBudget?: number;
  createdAt: string;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
}
