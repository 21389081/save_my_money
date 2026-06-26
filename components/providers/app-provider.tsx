"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import {
  createSessionFromSupabaseUser,
  getSessionFromSupabase,
} from "@/lib/auth/session";
import { appReducer, type AppAction } from "@/lib/app-state";
import { localStorageRepository } from "@/lib/repository";
import { createClient } from "@/lib/supabase/client";
import type { AppState, MoneyBook, Session, Transaction } from "@/lib/types";

interface AppContextValue {
  state: AppState;
  hydrated: boolean;
  authChecked: boolean;
  setSession(session: Session | null): void;
  selectMoneyBook(money_book_id: number): void;
  addMoneyBook(money_book: MoneyBook): void;
  deleteMoneyBook(money_book_id: number): void;
  addTransaction(transaction: Transaction): void;
  updateTransaction(transaction: Transaction): void;
  deleteTransaction(transaction_id: number): void;
  resetData(): void;
}

const initialState: AppState = {
  version: 1,
  money_book: [],
  transactions: [],
  current_money_book_id: null,
  session: null,
};

interface ProviderState {
  app: AppState;
  hydrated: boolean;
}

function providerReducer(state: ProviderState, action: AppAction): ProviderState {
  if (action.type === "hydrate") {
    return { app: action.state, hydrated: true };
  }

  return {
    ...state,
    app: appReducer(state.app, action),
  };
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [providerState, dispatch] = useReducer(providerReducer, {
    app: initialState,
    hydrated: false,
  });
  const [authChecked, setAuthChecked] = useState(false);
  const state = providerState.app;
  const hydrated = providerState.hydrated;

  useEffect(() => {
    dispatch({ type: "hydrate", state: localStorageRepository.load() });
  }, []);

  useEffect(() => {
    if (hydrated) localStorageRepository.save(state);
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated) return;

    let active = true;
    const supabase = createClient();

    async function syncSession() {
      const session = await getSessionFromSupabase(supabase);
      if (!active) return;

      dispatch({ type: "session/set", session });
      setAuthChecked(true);
    }

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      dispatch({
        type: "session/set",
        session: session?.user
          ? createSessionFromSupabaseUser(session.user)
          : null,
      });
      setAuthChecked(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [hydrated]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      hydrated,
      authChecked,
      setSession: (session) => dispatch({ type: "session/set", session }),
      selectMoneyBook: (money_book_id) =>
        dispatch({ type: "money_book/select", money_book_id }),
      addMoneyBook: (money_book) =>
        dispatch({ type: "money_book/add", money_book }),
      deleteMoneyBook: (money_book_id) =>
        dispatch({ type: "money_book/delete", money_book_id }),
      addTransaction: (transaction) =>
        dispatch({ type: "transaction/add", transaction }),
      updateTransaction: (transaction) =>
        dispatch({ type: "transaction/update", transaction }),
      deleteTransaction: (transaction_id) =>
        dispatch({ type: "transaction/delete", transaction_id }),
      resetData: () =>
        dispatch({
          type: "hydrate",
          state: localStorageRepository.reset(state.session),
        }),
    }),
    [authChecked, hydrated, state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
