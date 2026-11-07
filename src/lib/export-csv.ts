import { Transaction } from "@/types";
import { paiseToRupees } from "./money";

/**
 * Sanitizes a field string against spreadsheet formula injection (CSV Injection).
 * If a cell begins with '=', '+', '-', '@', '\t', or '\r', prefix with an apostrophe.
 */
export function sanitizeCSVField(value: string | undefined | null): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  // Check for dangerous leading characters
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str.replace(/"/g, '""')}`;
  }
  return str.replace(/"/g, '""');
}

/**
 * Compiles and triggers download of transactions in CSV format.
 * Converts integer paise into rupees with 2 decimal places.
 */
export function exportTransactionsToCSV(transactions: Transaction[], filenamePrefix = "Expense_Tracker_Export"): boolean {
  if (!transactions || transactions.length === 0) {
    return false;
  }

  const headers = ["ID", "Type", "Amount (INR)", "Category", "Note", "Date", "Created At"];
  const rows = transactions.map((t) => {
    const rupees = paiseToRupees(t.amountPaise).toFixed(2);
    return [
      t.id,
      t.type.toUpperCase(),
      rupees,
      `"${sanitizeCSVField(t.category)}"`,
      `"${sanitizeCSVField(t.note || "")}"`,
      t.date,
      t.createdAt,
    ];
  });

  // Prepend UTF-8 Byte Order Mark (BOM) to ensure correct unicode rendering across all spreadsheet software
  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filenamePrefix}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
