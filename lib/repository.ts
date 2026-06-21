import { toLocalDateInput } from "./date";
import type { AppState, LedgerRepository } from "./types";

export const STORAGE_KEY = "save-my-money:v1";

function createDemoState(): AppState {
  const now = new Date();
  const today = toLocalDateInput(now);
  const earlier = new Date(now);
  earlier.setDate(Math.max(1, now.getDate() - 2));
  const earlierDate = toLocalDateInput(earlier);
  const createdAt = now.toISOString();

  return {
    version: 1,
    ledgers: [
      {
        id: "ledger-daily",
        name: "日常生活",
        initialBudget: 30_000,
        createdAt,
      },
      {
        id: "ledger-japan",
        name: "日本行",
        initialBudget: 50_000,
        createdAt,
      },
    ],
    transactions: [
      {
        id: "demo-1",
        ledgerId: "ledger-daily",
        title: "早餐",
        amount: 85,
        type: "expense",
        category: "飲食",
        date: today,
        createdAt,
      },
      {
        id: "demo-2",
        ledgerId: "ledger-daily",
        title: "捷運",
        amount: 50,
        type: "expense",
        category: "交通",
        date: today,
        createdAt,
      },
      {
        id: "demo-3",
        ledgerId: "ledger-daily",
        title: "接案收入",
        amount: 6_800,
        type: "income",
        category: null,
        date: earlierDate,
        createdAt,
      },
      {
        id: "demo-4",
        ledgerId: "ledger-daily",
        title: "電影票",
        amount: 320,
        type: "expense",
        category: "娛樂",
        date: earlierDate,
        createdAt,
      },
    ],
    currentLedgerId: "ledger-daily",
    session: null,
  };
}

function isValidState(value: unknown): value is AppState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<AppState>;
  return (
    state.version === 1 &&
    Array.isArray(state.ledgers) &&
    state.ledgers.length > 0 &&
    Array.isArray(state.transactions) &&
    typeof state.currentLedgerId === "string"
  );
}

let memoryState = createDemoState();

export const localStorageRepository: LedgerRepository = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isValidState(parsed)) {
          memoryState = parsed;
          return parsed;
        }
      }
    } catch {
      return this.reset(memoryState.session);
    }
    return this.reset();
  },
  save(state) {
    memoryState = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // The in-memory copy keeps the current session usable.
    }
  },
  reset(session = null) {
    const state = { ...createDemoState(), session };
    this.save(state);
    return state;
  },
};
