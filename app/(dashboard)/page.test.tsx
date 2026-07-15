import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppState, MoneyBook, Transaction } from "@/lib/types";
import DashboardPage from "./page";

const moneyBook: MoneyBook = {
  id: 1,
  name: "日常",
  how_much: 0,
  currency_code: "TWD",
  created_at: "2026-07-01T00:00:00.000Z",
};

const income: Transaction = {
  id: 1,
  money_book_id: 1,
  name: "收入",
  how_much: 1_000,
  transaction_type: "income",
  category: null,
  transaction_date: "2026-07-01",
  created_at: "2026-07-01T00:00:00.000Z",
};

function createState(
  transactions: Transaction[] = [],
  money_book: MoneyBook[] = [moneyBook],
): AppState {
  return {
    version: 1,
    money_book,
    transactions,
    current_money_book_id: money_book[0]?.id ?? null,
    session: { name: "Vincent" },
  };
}

let mockState = createState([], []);

vi.mock("@/components/providers/app-provider", () => ({
  useApp: () => ({
    state: mockState,
  }),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    mockState = createState([], []);
  });

  it("links to ledger creation when there are no ledgers", () => {
    render(<DashboardPage />);

    const link = screen.getByRole("link", { name: "建立第一本帳本" });
    expect(link).toHaveAttribute("href", "/ledgers");
  });

  it("shows the existing warning color above seventy percent usage", () => {
    mockState = createState([
      income,
      { ...income, id: 2, how_much: 800, transaction_type: "expense" },
    ]);

    render(<DashboardPage />);

    expect(screen.getByText("資金使用率")).toBeInTheDocument();
    expect(screen.getAllByText("80%")[0]).toHaveClass("text-warning");
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "80",
    );
    expect(screen.queryByText(/預算/)).not.toBeInTheDocument();
  });

  it("shows overdrawn state without usage when no funds are available", () => {
    mockState = createState([
      { ...income, id: 3, how_much: 1, transaction_type: "expense" },
    ]);

    render(<DashboardPage />);

    expect(screen.getByText(/已超支/)).toHaveClass("text-expense");
    expect(screen.queryByText("資金使用率")).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
