/**
 * Wire types for the public REST surface (gateway, prefix `/api`). These mirror the backend
 * DTOs exactly so the RTK Query responses are strongly typed end to end.
 *
 * Source of truth:
 *   - Account shape  -> securebank-account-service `AccountDto`
 *   - Insights shape -> securebank-fraud-service `AssistantController.InsightsResponse`
 */

/** Account lifecycle status as emitted by account-service. */
export type AccountStatus = "ACTIVE" | "FROZEN" | "CLOSED";

/** Account product type. */
export type AccountType = "CHECKING" | "SAVINGS" | "CREDIT";

/** One bank account. `balance` is a JSON number (backend BigDecimal). */
export interface Account {
  id: string;
  accountNumber: string;
  customerId: string;
  type: AccountType;
  currency: string;
  balance: number;
  status: AccountStatus;
}

/** Transaction direction relative to the account being viewed. */
export type TxnDirection = "CREDIT" | "DEBIT";

/**
 * One ledger entry shown in the account-detail transactions table. The gateway aggregates
 * this from transaction-service; we type it against the gateway response.
 */
export interface Transaction {
  id: string;
  accountId: string;
  /** ISO-8601 timestamp. */
  timestamp: string;
  description: string;
  category: string;
  direction: TxnDirection;
  amount: number;
  currency: string;
  /** Running balance after this entry, if the gateway provides it. */
  balanceAfter?: number;
}

/** A single spending category total (fraud-service `CategoryDto`). */
export interface CategoryTotal {
  category: string;
  total: number;
}

/** Spending insights: deterministic breakdown + localized AI summary text. */
export interface SpendingInsights {
  breakdown: CategoryTotal[];
  summary: string;
}

/** Request body for opening a new account (POST /api/accounts). */
export interface OpenAccountRequest {
  type: AccountType;
  currency: string;
  /** Optional opening deposit. */
  openingBalance?: number;
}
