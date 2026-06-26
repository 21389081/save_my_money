import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppProvider, useApp } from "./app-provider";

const mocks = vi.hoisted(() => {
  const supabase = {
    auth: {
      getUser: vi.fn(async () => ({
        data: {
          user: {
            id: "user-1",
            email: "vincent@example.com",
            user_metadata: { name: "Vincent" },
          },
        },
        error: null,
      })),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
    },
  };

  return {
    supabase,
    load: vi.fn(async () => ({
      version: 1,
      money_book: [
        {
          id: 1,
          name: "測試帳本",
          how_much: 30_000,
          created_at: "2026-06-26T01:00:00.000Z",
        },
      ],
      transactions: [
        {
          id: 10,
          money_book_id: 1,
          name: "測試早餐",
          how_much: 85,
          transaction_type: "expense",
          category: "飲食",
          transaction_date: "2026-06-26",
          created_at: "2026-06-26T02:00:00.000Z",
        },
      ],
      current_money_book_id: 1,
      session: { name: "Vincent" },
    })),
  };
});

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => mocks.supabase,
}));

vi.mock("@/lib/supabase/repository", () => ({
  supabaseRepository: {
    emptyState: (session: { name: string } | null) => ({
      version: 1,
      money_book: [],
      transactions: [],
      current_money_book_id: null,
      session,
    }),
    load: mocks.load,
  },
}));

function Probe() {
  const { hydrated, authChecked, state } = useApp();

  return (
    <output>
      {JSON.stringify({
        hydrated,
        authChecked,
        moneyBookCount: state.money_book.length,
        transactionCount: state.transactions.length,
        currentMoneyBookId: state.current_money_book_id,
        sessionName: state.session?.name ?? null,
      })}
    </output>
  );
}

describe("AppProvider", () => {
  it("hydrates app data from Supabase after auth is checked", async () => {
    render(
      <AppProvider>
        <Probe />
      </AppProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toContain(
        '"hydrated":true',
      );
    });

    expect(mocks.load).toHaveBeenCalledWith(mocks.supabase, {
      name: "Vincent",
    });
    expect(screen.getByRole("status").textContent).toContain(
      '"moneyBookCount":1',
    );
    expect(screen.getByRole("status").textContent).toContain(
      '"transactionCount":1',
    );
    expect(screen.getByRole("status").textContent).toContain(
      '"currentMoneyBookId":1',
    );
  });
});
