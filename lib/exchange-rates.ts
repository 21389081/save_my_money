import "server-only";

import { CURRENCIES, type CurrencyCode } from "./types";

const BASE_CURRENCY = "TWD" as const;
type ExchangeQuote = Exclude<CurrencyCode, typeof BASE_CURRENCY>;

const QUOTE_CURRENCIES = CURRENCIES.map((currency) => currency.code).filter(
  (code): code is ExchangeQuote => code !== BASE_CURRENCY,
);
const EXCHANGE_RATES_URL = `https://api.frankfurter.dev/v2/rates?base=${BASE_CURRENCY}&quotes=${QUOTE_CURRENCIES.join(",")}`;

export interface ExchangeRate {
  quote: ExchangeQuote;
  rate: number;
}

export interface ExchangeRateSnapshot {
  base: typeof BASE_CURRENCY;
  date: string;
  rates: ExchangeRate[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isExchangeQuote(value: unknown): value is ExchangeQuote {
  return (
    typeof value === "string" &&
    (QUOTE_CURRENCIES as readonly string[]).includes(value)
  );
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function parseExchangeRateSnapshot(value: unknown): ExchangeRateSnapshot {
  if (!Array.isArray(value) || value.length !== QUOTE_CURRENCIES.length) {
    throw new Error("Invalid exchange rate response");
  }

  let date: string | null = null;
  const rates = new Map<ExchangeQuote, number>();

  for (const item of value) {
    if (
      !isRecord(item) ||
      item.base !== BASE_CURRENCY ||
      !isExchangeQuote(item.quote) ||
      !isIsoDate(item.date) ||
      typeof item.rate !== "number" ||
      !Number.isFinite(item.rate) ||
      item.rate <= 0 ||
      rates.has(item.quote)
    ) {
      throw new Error("Invalid exchange rate response");
    }

    if (date !== null && item.date !== date) {
      throw new Error("Invalid exchange rate response");
    }

    date = item.date;
    rates.set(item.quote, item.rate);
  }

  if (date === null || QUOTE_CURRENCIES.some((quote) => !rates.has(quote))) {
    throw new Error("Invalid exchange rate response");
  }

  return {
    base: BASE_CURRENCY,
    date,
    rates: QUOTE_CURRENCIES.map((quote) => ({
      quote,
      rate: rates.get(quote)!,
    })),
  };
}

export async function getLatestExchangeRates(): Promise<ExchangeRateSnapshot> {
  const response = await fetch(EXCHANGE_RATES_URL, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch exchange rates: ${response.status}`);
  }

  return parseExchangeRateSnapshot(await response.json());
}
