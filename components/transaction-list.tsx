import Link from "next/link";
import {
  Bus,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  Home,
  MoreHorizontal,
  ShoppingBag,
  Soup,
  Wallet,
} from "lucide-react";
import { formatShortDate } from "@/lib/date";
import { formatCurrency } from "@/lib/format";
import type { Transaction } from "@/lib/types";

const categoryIcons = {
  飲食: Soup,
  交通: Bus,
  購物: ShoppingBag,
  娛樂: Clapperboard,
  居家: Home,
  醫療: HeartPulse,
  學習: GraduationCap,
  其他: MoreHorizontal,
};

export function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line px-6 py-12 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary-strong">
          <Wallet size={22} />
        </span>
        <p className="mt-4 font-bold">還沒有任何交易</p>
        <p className="mt-1 text-sm text-muted">按下新增按鈕，記下第一筆收支。</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-line">
      {transactions.map((transaction) => {
        const Icon =
          transaction.category && categoryIcons[transaction.category]
            ? categoryIcons[transaction.category]
            : Wallet;
        return (
          <Link
            key={transaction.id}
            href={`/transactions/${transaction.id}/edit`}
            className="flex min-h-[76px] items-center gap-3 py-3 pr-16 transition hover:bg-surface/60 sm:px-2"
          >
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                transaction.type === "income"
                  ? "bg-income-soft text-income"
                  : "bg-primary-soft text-primary-strong"
              }`}
            >
              <Icon size={20} strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">
                {transaction.title}
              </span>
              <span className="mt-1 block text-xs text-muted">
                {formatShortDate(transaction.date)} ·{" "}
                {transaction.category ?? "未分類"}
              </span>
            </span>
            <span
              className={`shrink-0 text-sm font-bold tabular-nums ${
                transaction.type === "income" ? "text-income" : "text-foreground"
              }`}
            >
              {transaction.type === "income" ? "+" : "−"}
              {formatCurrency(transaction.amount)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
