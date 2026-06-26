import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardPage from "./page";

vi.mock("@/components/providers/app-provider", () => ({
  useApp: () => ({
    state: {
      version: 1,
      money_book: [],
      transactions: [],
      current_money_book_id: null,
      session: { name: "Vincent" },
    },
  }),
}));

describe("DashboardPage", () => {
  it("links to ledger creation when there are no ledgers", () => {
    render(<DashboardPage />);

    const link = screen.getByRole("link", { name: "建立第一本帳本" });
    expect(link).toHaveAttribute("href", "/ledgers");
  });
});
