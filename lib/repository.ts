import type { AppState, MoneyBookRepository } from "./types";

export const STORAGE_KEY = "save-my-money:v1";

function createEmptyState(): AppState {
  return {
    version: 1,
    money_book: [],
    transactions: [],
    current_money_book_id: null,
    session: null,
  };
}

function isValidState(value: unknown): value is AppState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<AppState>;
  return (
    state.version === 1 &&
    Array.isArray(state.money_book) &&
    Array.isArray(state.transactions) &&
    (typeof state.current_money_book_id === "number" ||
      state.current_money_book_id === null)
  );
}

let memoryState = createEmptyState();

export const localStorageRepository: MoneyBookRepository = {
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
    const state = { ...createEmptyState(), session };
    this.save(state);
    return state;
  },
};
