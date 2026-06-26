"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Check, ChevronLeft, Trash2 } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { toLocalDateInput } from "@/lib/date";
import {
  CATEGORIES,
  type Category,
  type Transaction,
  type TransactionType,
} from "@/lib/types";
import { validateTransaction } from "@/lib/validation";

export function TransactionForm({ existing }: { existing?: Transaction }) {
  const router = useRouter();
  const { state, addTransaction, updateTransaction, deleteTransaction } =
    useApp();
  const [transactionType, setTransactionType] = useState<TransactionType>(
    existing?.transaction_type ?? "expense",
  );
  const [name, setName] = useState(existing?.name ?? "");
  const [howMuch, setHowMuch] = useState(
    existing ? String(existing.how_much) : "",
  );
  const [category, setCategory] = useState<Category | "">(
    existing?.category ?? "",
  );
  const [transactionDate, setTransactionDate] = useState(
    existing?.transaction_date ?? toLocalDateInput(),
  );
  const [errors, setErrors] = useState<ReturnType<typeof validateTransaction>>(
    {},
  );
  const [saved, setSaved] = useState(false);

  if (!existing && state.money_book.length === 0) {
    return (
      <section className="mx-auto grid min-h-[60vh] max-w-xl place-items-center text-center">
        <div className="max-w-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary-strong">
            <BookOpen size={25} />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-[-0.035em]">
            先建立一本帳本
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            新增交易前需要先有一本帳本，這樣每筆收支才有地方歸檔。
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

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericHowMuch = Number(howMuch);
    const nextErrors = validateTransaction(
      {
        name,
        how_much: numericHowMuch,
        transaction_date: transactionDate,
      },
      toLocalDateInput(),
    );
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const money_book_id =
      existing?.money_book_id ??
      state.current_money_book_id ??
      state.money_book[0]?.id;

    if (typeof money_book_id !== "number") return;

    const transaction = {
      money_book_id,
      name: name.trim(),
      how_much: numericHowMuch,
      transaction_type: transactionType,
      category:
        transactionType === "expense" && category ? category : null,
      transaction_date: transactionDate,
    };

    if (existing) {
      await updateTransaction({
        ...transaction,
        id: existing.id,
        created_at: existing.created_at,
        update_at: existing.update_at,
      });
    } else {
      await addTransaction(transaction);
    }
    setSaved(true);
    window.setTimeout(() => router.push("/"), 450);
  };

  const remove = () => {
    if (!existing) return;
    if (window.confirm(`確定要刪除「${existing.name}」嗎？`)) {
      void deleteTransaction(existing.id);
      router.push("/");
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="grid size-11 place-items-center rounded-2xl border border-line text-muted transition hover:bg-surface"
          aria-label="返回"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-lg font-bold">
          {existing ? "編輯交易" : "新增交易"}
        </h1>
        {existing ? (
          <button
            type="button"
            onClick={remove}
            aria-label="刪除交易"
            className="grid size-11 place-items-center rounded-2xl bg-expense-soft text-expense"
          >
            <Trash2 size={19} />
          </button>
        ) : (
          <span className="size-11" />
        )}
      </header>

      <form onSubmit={submit} className="space-y-7">
        <fieldset>
          <legend className="sr-only">收支類型</legend>
          <div className="grid grid-cols-2 rounded-2xl bg-surface p-1">
            {(["expense", "income"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTransactionType(value)}
                className={`min-h-12 rounded-xl text-sm font-bold transition ${
                  transactionType === value
                    ? value === "income"
                      ? "bg-white text-income shadow-sm"
                      : "bg-white text-expense shadow-sm"
                    : "text-muted"
                }`}
              >
                {value === "expense" ? "支出" : "收入"}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-2 block text-sm font-bold">條目</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="例如：午餐、薪水"
            autoFocus
            className="min-h-14 w-full rounded-2xl border border-line bg-white px-4 text-base outline-none transition focus:border-primary"
          />
          {errors.name ? (
            <span className="mt-2 block text-xs font-semibold text-expense">
              {errors.name}
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold">金額</span>
          <span className="flex min-h-16 items-center rounded-2xl border border-line px-4 focus-within:border-primary">
            <span className="mr-2 text-xl font-bold text-muted">NT$</span>
            <input
              value={howMuch}
              onChange={(event) => setHowMuch(event.target.value)}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              placeholder="0"
              className="min-w-0 flex-1 bg-transparent text-3xl font-bold tracking-tight outline-none"
            />
          </span>
          {errors.how_much ? (
            <span className="mt-2 block text-xs font-semibold text-expense">
              {errors.how_much}
            </span>
          ) : null}
        </label>

        {transactionType === "expense" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              分類 <span className="font-normal text-muted">（可不選）</span>
            </span>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as Category | "")
              }
              className="min-h-14 w-full rounded-2xl border border-line bg-white px-4 text-sm font-semibold outline-none focus:border-primary"
            >
              <option value="">未分類</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-bold">交易日期</span>
          <input
            value={transactionDate}
            onChange={(event) => setTransactionDate(event.target.value)}
            type="date"
            max={toLocalDateInput()}
            className="min-h-14 w-full rounded-2xl border border-line bg-white px-4 text-sm font-semibold outline-none focus:border-primary"
          />
          {errors.transaction_date ? (
            <span className="mt-2 block text-xs font-semibold text-expense">
              {errors.transaction_date}
            </span>
          ) : null}
        </label>

        <button
          type="submit"
          className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white shadow-[0_12px_28px_rgba(36,120,184,.22)] transition ${
            saved ? "bg-income" : "bg-primary-strong hover:bg-[#1d6da9]"
          }`}
        >
          {saved ? (
            <>
              <Check size={20} /> 已儲存
            </>
          ) : existing ? (
            "儲存變更"
          ) : (
            "加入帳本"
          )}
        </button>
      </form>
    </div>
  );
}
