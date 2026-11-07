/**
 * Financial calculation and currency formatting utilities.
 * All monetary amounts are stored internally as integer paise to avoid floating point errors.
 * 1 Rupee = 100 Paise.
 */

/**
 * Converts a rupee amount (which may be a float or numeric string) into integer paise.
 * Ensures the result is a non-negative integer.
 */
export function rupeesToPaise(rupees: number | string): number {
  const numericVal = typeof rupees === "string" ? parseFloat(rupees) : rupees;
  if (isNaN(numericVal) || !isFinite(numericVal)) {
    return 0;
  }
  return Math.max(0, Math.round(numericVal * 100));
}

/**
 * Converts integer paise into fractional rupees (float).
 */
export function paiseToRupees(paise: number): number {
  if (isNaN(paise) || !isFinite(paise)) return 0;
  return Math.round(paise) / 100;
}

/**
 * Formats an amount in integer paise to an Indian Rupee string (e.g. ₹1,250 or ₹1,250.50).
 */
export function formatPaiseToINR(paise: number, showDecimals: boolean = false): string {
  const rupees = paiseToRupees(paise);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Formats signed paise for income (+) or expense (-).
 */
export function formatSignedPaiseToINR(
  paise: number,
  type: "income" | "expense",
  showDecimals: boolean = false
): string {
  const formatted = formatPaiseToINR(paise, showDecimals);
  return type === "income" ? `+${formatted}` : `-${formatted}`;
}

/**
 * Sums an array of paise integers safely.
 */
export function sumPaise(amounts: number[]): number {
  return amounts.reduce((acc, curr) => acc + (Math.round(curr) || 0), 0);
}
