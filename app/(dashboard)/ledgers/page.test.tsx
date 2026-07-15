import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { formatCurrency } from "@/lib/format";
import type { AppState, MoneyBook, Transaction } from "@/lib/types";
import MoneyBookPage from "./page";

const addMoneyBook = vi.fn();
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
  money_book: MoneyBook[] = [],
): AppState {
  return {
    version: 1,
    money_book,
    transactions,
    current_money_book_id: money_book[0]?.id ?? null,
    session: { name: "Vincent" },
  };
}

let mockState = createState();

vi.mock("@/components/providers/app-provider", () => ({
  useApp: () => ({
    state: mockState,
    addMoneyBook,
    deleteMoneyBook: vi.fn(),
    selectMoneyBook: vi.fn(),
  }),
}));

describe("MoneyBookPage", () => {
  beforeEach(() => {
    mockState = createState();
    addMoneyBook.mockClear();
  });

  it("creates a money book with a zero initial value and selected currency", async () => {
    const user = userEvent.setup();
    render(<MoneyBookPage />);

    await user.click(screen.getByRole("button", { name: /新增/ }));
    await user.type(screen.getByLabelText(/帳本名稱/), "旅行");
    expect(screen.getByLabelText(/初始值/)).toHaveValue(0);
    await user.selectOptions(screen.getByLabelText(/幣值/), "USD");
    await user.click(screen.getByRole("button", { name: /建立帳本/ }));

    expect(addMoneyBook).toHaveBeenCalledWith({
      name: "旅行",
      how_much: 0,
      currency_code: "USD",
    });
  });

  it("uses the warning color for high usage in the money book list", () => {
    mockState = createState(
      [
        income,
        { ...income, id: 2, how_much: 800, transaction_type: "expense" },
      ],
      [moneyBook],
    );

    render(<MoneyBookPage />);

    expect(screen.getByText("資金使用率")).toBeInTheDocument();
    expect(screen.getByText("80%")).toHaveClass("text-warning");
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "80",
    );
    expect(screen.getByText(/初始值/)).toBeInTheDocument();
    expect(screen.queryByText(/預算/)).not.toBeInTheDocument();
  });

  it("shows overdrawn state without a usage bar when no funds are available", () => {
    mockState = createState(
      [{ ...income, id: 3, how_much: 1, transaction_type: "expense" }],
      [moneyBook],
    );

    render(<MoneyBookPage />);

    expect(screen.getByText(formatCurrency(-1, "TWD"))).toHaveClass(
      "text-expense",
    );
    expect(screen.getByText(/已超支/)).toHaveClass("text-expense");
    expect(screen.queryByText("資金使用率")).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
