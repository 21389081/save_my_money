import type { AppState, Ledger, Session, Transaction } from "./types";

export type AppAction =
  | { type: "hydrate"; state: AppState }
  | { type: "session/set"; session: Session | null }
  | { type: "ledger/select"; ledgerId: string }
  | { type: "ledger/add"; ledger: Ledger }
  | { type: "ledger/delete"; ledgerId: string }
  | { type: "transaction/add"; transaction: Transaction }
  | { type: "transaction/update"; transaction: Transaction }
  | { type: "transaction/delete"; transactionId: string };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "session/set":
      return { ...state, session: action.session };
    case "ledger/select":
      return { ...state, currentLedgerId: action.ledgerId };
    case "ledger/add":
      return {
        ...state,
        ledgers: [...state.ledgers, action.ledger],
        currentLedgerId: action.ledger.id,
      };
    case "ledger/delete": {
      if (state.ledgers.length === 1) return state;
      const ledgers = state.ledgers.filter(
        (ledger) => ledger.id !== action.ledgerId,
      );
      return {
        ...state,
        ledgers,
        transactions: state.transactions.filter(
          (transaction) => transaction.ledgerId !== action.ledgerId,
        ),
        currentLedgerId:
          state.currentLedgerId === action.ledgerId
            ? ledgers[0].id
            : state.currentLedgerId,
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
          (transaction) => transaction.id !== action.transactionId,
        ),
      };
  }
}
