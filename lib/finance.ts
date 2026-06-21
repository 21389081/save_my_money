import type { Ledger, Transaction } from "./types";

export function calculateBalance(
  ledger: Ledger,
  transactions: Transaction[],
): number {
  return transactions.reduce(
    (balance, transaction) =>
      transaction.type === "income"
        ? balance + transaction.amount
        : balance - transaction.amount,
    ledger.initialBudget,
  );
}

export function calculateBudgetProgress(
  ledger: Ledger,
  transactions: Transaction[],
) {
  const spent = transactions.reduce(
    (total, transaction) =>
      transaction.type === "expense" ? total + transaction.amount : total,
    0,
  );
  const percentage = Number(
    ((spent / ledger.initialBudget) * 100).toFixed(2),
  );

  return {
    spent,
    percentage,
    isOverBudget: spent > ledger.initialBudget,
  };
}

export function getMonthlySummary(
  transactions: Transaction[],
  monthKey: string,
) {
  return transactions.reduce(
    (summary, transaction) => {
      if (!transaction.date.startsWith(monthKey)) return summary;
      summary[transaction.type] += transaction.amount;
      return summary;
    },
    { income: 0, expense: 0 },
  );
}

export function getMonthlyCategoryBreakdown(
  transactions: Transaction[],
  monthKey: string,
) {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (
      transaction.type !== "expense" ||
      !transaction.date.startsWith(monthKey)
    ) {
      continue;
    }
    const category = transaction.category ?? "未分類";
    totals.set(category, (totals.get(category) ?? 0) + transaction.amount);
  }

  return Array.from(totals, ([category, amount]) => ({ category, amount })).sort(
    (a, b) => b.amount - a.amount,
  );
}
