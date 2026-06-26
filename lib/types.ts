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

export const CURRENCIES = [
  { code: "TWD", label: "新台幣" },
  { code: "JPY", label: "日圓" },
  { code: "USD", label: "美元" },
  { code: "EUR", label: "歐元" },
  { code: "CNY", label: "人民幣" },
  { code: "HKD", label: "港幣" },
] as const;

export type Category = (typeof CATEGORIES)[number];
export type CurrencyCode = (typeof CURRENCIES)[number]["code"];
export type TransactionType = "income" | "expense";

export interface MoneyBook {
  id: number;
  name: string;
  how_much: number;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  currency_code?: CurrencyCode;
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
