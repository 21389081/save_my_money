import { describe, expect, it } from "vitest";
import type { Ledger, Transaction } from "./types";
import {
  calculateBalance,
  calculateBudgetProgress,
  getMonthlyCategoryBreakdown,
  getMonthlySummary,
} from "./finance";

const ledger: Ledger = {
  id: "ledger-1",
  name: "日本行",
  initialBudget: 30_000,
  createdAt: "2026-06-01T00:00:00.000Z",
};

const transactions: Transaction[] = [
  {
    id: "t1",
    ledgerId: "ledger-1",
    title: "拉麵",
    amount: 300,
    type: "expense",
    category: "飲食",
    date: "2026-06-03",
    createdAt: "2026-06-03T04:00:00.000Z",
  },
  {
    id: "t2",
    ledgerId: "ledger-1",
    title: "退稅",
    amount: 1_000,
    type: "income",
    category: null,
    date: "2026-06-04",
    createdAt: "2026-06-04T04:00:00.000Z",
  },
  {
    id: "t3",
    ledgerId: "ledger-1",
    title: "車票",
    amount: 500,
    type: "expense",
    category: "交通",
    date: "2026-06-05",
    createdAt: "2026-06-05T04:00:00.000Z",
  },
  {
    id: "t4",
    ledgerId: "ledger-1",
    title: "紀念品",
    amount: 900,
    type: "expense",
    category: null,
    date: "2025-06-05",
    createdAt: "2025-06-05T04:00:00.000Z",
  },
];

describe("finance calculations", () => {
  it("calculates balance as budget plus income minus expenses", () => {
    expect(calculateBalance(ledger, transactions)).toBe(29_300);
  });

  it("calculates budget usage from expenses only", () => {
    expect(calculateBudgetProgress(ledger, transactions)).toEqual({
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
