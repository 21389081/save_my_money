import type { AppState, MoneyBook, Session, Transaction } from "./types";

export type AppAction =
  | { type: "hydrate"; state: AppState }
  | { type: "session/set"; session: Session | null }
  | { type: "money_book/select"; money_book_id: number }
  | { type: "money_book/add"; money_book: MoneyBook }
  | { type: "money_book/delete"; money_book_id: number }
  | { type: "transaction/add"; transaction: Transaction }
  | { type: "transaction/update"; transaction: Transaction }
  | { type: "transaction/delete"; transaction_id: number };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "session/set":
      return { ...state, session: action.session };
    case "money_book/select":
      return { ...state, current_money_book_id: action.money_book_id };
    case "money_book/add":
      return {
        ...state,
        money_book: [...state.money_book, action.money_book],
        current_money_book_id: action.money_book.id,
      };
    case "money_book/delete": {
      if (state.money_book.length === 1) return state;
      const money_book = state.money_book.filter(
        (item) => item.id !== action.money_book_id,
      );
      return {
        ...state,
        money_book,
        transactions: state.transactions.filter(
          (transaction) => transaction.money_book_id !== action.money_book_id,
        ),
        current_money_book_id:
          state.current_money_book_id === action.money_book_id
            ? money_book[0]?.id ?? null
            : state.current_money_book_id,
      };
    }
    case "transaction/add":
      return {
        ...state,
        transactions: [action.transaction, ...state.transactions],
      };
    case "transaction/update":
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.transaction.id
            ? action.transaction
            : transaction,
        ),
      };
    case "transaction/delete":
      return {
        ...state,
        transactions: state.transactions.filter(
          (transaction) => transaction.id !== action.transaction_id,
        ),
      };
  }
}
