import { AlertCircle, CalendarDays, Coins } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { getLatestExchangeRates } from "@/lib/exchange-rates";
import { CURRENCIES, type CurrencyCode } from "@/lib/types";

const currencyLabels = new Map<CurrencyCode, string>(
  CURRENCIES.map((currency) => [currency.code, currency.label]),
);

const rateFormatter = new Intl.NumberFormat("zh-TW", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 5,
});

function formatRateDate(date: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

async function loadLatestExchangeRates() {
  try {
    return await getLatestExchangeRates();
  } catch {
    return null;
  }
}

export default async function ExchangePage() {
  const snapshot = await loadLatestExchangeRates();

  if (snapshot === null) {
    return (
      <>
        <PageHeader
          title="最新匯率"
          description="以新台幣為基準，查看常用幣別的每日參考匯率。"
        />
        <section className="rounded-[28px] border border-dashed border-line px-6 py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-expense-soft text-expense">
            <AlertCircle size={25} />
          </span>
          <h2 className="mt-4 font-bold">暫時無法取得匯率</h2>
          <p className="mt-2 text-sm text-muted">請稍後再試。</p>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="最新匯率"
        description="以新台幣為基準，查看常用幣別的每日參考匯率。"
      />

      <section className="overflow-hidden rounded-[28px] border border-line bg-white shadow-[var(--shadow)]">
        <div className="flex flex-col gap-4 bg-primary-soft px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-primary-strong">
              <Coins size={22} strokeWidth={2.1} />
            </span>
            <div>
              <p className="text-xs font-semibold text-muted">基準幣別</p>
              <p className="mt-0.5 font-bold">新台幣 (TWD)</p>
            </div>
          </div>
          <p className="flex items-center gap-2 text-xs font-semibold text-muted">
            <CalendarDays size={16} />
            資料日期：{formatRateDate(snapshot.date)}
          </p>
        </div>

        <div className="divide-y divide-line px-5 sm:px-6">
          {snapshot.rates.map((item) => (
            <div
              key={item.quote}
              className="flex items-center justify-between gap-4 py-5"
            >
              <div>
                <p className="font-bold">{currencyLabels.get(item.quote)}</p>
                <p className="mt-1 text-xs font-semibold text-muted">
                  {item.quote}
                </p>
              </div>
              <div className="text-right tabular-nums">
                <p className="text-xs font-semibold text-muted">1 TWD =</p>
                <p className="mt-1 text-lg font-bold tracking-tight">
                  {rateFormatter.format(item.rate)} {item.quote}
                </p>
              </div>
            </div>
          ))}
        </div>

        <footer className="border-t border-line bg-surface px-5 py-4 text-xs leading-5 text-muted sm:px-6">
          資料來源：
          <a
            href="https://frankfurter.dev/"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-primary-strong hover:underline"
          >
            Frankfurter
          </a>
          。此為多家央行參考匯率彙整，不等同銀行現鈔買賣價。
        </footer>
      </section>
    </>
  );
}
