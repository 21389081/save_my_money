"use client";

import { ChevronDown } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";

export function MoneyBookSelector() {
  const { state, selectMoneyBook } = useApp();

  return (
    <label className="relative inline-flex max-w-full items-center">
      <span className="sr-only">選擇帳本</span>
      <select
        value={state.current_money_book_id ?? ""}
        onChange={(event) => selectMoneyBook(Number(event.target.value))}
        className="min-h-11 max-w-full appearance-none rounded-2xl border border-line bg-white py-2 pl-4 pr-10 text-sm font-bold text-foreground shadow-sm"
      >
        {state.money_book.map((money_book) => (
          <option key={money_book.id} value={money_book.id}>
            {money_book.name}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        size={17}
        className="pointer-events-none absolute right-3 text-muted"
      />
    </label>
  );
}
