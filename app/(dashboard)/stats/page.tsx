"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  PieChart as PieChartIcon,
} from "lucide-react";
import { ExpenseChart, expenseChartColors } from "@/components/expense-chart";
import { MoneyBookSelector } from "@/components/money-book-selector";
import { PageHeader } from "@/components/page-header";
import { useApp } from "@/components/providers/app-provider";
import { formatMonth, shiftMonth, toMonthKey } from "@/lib/date";
import { getMonthlyCategoryBreakdown } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";

export default function StatsPage() {
  const { state } = useApp();
  const currentMonth = toMonthKey();
  const [month, setMonth] = useState(currentMonth);
  const transactions = state.transactions.filter(
    (item) => item.money_book_id === state.current_money_book_id,
  );
  const breakdown = getMonthlyCategoryBreakdown(transactions, month);
  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <PageHeader
        title="支出統計"
        description="看看這個月份的支出集中在哪些分類。"
        action={<MoneyBookSelector />}
      />

      <div className="flex items-center justify-between rounded-2xl bg-surface p-2">
        <button
          type="button"
          onClick={() => setMonth((value) => shiftMonth(value, -1))}
          className="grid size-11 place-items-center rounded-xl text-muted hover:bg-white"
          aria-label="上一個月"
        >
          <ChevronLeft size={20} />
        </button>
        <p className="text-sm font-bold">{formatMonth(month)}</p>
        <button
          type="button"
          disabled={month >= currentMonth}
          onClick={() => setMonth((value) => shiftMonth(value, 1))}
          className="grid size-11 place-items-center rounded-xl text-muted hover:bg-white disabled:opacity-30"
          aria-label="下一個月"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {breakdown.length > 0 ? (
        <>
          <section className="mt-7 rounded-[28px] border border-line p-4 sm:p-6">
            <ExpenseChart data={breakdown} />
          </section>
          <section className="mt-8">
            <h2 className="text-lg font-bold">分類明細</h2>
            <div className="mt-3 divide-y divide-line">
              {breakdown.map((item, index) => {
                const percentage = (item.amount / total) * 100;
                return (
                  <div
                    key={item.category}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-4"
                  >
                    <span
                      className="size-3 rounded-full"
                      style={{
                        backgroundColor:
                          expenseChartColors[index % expenseChartColors.length],
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex justify-between gap-3">
                        <span className="text-sm font-bold">
                          {item.category}
                        </span>
                        <span className="text-xs font-semibold text-muted">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor:
                              expenseChartColors[
                                index % expenseChartColors.length
                              ],
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold tabular-nums">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <section className="mt-7 rounded-[28px] border border-dashed border-line px-6 py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary-strong">
            <PieChartIcon size={25} />
          </span>
          <h2 className="mt-4 font-bold">這個月份還沒有支出</h2>
          <p className="mt-2 text-sm text-muted">
            新增支出交易後，就能看到分類統計。
          </p>
        </section>
      )}
    </>
  );
}
