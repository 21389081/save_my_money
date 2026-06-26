import type { CurrencyCode } from "./types";

const DEFAULT_CURRENCY_CODE: CurrencyCode = "TWD";
const CURRENCY_INPUT_PREFIX: Record<CurrencyCode, string> = {
  TWD: "NT$",
  JPY: "¥",
  USD: "US$",
  EUR: "€",
  CNY: "CN¥",
  HKD: "HK$",
};

function createCurrencyFormatter(currencyCode: CurrencyCode) {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  });
}

export function formatCurrency(
  value: number,
  currencyCode: CurrencyCode = DEFAULT_CURRENCY_CODE,
) {
  return createCurrencyFormatter(currencyCode).format(value);
}

export function formatCurrencySymbol(
  currencyCode: CurrencyCode = DEFAULT_CURRENCY_CODE,
) {
  return CURRENCY_INPUT_PREFIX[currencyCode];
}
