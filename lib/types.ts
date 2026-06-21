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

export interface Ledger {
  id: string;
  name: string;
  initialBudget: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  ledgerId: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: Category | null;
  date: string;
  createdAt: string;
}

export interface Session {
  name: string;
}

export interface AppState {
  version: 1;
  ledgers: Ledger[];
  transactions: Transaction[];
  currentLedgerId: string;
  session: Session | null;
}

export interface LedgerRepository {
  load(): AppState;
  save(state: AppState): void;
  reset(session?: Session | null): AppState;
}
