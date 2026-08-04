import { Transaction } from "@/types";

export function exportTransactionsToCSV(transactions: Transaction[]) {
  if (!transactions.length) return;

  const headers = ["ID", "Type", "Amount (INR)", "Category", "Note", "Date", "Created At"];
  const rows = transactions.map((t) => [
    t.id,
    t.type.toUpperCase(),
    t.amount,
    `"${t.category}"`,
    `"${(t.note || "").replace(/"/g, '""')}"`,
    t.date,
    t.createdAt,
  ]);

  const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Expense_Tracker_Export_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
