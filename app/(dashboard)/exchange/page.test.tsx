import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ExchangePage from "./page";

const mocks = vi.hoisted(() => ({
  getLatestExchangeRates: vi.fn(),
}));

vi.mock("@/lib/exchange-rates", () => ({
  getLatestExchangeRates: mocks.getLatestExchangeRates,
}));

describe("ExchangePage", () => {
  beforeEach(() => {
    mocks.getLatestExchangeRates.mockReset();
    mocks.getLatestExchangeRates.mockResolvedValue({
      base: "TWD",
      date: "2026-07-17",
      rates: [
        { quote: "JPY", rate: 5.0402 },
        { quote: "USD", rate: 0.03105 },
        { quote: "EUR", rate: 0.02712 },
        { quote: "CNY", rate: 0.21019 },
        { quote: "HKD", rate: 0.2437 },
      ],
    });
  });

  it("shows the latest TWD reference rates", async () => {
    render(await ExchangePage());

    expect(
      screen.getByRole("heading", { name: "最新匯率" }),
    ).toBeInTheDocument();
    expect(screen.getByText("基準幣別")).toBeInTheDocument();
    expect(screen.getByText("新台幣 (TWD)")).toBeInTheDocument();
    expect(screen.getByText("資料日期：2026年7月17日")).toBeInTheDocument();
    expect(screen.getAllByText("1 TWD =")).toHaveLength(5);
    expect(screen.getByText("5.0402 JPY")).toBeInTheDocument();
    expect(screen.getByText("0.03105 USD")).toBeInTheDocument();
    expect(screen.getByText("0.02712 EUR")).toBeInTheDocument();
    expect(screen.getByText("0.21019 CNY")).toBeInTheDocument();
    expect(screen.getByText("0.2437 HKD")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Frankfurter" }),
    ).toHaveAttribute("href", "https://frankfurter.dev/");
    expect(screen.getByText(/不等同銀行現鈔買賣價/)).toBeInTheDocument();
  });

  it("shows a friendly error without partial rates", async () => {
    mocks.getLatestExchangeRates.mockRejectedValue(new Error("Unavailable"));

    render(await ExchangePage());

    expect(screen.getByText("暫時無法取得匯率")).toBeInTheDocument();
    expect(screen.getByText("請稍後再試。")).toBeInTheDocument();
    expect(screen.queryByText("1 TWD =")).not.toBeInTheDocument();
  });
});
