"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { appReducer } from "@/lib/app-state";
import { localStorageRepository } from "@/lib/repository";
import type { AppState, Ledger, Session, Transaction } from "@/lib/types";

interface AppContextValue {
  state: AppState;
  hydrated: boolean;
  setSession(session: Session | null): void;
  selectLedger(ledgerId: string): void;
  addLedger(ledger: Ledger): void;
  deleteLedger(ledgerId: string): void;
  addTransaction(transaction: Transaction): void;
  updateTransaction(transaction: Transaction): void;
  deleteTransaction(transactionId: string): void;
  resetData(): void;
}

const initialState: AppState = {
  version: 1,
  ledgers: [],
  transactions: [],
  currentLedgerId: "",
  session: null,
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const hydrated = state.ledgers.length > 0;

  useEffect(() => {
    dispatch({ type: "hydrate", state: localStorageRepository.load() });
  }, []);

  useEffect(() => {
    if (hydrated) localStorageRepository.save(state);
  }, [hydrated, state]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      hydrated,
      setSession: (session) => dispatch({ type: "session/set", session }),
      selectLedger: (ledgerId) =>
        dispatch({ type: "ledger/select", ledgerId }),
      addLedger: (ledger) => dispatch({ type: "ledger/add", ledger }),
      deleteLedger: (ledgerId) =>
        dispatch({ type: "ledger/delete", ledgerId }),
      addTransaction: (transaction) =>
        dispatch({ type: "transaction/add", transaction }),
      updateTransaction: (transaction) =>
        dispatch({ type: "transaction/update", transaction }),
      deleteTransaction: (transactionId) =>
        dispatch({ type: "transaction/delete", transactionId }),
      resetData: () =>
        dispatch({
          type: "hydrate",
          state: localStorageRepository.reset(state.session),
        }),
    }),
    [hydrated, state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
