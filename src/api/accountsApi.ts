import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as i18nextNs from "i18next";
import { readAccessToken } from "@/lib/auth";

// Federation interop: normalize the shared i18next namespace to the real instance.
const i18next = ((i18nextNs as unknown as { default?: typeof import("i18next").default }).default
  ?? (i18nextNs as unknown as typeof import("i18next").default));
import type {
  Account,
  OpenAccountRequest,
  SpendingInsights,
  Transaction,
} from "./types";

/**
 * RTK Query api slice for the Accounts remote.
 *
 * DESIGNED FOR BOTH MODES (see src/lib/auth.ts for the full contract):
 *   - STANDALONE: this slice lives in the remote's OWN store (src/store.ts) and talks to the
 *     gateway through Vite's /api proxy.
 *   - EMBEDDED: ideally the shell injects this reducer/middleware into its store. Either way,
 *     auth is decoupled from the store — `prepareHeaders` reads the token at REQUEST TIME from
 *     the shared channel (`readAccessToken`), so we always send the shell's current Bearer
 *     token without needing the token in our own Redux state.
 *
 * `baseUrl` is "/api" (relative): standalone it hits the Vite proxy; embedded it hits the
 * shell's origin which fronts the same gateway. No absolute host is ever baked in.
 */
export const accountsApi = createApi({
  // Unique reducerPath so this slice can be safely combined into the shell's store
  // alongside the shell's own / other remotes' slices without key collisions.
  reducerPath: "accountsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
      // Bearer token: resolved fresh per request from the shared auth channel.
      const token = readAccessToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);

      // Accept-Language drives the backend's localized AI summary + any localized messages.
      // Always read the LIVE i18next language so language switches in the shell propagate.
      headers.set("Accept-Language", i18next.language || "en");
      return headers;
    },
  }),
  tagTypes: ["Account", "Transactions"],
  endpoints: (builder) => ({
    /** GET /api/accounts — list all accounts for the authenticated customer. */
    listAccounts: builder.query<Account[], void>({
      query: () => "/accounts",
      providesTags: (result) =>
        result
          ? [
              ...result.map((a) => ({ type: "Account" as const, id: a.id })),
              { type: "Account" as const, id: "LIST" },
            ]
          : [{ type: "Account" as const, id: "LIST" }],
    }),

    /** GET /api/accounts/{id} — one account. */
    getAccount: builder.query<Account, string>({
      query: (id) => `/accounts/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Account", id }],
    }),

    /** GET /api/accounts/{id}/transactions — ledger entries for the account-detail table. */
    getAccountTransactions: builder.query<Transaction[], string>({
      query: (id) => `/accounts/${id}/transactions`,
      providesTags: (_r, _e, id) => [{ type: "Transactions", id }],
    }),

    /**
     * GET /api/insights/spending — category breakdown + localized AI summary.
     * The backend reads the customer from the gateway-injected X-User-Id header, so no
     * query param is required from the browser in embedded mode.
     */
    getSpendingInsights: builder.query<SpendingInsights, void>({
      query: () => "/insights/spending",
    }),

    /** POST /api/accounts — open a new account. Invalidates the list so it refetches. */
    openAccount: builder.mutation<Account, OpenAccountRequest>({
      query: (body) => ({
        url: "/accounts",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Account", id: "LIST" }],
    }),
  }),
});

export const {
  useListAccountsQuery,
  useGetAccountQuery,
  useGetAccountTransactionsQuery,
  useGetSpendingInsightsQuery,
  useOpenAccountMutation,
} = accountsApi;
