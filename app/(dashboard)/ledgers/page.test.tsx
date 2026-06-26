import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MoneyBookPage from "./page";

const addMoneyBook = vi.fn();

vi.mock("@/components/providers/app-provider", () => ({
  useApp: () => ({
    state: {
      version: 1,
      money_book: [],
      transactions: [],
      current_money_book_id: null,
      session: { name: "Vincent" },
    },
    addMoneyBook,
    deleteMoneyBook: vi.fn(),
    selectMoneyBook: vi.fn(),
  }),
}));

describe("MoneyBookPage", () => {
  it("creates a money book with the selected currency code", async () => {
    const user = userEvent.setup();
    render(<MoneyBookPage />);

    await user.click(screen.getByRole("button", { name: /新增/ }));
    await user.type(screen.getByLabelText(/帳本名稱/), "旅行");
    await user.type(screen.getByLabelText(/預算/), "10000");
    await user.selectOptions(screen.getByLabelText(/幣值/), "USD");
    await user.click(screen.getByRole("button", { name: /建立帳本/ }));

    expect(addMoneyBook).toHaveBeenCalledWith({
      name: "旅行",
      how_much: 10_000,
      currency_code: "USD",
    });
  });
});
