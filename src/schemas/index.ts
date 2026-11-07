import { z } from "zod";
import { getLocalDateString } from "@/lib/date";

export const transactionFormSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Please enter a valid amount" })
    .positive("Amount must be greater than 0")
    .max(10000000, "Amount exceeds maximum permitted limit"),
  type: z.enum(["income", "expense"], {
    errorMap: () => ({ message: "Type must be income or expense" }),
  }),
  category: z
    .string()
    .min(1, "Please select a category")
    .max(50, "Category name too long"),
  note: z
    .string()
    .max(200, "Note cannot exceed 200 characters")
    .optional()
    .or(z.literal("")),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine((d) => d <= getLocalDateString(), {
      message: "Future dates are not permitted. Please choose today or a past date.",
    }),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export const dailyLimitFormSchema = z.object({
  dailyLimit: z
    .number({ invalid_type_error: "Please enter a valid daily limit" })
    .min(10, "Daily limit must be at least ₹10")
    .max(1000000, "Daily limit exceeds maximum limit"),
});

export type DailyLimitFormValues = z.infer<typeof dailyLimitFormSchema>;

export const monthlyBudgetFormSchema = z.object({
  monthlyBudget: z
    .number({ invalid_type_error: "Please enter a valid monthly budget" })
    .min(100, "Monthly budget must be at least ₹100")
    .max(10000000, "Monthly budget exceeds maximum limit"),
});

export type MonthlyBudgetFormValues = z.infer<typeof monthlyBudgetFormSchema>;

// Boundary payload validators for Firestore
export const persistedTransactionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  type: z.enum(["income", "expense"]),
  amountPaise: z.number().int().nonnegative(),
  category: z.string().min(1),
  note: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
