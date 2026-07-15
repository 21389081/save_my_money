import type { MoneyBook, Transaction } from "./types";

export type MoneyBookStatus =
  | "unavailable"
  | "normal"
  | "warning"
  | "overdrawn";

export function calculateMoneyBookSummary(
  money_book: MoneyBook,
  transactions: Transaction[],
) {
  const totals = transactions.reduce(
    (summary, transaction) => {
      summary[transaction.transaction_type] += transaction.how_much;
      return summary;
    },
    { income: 0, expense: 0 },
  );
  const initialValue = money_book.how_much;
  const income = totals.income;
  const spent = totals.expense;
  const available = initialValue + income;
  const balance = available - spent;
  const percentage =
    available === 0
      ? null
      : Number(((spent / available) * 100).toFixed(2));
  const status: MoneyBookStatus =
    balance < 0
      ? "overdrawn"
      : percentage === null
        ? "unavailable"
        : percentage > 70
          ? "warning"
          : "normal";

  return {
    initialValue,
    income,
    spent,
    available,
    balance,
    percentage,
    status,
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
