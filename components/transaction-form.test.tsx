import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TransactionForm } from "./transaction-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn(),
  }),
}));

vi.mock("@/components/providers/app-provider", () => ({
  useApp: () => ({
    state: {
      version: 1,
      money_book: [],
      transactions: [],
      current_money_book_id: null,
      session: { name: "Vincent" },
    },
    addTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
  }),
}));

describe("TransactionForm", () => {
  it("links to ledger creation when there are no ledgers", () => {
    render(<TransactionForm />);

    const link = screen.getByRole("link", { name: "建立第一本帳本" });
    expect(link).toHaveAttribute("href", "/ledgers");
  });
});
