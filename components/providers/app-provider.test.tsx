import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppProvider, useApp } from "./app-provider";

const mockSupabase = {
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

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => mockSupabase,
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
  it("marks an empty local state as hydrated", async () => {
    localStorage.clear();

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

    expect(screen.getByRole("status").textContent).toContain(
      '"moneyBookCount":0',
    );
    expect(screen.getByRole("status").textContent).toContain(
      '"transactionCount":0',
    );
    expect(screen.getByRole("status").textContent).toContain(
      '"currentMoneyBookId":null',
    );
  });
});
