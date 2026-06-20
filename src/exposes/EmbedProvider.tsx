import { type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { initAccountsI18n } from "@/i18n";
import "@/index.css"; // Federation injects this stylesheet into the host.

// ---------------------------------------------------------------------------
// EmbedProvider — wraps every EXPOSED module.
//
// WHY OUR OWN STORE EVEN WHEN EMBEDDED:
//   Our screens use RTK Query hooks from `accountsApi`. Those hooks only work if
//   the active Redux store has accountsApi's reducer + middleware. The SHELL's store
//   does NOT (it can't know about every remote's api), so reusing it would make every
//   query silently fail. react-redux is a shared singleton, so nesting our own
//   <Provider> simply shadows the store for our subtree — clean and self-contained.
//   Auth is read from the shared token channel (localStorage/window), not the store,
//   so a separate store does not break authentication.
//
// We also register our i18n resource bundles into the SHARED i18next instance at import
// time, so the shell renders our translated strings instead of raw keys like
// "dashboard.title".
// ---------------------------------------------------------------------------
initAccountsI18n();

export function EmbedProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
