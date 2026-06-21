"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { LedgerSelector } from "@/components/ledger-selector";
import { TransactionList } from "@/components/transaction-list";
import { useApp } from "@/components/providers/app-provider";
import {
  calculateBalance,
  calculateBudgetProgress,
  getMonthlySummary,
} from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { toMonthKey } from "@/lib/date";

export default function DashboardPage() {
  const { state } = useApp();
  const ledger = state.ledgers.find(
    (item) => item.id === state.currentLedgerId,
  );
  if (!ledger) return null;

  const transactions = state.transactions
    .filter((item) => item.ledgerId === ledger.id)
    .sort((a, b) => {
      const dateOrder = b.date.localeCompare(a.date);
      return dateOrder || b.createdAt.localeCompare(a.createdAt);
    });
  const balance = calculateBalance(ledger, transactions);
  const progress = calculateBudgetProgress(ledger, transactions);
  const monthly = getMonthlySummary(transactions, toMonthKey());
  const visualPercentage = Math.min(progress.percentage, 100);

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted">早安，{state.session?.name}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.035em]">
            今天也好好生活
          </h1>
        </div>
        <LedgerSelector />
      </header>

      <section className="mt-8 overflow-hidden rounded-[28px] bg-primary-soft p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-primary-strong">目前餘額</p>
            <p className="mt-2 text-[clamp(2.15rem,8vw,3.8rem)] font-bold leading-none tracking-[-0.055em] tabular-nums">
              {formatCurrency(balance)}
            </p>
          </div>
          <div
            className={`rounded-2xl px-3 py-2 text-xs font-bold ${
              progress.isOverBudget
                ? "bg-expense-soft text-expense"
                : "bg-white text-income"
            }`}
          >
            {progress.isOverBudget
              ? `已超支 ${formatCurrency(progress.spent - ledger.initialBudget)}`
              : `還可使用 ${formatCurrency(Math.max(ledger.initialBudget - progress.spent, 0))}`}
          </div>
        </div>
        <div className="mt-8">
          <div className="mb-2 flex justify-between text-xs font-semibold">
            <span className="text-muted">預算使用進度</span>
            <span>{progress.percentage.toFixed(0)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${
                progress.isOverBudget ? "bg-expense" : "bg-primary"
              }`}
              style={{ width: `${visualPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            已支出 {formatCurrency(progress.spent)}／預算{" "}
            {formatCurrency(ledger.initialBudget)}
          </p>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-line p-4 sm:p-5">
          <span className="grid size-9 place-items-center rounded-xl bg-income-soft text-income">
            <ArrowDownLeft size={18} />
          </span>
          <p className="mt-4 text-xs font-semibold text-muted">本月收入</p>
          <p className="mt-1 text-lg font-bold text-income tabular-nums">
            {formatCurrency(monthly.income)}
          </p>
        </div>
        <div className="rounded-3xl border border-line p-4 sm:p-5">
          <span className="grid size-9 place-items-center rounded-xl bg-expense-soft text-expense">
            <ArrowUpRight size={18} />
          </span>
          <p className="mt-4 text-xs font-semibold text-muted">本月支出</p>
          <p className="mt-1 text-lg font-bold tabular-nums">
            {formatCurrency(monthly.expense)}
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
        <TransactionList transactions={transactions.slice(0, 8)} />
      </section>
    </>
  );
}
