import type { MoneyBook, Transaction } from "./types";

export function calculateBalance(
  money_book: MoneyBook,
  transactions: Transaction[],
): number {
  return transactions.reduce(
    (balance, transaction) =>
      transaction.transaction_type === "income"
        ? balance + transaction.how_much
        : balance - transaction.how_much,
    money_book.how_much,
  );
}

export function calculateBudgetProgress(
  money_book: MoneyBook,
  transactions: Transaction[],
) {
  const spent = transactions.reduce(
    (total, transaction) =>
      transaction.transaction_type === "expense"
        ? total + transaction.how_much
        : total,
    0,
  );
  const percentage = Number(((spent / money_book.how_much) * 100).toFixed(2));

  return {
    spent,
    percentage,
    isOverBudget: spent > money_book.how_much,
  };
}

export function getMonthlySummary(
  transactions: Transaction[],
  monthKey: string,
) {
  return transactions.reduce(
    (summary, transaction) => {
      if (!transaction.transaction_date.startsWith(monthKey)) return summary;
      summary[transaction.transaction_type] += transaction.how_much;
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
      transaction.transaction_type !== "expense" ||
      !transaction.transaction_date.startsWith(monthKey)
    ) {
      continue;
    }
    const category = transaction.category ?? "未分類";
    totals.set(category, (totals.get(category) ?? 0) + transaction.how_much);
  }

  return Array.from(totals, ([category, amount]) => ({ category, amount })).sort(
    (a, b) => b.amount - a.amount,
  );
}
