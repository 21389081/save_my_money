import { describe, expect, it } from "vitest";
import { appReducer } from "./app-state";
import type { AppState, Ledger, Transaction } from "./types";

const ledgerA: Ledger = {
  id: "a",
  name: "日常",
  initialBudget: 10_000,
  createdAt: "2026-06-01T00:00:00.000Z",
};
const ledgerB: Ledger = {
  id: "b",
  name: "日本行",
  initialBudget: 30_000,
  createdAt: "2026-06-01T00:00:00.000Z",
};
const transaction: Transaction = {
  id: "t",
  ledgerId: "a",
  title: "午餐",
  amount: 120,
  type: "expense",
  category: "飲食",
  date: "2026-06-22",
  createdAt: "2026-06-22T00:00:00.000Z",
};
const state: AppState = {
  version: 1,
  ledgers: [ledgerA, ledgerB],
  transactions: [transaction],
  currentLedgerId: "a",
  session: { name: "Vincent" },
};

describe("appReducer", () => {
  it("adds and updates a transaction", () => {
    const added = appReducer(state, {
      type: "transaction/add",
      transaction: { ...transaction, id: "new", title: "咖啡" },
    });
    const updated = appReducer(added, {
      type: "transaction/update",
      transaction: { ...transaction, id: "new", title: "拿鐵" },
    });
    expect(updated.transactions.find((item) => item.id === "new")?.title).toBe(
      "拿鐵",
    );
  });

  it("deletes a ledger, its transactions, and selects the remaining ledger", () => {
    const result = appReducer(state, { type: "ledger/delete", ledgerId: "a" });
    expect(result.ledgers).toEqual([ledgerB]);
    expect(result.transactions).toEqual([]);
    expect(result.currentLedgerId).toBe("b");
  });

  it("refuses to delete the final ledger", () => {
    const oneLedger = { ...state, ledgers: [ledgerA] };
    expect(
      appReducer(oneLedger, { type: "ledger/delete", ledgerId: "a" }),
    ).toBe(oneLedger);
  });
});
