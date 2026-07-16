import { afterEach, describe, expect, it, vi } from "vitest";
import { getLatestExchangeRates } from "./exchange-rates";

const validRates = [
  { date: "2026-07-17", base: "TWD", quote: "USD", rate: 0.03105 },
  { date: "2026-07-17", base: "TWD", quote: "HKD", rate: 0.2437 },
  { date: "2026-07-17", base: "TWD", quote: "JPY", rate: 5.0402 },
  { date: "2026-07-17", base: "TWD", quote: "CNY", rate: 0.21019 },
  { date: "2026-07-17", base: "TWD", quote: "EUR", rate: 0.02712 },
];

describe("getLatestExchangeRates", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches and orders the supported TWD exchange rates", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(validRates), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getLatestExchangeRates()).resolves.toEqual({
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
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.frankfurter.dev/v2/rates?base=TWD&quotes=JPY,USD,EUR,CNY,HKD",
      { next: { revalidate: 3600 } },
    );
  });

  it("rejects an unsuccessful upstream response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
    );

    await expect(getLatestExchangeRates()).rejects.toThrow(
      "Failed to fetch exchange rates: 503",
    );
  });

  it("rejects a non-JSON upstream response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("not-json", { status: 200 })),
    );

    await expect(getLatestExchangeRates()).rejects.toBeInstanceOf(Error);
  });

  it.each([
    ["a non-array payload", { rates: validRates }],
    ["a missing currency", validRates.slice(0, -1)],
    ["a duplicate currency", [...validRates, validRates[0]]],
    [
      "an unexpected currency",
      validRates.map((rate) =>
        rate.quote === "JPY" ? { ...rate, quote: "GBP" } : rate,
      ),
    ],
    [
      "a mismatched base",
      validRates.map((rate, index) =>
        index === 0 ? { ...rate, base: "USD" } : rate,
      ),
    ],
    [
      "a mismatched date",
      validRates.map((rate, index) =>
        index === 0 ? { ...rate, date: "2026-07-16" } : rate,
      ),
    ],
    [
      "an invalid date",
      validRates.map((rate) => ({ ...rate, date: "2026-02-30" })),
    ],
    [
      "a zero rate",
      validRates.map((rate, index) =>
        index === 0 ? { ...rate, rate: 0 } : rate,
      ),
    ],
    [
      "a negative rate",
      validRates.map((rate, index) =>
        index === 0 ? { ...rate, rate: -1 } : rate,
      ),
    ],
    [
      "a non-finite rate representation",
      validRates.map((rate, index) =>
        index === 0 ? { ...rate, rate: "NaN" } : rate,
      ),
    ],
  ])("rejects %s", async (_description, payload) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(payload), { status: 200 }),
      ),
    );

    await expect(getLatestExchangeRates()).rejects.toThrow(
      "Invalid exchange rate response",
    );
  });
});
