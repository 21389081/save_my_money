"use client";

import { useParams } from "next/navigation";
import { TransactionForm } from "@/components/transaction-form";
import { useApp } from "@/components/providers/app-provider";

export default function EditTransactionPage() {
  const params = useParams<{ id: string }>();
  const { state } = useApp();
  const transaction_id = Number(params.id);
  const transaction = state.transactions.find(
    (item) => item.id === transaction_id,
  );

  if (!transaction) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">找不到這筆交易</h1>
        <p className="mt-2 text-sm text-muted">可能已經被刪除或不存在。</p>
      </div>
    );
  }

  return <TransactionForm existing={transaction} />;
}
