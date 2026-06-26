import { describe, expect, it } from "vitest";
import { CATEGORIES, type MoneyBook, type Transaction } from "./types";
import {
  calculateBalance,
  calculateBudgetProgress,
  getMonthlyCategoryBreakdown,
  getMonthlySummary,
} from "./finance";

const moneyBook: MoneyBook = {
  id: 1,
  name: "travel",
  how_much: 30_000,
  created_at: "2026-06-01T00:00:00.000Z",
};

const transactions: Transaction[] = [
  {
    id: 1,
    money_book_id: 1,
    name: "ramen",
    how_much: 300,
    transaction_type: "expense",
    category: CATEGORIES[0],
    transaction_date: "2026-06-03",
    created_at: "2026-06-03T04:00:00.000Z",
  },
  {
    id: 2,
    money_book_id: 1,
    name: "tax refund",
    how_much: 1_000,
    transaction_type: "income",
    category: null,
    transaction_date: "2026-06-04",
    created_at: "2026-06-04T04:00:00.000Z",
  },
  {
    id: 3,
    money_book_id: 1,
    name: "ticket",
    how_much: 500,
    transaction_type: "expense",
    category: CATEGORIES[1],
    transaction_date: "2026-06-05",
    created_at: "2026-06-05T04:00:00.000Z",
  },
  {
    id: 4,
    money_book_id: 1,
    name: "souvenir",
    how_much: 900,
    transaction_type: "expense",
    category: null,
    transaction_date: "2025-06-05",
    created_at: "2025-06-05T04:00:00.000Z",
  },
];

describe("finance calculations", () => {
  it("calculates balance as budget plus income minus expenses", () => {
    expect(calculateBalance(moneyBook, transactions)).toBe(29_300);
  });

  it("calculates budget usage from expenses only", () => {
    expect(calculateBudgetProgress(moneyBook, transactions)).toEqual({
      spent: 1_700,
      percentage: 5.67,
      isOverBudget: false,
    });
  });

  it("filters monthly summary by both year and month", () => {
    expect(getMonthlySummary(transactions, "2026-06")).toEqual({
      income: 1_000,
      expense: 800,
    });
  });

  it("groups uncategorized expenses and excludes income", () => {
    expect(getMonthlyCategoryBreakdown(transactions, "2025-06")).toEqual([
      { category: "未分類", amount: 900 },
    ]);
  });
});
