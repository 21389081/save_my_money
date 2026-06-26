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
import { createClient } from "@/lib/supabase/client";
import { supabaseRepository } from "@/lib/supabase/repository";
import type { AppState, MoneyBook, Session, Transaction } from "@/lib/types";

type MoneyBookInput = Pick<MoneyBook, "name" | "how_much"> &
  Partial<Pick<MoneyBook, "currency_code">>;
type TransactionInput = Omit<Transaction, "id" | "created_at" | "update_at">;

interface AppContextValue {
  state: AppState;
  hydrated: boolean;
  authChecked: boolean;
  setSession(session: Session | null): void;
  selectMoneyBook(money_book_id: number): void;
  addMoneyBook(money_book: MoneyBookInput): Promise<void>;
  deleteMoneyBook(money_book_id: number): Promise<void>;
  addTransaction(transaction: TransactionInput): Promise<void>;
  updateTransaction(transaction: Transaction): Promise<void>;
  deleteTransaction(transaction_id: number): Promise<void>;
  resetData(): Promise<void>;
}

const initialState: AppState = supabaseRepository.emptyState(null);

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
  const supabase = useMemo(() => createClient(), []);
  const [providerState, dispatch] = useReducer(providerReducer, {
    app: initialState,
    hydrated: false,
  });
  const [authChecked, setAuthChecked] = useState(false);
  const state = providerState.app;
  const hydrated = providerState.hydrated;

  useEffect(() => {
    let active = true;

    async function hydrateWithSession(session: Session | null) {
      if (!session) {
        dispatch({ type: "hydrate", state: supabaseRepository.emptyState(null) });
        return;
      }

      const nextState = await supabaseRepository.load(supabase, session);
      if (!active) return;
      dispatch({ type: "hydrate", state: nextState });
    }

    async function syncSession() {
      const session = await getSessionFromSupabase(supabase);
      if (!active) return;

      await hydrateWithSession(session);
      if (!active) return;
      setAuthChecked(true);
    }

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        if (!active) return;
        const nextSession = session?.user
          ? createSessionFromSupabaseUser(session.user)
          : null;
        await hydrateWithSession(nextSession);
        if (!active) return;
        setAuthChecked(true);
      })();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      hydrated,
      authChecked,
      setSession: (session) => dispatch({ type: "session/set", session }),
      selectMoneyBook: (money_book_id) =>
        dispatch({ type: "money_book/select", money_book_id }),
      addMoneyBook: async (input) => {
        const money_book = await supabaseRepository.createMoneyBook(
          supabase,
          input,
        );
        dispatch({ type: "money_book/add", money_book });
      },
      deleteMoneyBook: async (money_book_id) => {
        await supabaseRepository.deleteMoneyBook(supabase, money_book_id);
        dispatch({ type: "money_book/delete", money_book_id });
      },
      addTransaction: async (input) => {
        const transaction = await supabaseRepository.createTransaction(
          supabase,
          input,
        );
        dispatch({ type: "transaction/add", transaction });
      },
      updateTransaction: async (transaction) => {
        const updatedTransaction = await supabaseRepository.updateTransaction(
          supabase,
          transaction,
        );
        dispatch({
          type: "transaction/update",
          transaction: updatedTransaction,
        });
      },
      deleteTransaction: async (transaction_id) => {
        await supabaseRepository.deleteTransaction(supabase, transaction_id);
        dispatch({ type: "transaction/delete", transaction_id });
      },
      resetData: async () => {
        const nextState = await supabaseRepository.reset(
          supabase,
          state.session,
        );
        dispatch({ type: "hydrate", state: nextState });
      },
    }),
    [authChecked, hydrated, state, supabase],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
