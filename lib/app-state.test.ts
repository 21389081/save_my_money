import { describe, expect, it } from "vitest";
import { appReducer } from "./app-state";
import { CATEGORIES, type AppState, type MoneyBook, type Transaction } from "./types";

const moneyBookA: MoneyBook = {
  id: 1,
  name: "daily",
  how_much: 10_000,
  created_at: "2026-06-01T00:00:00.000Z",
};

const moneyBookB: MoneyBook = {
  id: 2,
  name: "travel",
  how_much: 30_000,
  created_at: "2026-06-01T00:00:00.000Z",
};

const transaction: Transaction = {
  id: 1,
  money_book_id: 1,
  name: "lunch",
  how_much: 120,
  transaction_type: "expense",
  category: CATEGORIES[0],
  transaction_date: "2026-06-22",
  created_at: "2026-06-22T00:00:00.000Z",
};

const state: AppState = {
  version: 1,
  money_book: [moneyBookA, moneyBookB],
  transactions: [transaction],
  current_money_book_id: 1,
  session: { name: "Vincent" },
};

describe("appReducer", () => {
  it("adds and updates a transaction", () => {
    const added = appReducer(state, {
      type: "transaction/add",
      transaction: { ...transaction, id: 2, name: "coffee" },
    });
    const updated = appReducer(added, {
      type: "transaction/update",
      transaction: { ...transaction, id: 2, name: "latte" },
    });
    expect(updated.transactions.find((item) => item.id === 2)?.name).toBe(
      "latte",
    );
  });

  it("deletes a money book, its transactions, and selects the remaining money book", () => {
    const result = appReducer(state, {
      type: "money_book/delete",
      money_book_id: 1,
    });
    expect(result.money_book).toEqual([moneyBookB]);
    expect(result.transactions).toEqual([]);
    expect(result.current_money_book_id).toBe(2);
  });

  it("refuses to delete the final money book", () => {
    const oneMoneyBook = { ...state, money_book: [moneyBookA] };
    expect(
      appReducer(oneMoneyBook, {
        type: "money_book/delete",
        money_book_id: 1,
      }),
    ).toBe(oneMoneyBook);
  });
});
