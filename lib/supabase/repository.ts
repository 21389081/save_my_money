import { toLocalDateInput } from "@/lib/date";
import {
  CATEGORIES,
  type AppState,
  type MoneyBook,
  type Session,
  type Transaction,
} from "@/lib/types";

interface ErrorLike {
  message?: string;
}

interface UserLike {
  id: string;
}

interface SupabaseResult<T> {
  data: T;
  error: ErrorLike | null;
}

type AwaitableResult<T> = Promise<SupabaseResult<T>> | PromiseLike<SupabaseResult<T>>;

interface SupabaseDataClient {
  auth: {
    getUser(): AwaitableResult<{ user: UserLike | null }>;
  };
  from(table: "money_book" | "transactions"): unknown;
}

type MoneyBookInsert = Pick<MoneyBook, "name" | "how_much"> &
  Partial<Pick<MoneyBook, "currency_code">>;

type TransactionInsert = Omit<Transaction, "id" | "created_at" | "update_at">;

function emptyState(session: Session | null): AppState {
  return {
    version: 1,
    money_book: [],
    transactions: [],
    current_money_book_id: null,
    session,
  };
}

function assertNoError<T>(result: SupabaseResult<T>): T {
  if (result.error) {
    throw new Error(result.error.message ?? "Supabase request failed");
  }
  return result.data;
}

async function getCurrentUser(client: SupabaseDataClient): Promise<UserLike | null> {
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) return null;
  return user;
}

async function fetchMoneyBooks(client: SupabaseDataClient, userId: string) {
  const table = client.from("money_book") as {
    select(columns: string): {
      eq(column: "user_id", value: string): {
        order(
          column: "created_at",
          options: { ascending: boolean },
        ): AwaitableResult<MoneyBook[]>;
      };
    };
  };

  return assertNoError(
    await table
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
  );
}

async function fetchTransactions(
  client: SupabaseDataClient,
  moneyBookIds: number[],
) {
  if (moneyBookIds.length === 0) return [];

  const table = client.from("transactions") as {
    select(columns: string): {
      in(column: "money_book_id", values: number[]): {
        order(
          column: "transaction_date",
          options: { ascending: boolean },
        ): {
          order(
            column: "created_at",
            options: { ascending: boolean },
          ): AwaitableResult<Transaction[]>;
        };
      };
    };
  };

  return assertNoError(
    await table
      .select("*")
      .in("money_book_id", moneyBookIds)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false }),
  );
}

async function createSampleData(client: SupabaseDataClient, userId: string) {
  const money_book = await supabaseRepository.createMoneyBook(client, {
    name: "測試帳本",
    how_much: 30_000,
    currency_code: "TWD",
    user_id: userId,
  });
  const transaction = await supabaseRepository.createTransaction(client, {
    money_book_id: money_book.id,
    name: "測試早餐",
    how_much: 85,
    transaction_type: "expense",
    category: CATEGORIES[0],
    transaction_date: toLocalDateInput(),
  });

  return { money_book, transaction };
}

export const supabaseRepository = {
  emptyState,

  async load(
    client: SupabaseDataClient,
    session: Session | null,
  ): Promise<AppState> {
    const user = await getCurrentUser(client);
    if (!user) return emptyState(session);

    let money_book = await fetchMoneyBooks(client, user.id);
    if (money_book.length === 0) {
      const sample = await createSampleData(client, user.id);
      money_book = [sample.money_book];
      return {
        version: 1,
        money_book,
        transactions: [sample.transaction],
        current_money_book_id: sample.money_book.id,
        session,
      };
    }

    const transactions = await fetchTransactions(
      client,
      money_book.map((item) => item.id),
    );

    return {
      version: 1,
      money_book,
      transactions,
      current_money_book_id: money_book[0]?.id ?? null,
      session,
    };
  },

  async createMoneyBook(
    client: SupabaseDataClient,
    input: MoneyBookInsert & { user_id?: string },
  ): Promise<MoneyBook> {
    const user = input.user_id ? { id: input.user_id } : await getCurrentUser(client);
    if (!user) throw new Error("Cannot create a money book without a user");

    const table = client.from("money_book") as {
      insert(payload: {
        name: string;
        how_much: number;
        user_id: string;
        currency_code: string;
      }): {
        select(columns: string): {
          single(): AwaitableResult<MoneyBook>;
        };
      };
    };

    return assertNoError(
      await table
        .insert({
          name: input.name,
          how_much: input.how_much,
          user_id: user.id,
          currency_code: input.currency_code ?? "TWD",
        })
        .select("*")
        .single(),
    );
  },

  async deleteMoneyBook(
    client: SupabaseDataClient,
    money_book_id: number,
  ): Promise<void> {
    const transactionsTable = client.from("transactions") as {
      delete(): {
        eq(column: "money_book_id", value: number): AwaitableResult<null>;
      };
    };
    const moneyBookTable = client.from("money_book") as {
      delete(): {
        eq(column: "id", value: number): AwaitableResult<null>;
      };
    };

    assertNoError(
      await transactionsTable.delete().eq("money_book_id", money_book_id),
    );
    assertNoError(await moneyBookTable.delete().eq("id", money_book_id));
  },

  async createTransaction(
    client: SupabaseDataClient,
    input: TransactionInsert,
  ): Promise<Transaction> {
    const table = client.from("transactions") as {
      insert(payload: TransactionInsert): {
        select(columns: string): {
          single(): AwaitableResult<Transaction>;
        };
      };
    };

    return assertNoError(await table.insert(input).select("*").single());
  },

  async updateTransaction(
    client: SupabaseDataClient,
    transaction: Transaction,
  ): Promise<Transaction> {
    const table = client.from("transactions") as {
      update(payload: TransactionInsert): {
        eq(column: "id", value: number): {
          select(columns: string): {
            single(): AwaitableResult<Transaction>;
          };
        };
      };
    };

    return assertNoError(
      await table
        .update({
          money_book_id: transaction.money_book_id,
          name: transaction.name,
          how_much: transaction.how_much,
          transaction_type: transaction.transaction_type,
          category: transaction.category,
          transaction_date: transaction.transaction_date,
        })
        .eq("id", transaction.id)
        .select("*")
        .single(),
    );
  },

  async deleteTransaction(
    client: SupabaseDataClient,
    transaction_id: number,
  ): Promise<void> {
    const table = client.from("transactions") as {
      delete(): {
        eq(column: "id", value: number): AwaitableResult<null>;
      };
    };

    assertNoError(await table.delete().eq("id", transaction_id));
  },

  async reset(
    client: SupabaseDataClient,
    session: Session | null,
  ): Promise<AppState> {
    const user = await getCurrentUser(client);
    if (!user) return emptyState(session);

    const moneyBooks = await fetchMoneyBooks(client, user.id);
    const moneyBookIds = moneyBooks.map((item) => item.id);

    if (moneyBookIds.length > 0) {
      const transactionsTable = client.from("transactions") as {
        delete(): {
          in(column: "money_book_id", values: number[]): AwaitableResult<null>;
        };
      };
      const moneyBookTable = client.from("money_book") as {
        delete(): {
          in(column: "id", values: number[]): AwaitableResult<null>;
        };
      };

      assertNoError(
        await transactionsTable.delete().in("money_book_id", moneyBookIds),
      );
      assertNoError(await moneyBookTable.delete().in("id", moneyBookIds));
    }

    const sample = await createSampleData(client, user.id);

    return {
      version: 1,
      money_book: [sample.money_book],
      transactions: [sample.transaction],
      current_money_book_id: sample.money_book.id,
      session,
    };
  },
};
