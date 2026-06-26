import { describe, expect, it, vi } from "vitest";
import { CATEGORIES, type Session, type Transaction } from "@/lib/types";
import { supabaseRepository } from "./repository";

const session: Session = { name: "Vincent" };
const user = { id: "user-1" };

const moneyBookRow = {
  id: 1,
  name: "測試帳本",
  how_much: 30_000,
  created_at: "2026-06-26T01:00:00.000Z",
  updated_at: "2026-06-26T01:00:00.000Z",
  user_id: user.id,
  currency_code: "TWD",
};

const transactionRow: Transaction = {
  id: 10,
  money_book_id: 1,
  name: "測試早餐",
  how_much: 85,
  transaction_type: "expense",
  category: CATEGORIES[0],
  transaction_date: "2026-06-26",
  created_at: "2026-06-26T02:00:00.000Z",
};

function result<T>(data: T) {
  return Promise.resolve({ data, error: null });
}

function singleResult<T>(data: T) {
  return {
    single: vi.fn(() => result(data)),
  };
}

function selectSingleResult<T>(data: T) {
  return {
    select: vi.fn(() => singleResult(data)),
  };
}

function deleteEqResult() {
  return {
    eq: vi.fn(() => result(null)),
    in: vi.fn(() => result(null)),
  };
}

function createClient({
  moneyBookRows = [moneyBookRow],
  transactionRows = [transactionRow],
  insertedMoneyBook = moneyBookRow,
  insertedTransaction = transactionRow,
}: {
  moneyBookRows?: unknown[];
  transactionRows?: unknown[];
  insertedMoneyBook?: unknown;
  insertedTransaction?: unknown;
} = {}) {
  const moneyBookSelect = {
    eq: vi.fn(() => ({
      order: vi.fn(() => result(moneyBookRows)),
    })),
    order: vi.fn(() => result(moneyBookRows)),
  };

  const transactionSelectAfterIn = {
    order: vi.fn(() => ({
      order: vi.fn(() => result(transactionRows)),
    })),
  };

  const transactionsSelect = {
    in: vi.fn(() => transactionSelectAfterIn),
    eq: vi.fn(() => ({
      order: vi.fn(() => result(transactionRows)),
    })),
  };

  const moneyBookTable = {
    select: vi.fn(() => moneyBookSelect),
    insert: vi.fn(() => selectSingleResult(insertedMoneyBook)),
    delete: vi.fn(() => deleteEqResult()),
  };

  const transactionsTable = {
    select: vi.fn(() => transactionsSelect),
    insert: vi.fn(() => selectSingleResult(insertedTransaction)),
    update: vi.fn(() => ({
      eq: vi.fn(() => selectSingleResult(insertedTransaction)),
    })),
    delete: vi.fn(() => deleteEqResult()),
  };

  const client = {
    auth: {
      getUser: vi.fn(() => result({ user })),
    },
    from: vi.fn((table: "money_book" | "transactions") =>
      table === "money_book" ? moneyBookTable : transactionsTable,
    ),
  };

  return {
    client,
    moneyBookTable,
    transactionsTable,
  };
}

describe("supabaseRepository", () => {
  it("loads existing money books and transactions", async () => {
    const { client, moneyBookTable, transactionsTable } = createClient();

    const state = await supabaseRepository.load(client, session);

    expect(moneyBookTable.insert).not.toHaveBeenCalled();
    expect(transactionsTable.insert).not.toHaveBeenCalled();
    expect(state).toEqual({
      version: 1,
      money_book: [moneyBookRow],
      transactions: [transactionRow],
      current_money_book_id: 1,
      session,
    });
  });

  it("returns an empty state when the user has no money books", async () => {
    const { client, moneyBookTable, transactionsTable } = createClient({
      moneyBookRows: [],
      transactionRows: [],
    });

    const state = await supabaseRepository.load(client, session);

    expect(moneyBookTable.insert).not.toHaveBeenCalled();
    expect(transactionsTable.insert).not.toHaveBeenCalled();
    expect(state).toEqual({
      version: 1,
      money_book: [],
      transactions: [],
      current_money_book_id: null,
      session,
    });
  });

  it("creates a money book through Supabase", async () => {
    const { client, moneyBookTable } = createClient();

    await expect(
      supabaseRepository.createMoneyBook(client, {
        name: "生活",
        how_much: 10_000,
      }),
    ).resolves.toEqual(moneyBookRow);

    expect(moneyBookTable.insert).toHaveBeenCalledWith({
      name: "生活",
      how_much: 10_000,
      user_id: user.id,
      currency_code: "TWD",
    });
  });

  it("creates, updates, and deletes transactions through Supabase", async () => {
    const { client, transactionsTable } = createClient();

    await expect(
      supabaseRepository.createTransaction(client, {
        money_book_id: 1,
        name: "午餐",
        how_much: 120,
        transaction_type: "expense",
        category: CATEGORIES[0],
        transaction_date: "2026-06-26",
      }),
    ).resolves.toEqual(transactionRow);

    await expect(
      supabaseRepository.updateTransaction(client, {
        ...transactionRow,
        name: "晚餐",
      }),
    ).resolves.toEqual(transactionRow);

    await expect(
      supabaseRepository.deleteTransaction(client, 10),
    ).resolves.toBeUndefined();

    expect(transactionsTable.insert).toHaveBeenCalled();
    expect(transactionsTable.update).toHaveBeenCalledWith({
      money_book_id: 1,
      name: "晚餐",
      how_much: 85,
      transaction_type: "expense",
      category: CATEGORIES[0],
      transaction_date: "2026-06-26",
    });
    expect(transactionsTable.delete).toHaveBeenCalled();
  });

  it("deletes transactions before deleting a money book", async () => {
    const { client, moneyBookTable, transactionsTable } = createClient();

    await expect(
      supabaseRepository.deleteMoneyBook(client, 1),
    ).resolves.toBeUndefined();

    expect(transactionsTable.delete).toHaveBeenCalled();
    expect(moneyBookTable.delete).toHaveBeenCalled();
  });

  it("resets the current user's data to an empty state", async () => {
    const { client, moneyBookTable, transactionsTable } = createClient({
      moneyBookRows: [moneyBookRow],
      transactionRows: [transactionRow],
    });

    const state = await supabaseRepository.reset(client, session);

    expect(transactionsTable.delete).toHaveBeenCalled();
    expect(moneyBookTable.delete).toHaveBeenCalled();
    expect(moneyBookTable.insert).not.toHaveBeenCalled();
    expect(transactionsTable.insert).not.toHaveBeenCalled();
    expect(state).toEqual({
      version: 1,
      money_book: [],
      transactions: [],
      current_money_book_id: null,
      session,
    });
  });
});
