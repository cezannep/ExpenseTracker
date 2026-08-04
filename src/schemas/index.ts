import z from "zod";

export const transactionSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Please enter a valid amount" })
    .positive("Amount must be greater than 0"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Please select a category"),
  note: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

export const dailyLimitSchema = z.object({
  dailyLimit: z
    .number({ invalid_type_error: "Please enter a valid limit" })
    .min(100, "Daily limit must be at least ₹100"),
});

export type DailyLimitFormValues = z.infer<typeof dailyLimitSchema>;
