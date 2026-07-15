import { describe, expect, it } from "vitest";
import { CATEGORIES, type MoneyBook, type Transaction } from "./types";
import {
  calculateMoneyBookSummary,
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
  it("calculates a money book summary from the initial value and all transactions", () => {
    expect(calculateMoneyBookSummary(moneyBook, transactions)).toEqual({
      initialValue: 30_000,
      income: 1_000,
      spent: 1_700,
      available: 31_000,
      balance: 29_300,
      percentage: 5.48,
      status: "normal",
    });
  });

  it("keeps exactly seventy percent normal and warns above seventy percent", () => {
    const emptyBook = { ...moneyBook, how_much: 0 };
    const income: Transaction = {
      ...transactions[1],
      id: 10,
      how_much: 1_000,
    };
    const expense = (amount: number): Transaction => ({
      ...transactions[0],
      id: amount,
      how_much: amount,
    });

    expect(
      calculateMoneyBookSummary(emptyBook, [income, expense(700)]),
    ).toMatchObject({
      balance: 300,
      percentage: 70,
      status: "normal",
    });
    expect(
      calculateMoneyBookSummary(emptyBook, [income, expense(701)]),
    ).toMatchObject({
      balance: 299,
      percentage: 70.1,
      status: "warning",
    });
    expect(
      calculateMoneyBookSummary(emptyBook, [income, expense(1_000)]),
    ).toMatchObject({
      balance: 0,
      percentage: 100,
      status: "warning",
    });
    expect(
      calculateMoneyBookSummary(emptyBook, [income, expense(1_001)]),
    ).toMatchObject({
      balance: -1,
      percentage: 100.1,
      status: "overdrawn",
    });
  });

  it("hides usage when no funds are available while preserving overdrawn state", () => {
    const emptyBook = { ...moneyBook, how_much: 0 };

    expect(calculateMoneyBookSummary(emptyBook, [])).toMatchObject({
      available: 0,
      balance: 0,
      percentage: null,
      status: "unavailable",
    });
    expect(
      calculateMoneyBookSummary(emptyBook, [
        { ...transactions[0], how_much: 1 },
      ]),
    ).toMatchObject({
      available: 0,
      balance: -1,
      percentage: null,
      status: "overdrawn",
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
