import type { Metadata } from "next";
import { TransactionForm } from "@/components/transaction-form";

export const metadata: Metadata = { title: "新增交易" };

export default function NewTransactionPage() {
  return <TransactionForm />;
}
