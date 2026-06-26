export const CATEGORIES = [
  "飲食",
  "交通",
  "購物",
  "娛樂",
  "居家",
  "醫療",
  "學習",
  "其他",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type TransactionType = "income" | "expense";

export interface MoneyBook {
  id: number;
  name: string;
  how_much: number;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  currency_code?: string;
}

export interface Transaction {
  id: number;
  money_book_id: number;
  name: string;
  how_much: number;
  transaction_type: TransactionType;
  category: Category | null;
  transaction_date: string;
  created_at: string;
  update_at?: string;
}

export interface Session {
  name: string;
}

export interface AppState {
  version: 1;
  money_book: MoneyBook[];
  transactions: Transaction[];
  current_money_book_id: number | null;
  session: Session | null;
}
