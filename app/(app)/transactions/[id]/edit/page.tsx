"use client";

import { useParams } from "next/navigation";
import { TransactionForm } from "@/components/transaction-form";
import { useApp } from "@/components/providers/app-provider";

export default function EditTransactionPage() {
  const params = useParams<{ id: string }>();
  const { state } = useApp();
  const transaction = state.transactions.find((item) => item.id === params.id);

  if (!transaction) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">找不到這筆交易</h1>
        <p className="mt-2 text-sm text-muted">它可能已經被刪除。</p>
      </div>
    );
  }

  return <TransactionForm existing={transaction} />;
}
