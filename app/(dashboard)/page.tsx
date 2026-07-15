"use client";

import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { MoneyBookSelector } from "@/components/money-book-selector";
import { TransactionList } from "@/components/transaction-list";
import { useApp } from "@/components/providers/app-provider";
import {
  calculateMoneyBookSummary,
  getMonthlySummary,
} from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { toMonthKey } from "@/lib/date";

export default function DashboardPage() {
  const { state } = useApp();
  const money_book = state.money_book.find(
    (item) => item.id === state.current_money_book_id,
  );

  if (!money_book) {
    return (
      <section className="grid min-h-[60vh] place-items-center text-center">
        <div className="max-w-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary-strong">
            <BookOpen size={25} />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-[-0.035em]">
            先建立一本帳本
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            目前沒有帳本資料。建立第一本帳本後，就可以開始新增收支紀錄。
          </p>
          <Link
            href="/ledgers"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary-strong px-5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(36,120,184,.2)]"
          >
            建立第一本帳本
          </Link>
        </div>
      </section>
    );
  }

  const transactions = state.transactions
    .filter((item) => item.money_book_id === money_book.id)
    .sort((a, b) => {
      const dateOrder = b.transaction_date.localeCompare(a.transaction_date);
      return dateOrder || b.created_at.localeCompare(a.created_at);
    });
  const summary = calculateMoneyBookSummary(money_book, transactions);
  const monthly = getMonthlySummary(transactions, toMonthKey());
  const visualPercentage =
    summary.percentage === null ? 0 : Math.min(summary.percentage, 100);
  const currencyCode = money_book.currency_code;

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted">早安，{state.session?.name}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.035em]">
            錢沒有不見，只是變成你喜歡的樣子。
          </h1>
        </div>
        <MoneyBookSelector />
      </header>

      <section className="mt-8 overflow-hidden rounded-[28px] bg-primary-soft p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-primary-strong">
              目前餘額
            </p>
            <p
              className={`mt-2 text-[clamp(2.15rem,8vw,3.8rem)] font-bold leading-none tracking-[-0.055em] tabular-nums ${
                summary.status === "overdrawn" ? "text-expense" : ""
              }`}
            >
              {formatCurrency(summary.balance, currencyCode)}
            </p>
          </div>
          {summary.status !== "unavailable" ? (
            <div
              className={`rounded-2xl px-3 py-2 text-xs font-bold ${
                summary.status === "overdrawn"
                  ? "bg-expense-soft text-expense"
                  : summary.status === "warning"
                    ? "bg-white text-warning"
                    : "bg-white text-income"
              }`}
            >
              {summary.status === "overdrawn" ? (
                `已超支 ${formatCurrency(Math.abs(summary.balance), currencyCode)}`
              ) : (
                <>
                  已使用{" "}
                  <span
                    className={
                      summary.status === "warning"
                        ? "text-warning"
                        : "text-income"
                    }
                  >
                    {summary.percentage?.toFixed(0)}%
                  </span>
                </>
              )}
            </div>
          ) : null}
        </div>
        {summary.percentage !== null ? (
          <div className="mt-8">
            <div className="mb-2 flex justify-between text-xs font-semibold">
              <span className="text-muted">資金使用率</span>
              <span
                className={
                  summary.status === "overdrawn"
                    ? "text-expense"
                    : summary.status === "warning"
                      ? "text-warning"
                      : ""
                }
              >
                {summary.percentage.toFixed(0)}%
              </span>
            </div>
            <div
              aria-label="資金使用率"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={visualPercentage}
              className="h-2 overflow-hidden rounded-full bg-white"
              role="progressbar"
            >
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${
                  summary.status === "overdrawn"
                    ? "bg-expense"
                    : summary.status === "warning"
                      ? "bg-warning"
                      : "bg-primary"
                }`}
                style={{ width: `${visualPercentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              已支出 {formatCurrency(summary.spent, currencyCode)}，可用總額{" "}
              {formatCurrency(summary.available, currencyCode)}
            </p>
          </div>
        ) : null}
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-line p-4 sm:p-5">
          <span className="grid size-9 place-items-center rounded-xl bg-income-soft text-income">
            <ArrowDownLeft size={18} />
          </span>
          <p className="mt-4 text-xs font-semibold text-muted">本月收入</p>
          <p className="mt-1 text-lg font-bold text-income tabular-nums">
            {formatCurrency(monthly.income, currencyCode)}
          </p>
        </div>
        <div className="rounded-3xl border border-line p-4 sm:p-5">
          <span className="grid size-9 place-items-center rounded-xl bg-expense-soft text-expense">
            <ArrowUpRight size={18} />
          </span>
          <p className="mt-4 text-xs font-semibold text-muted">本月支出</p>
          <p className="mt-1 text-lg font-bold tabular-nums">
            {formatCurrency(monthly.expense, currencyCode)}
          </p>
        </div>
      </section>

      <section className="mt-9">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">最近交易</h2>
          <Link
            href="/stats"
            className="flex min-h-11 items-center gap-1 text-sm font-semibold text-primary-strong"
          >
            查看統計 <ChevronRight size={17} />
          </Link>
        </div>
        <TransactionList
          transactions={transactions.slice(0, 8)}
          currencyCode={currencyCode}
        />
      </section>
    </>
  );
}
