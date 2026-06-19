/**
 * FEDERATION EXPOSE: `mfe_accounts/Dashboard`.
 *
 * This is the module the shell imports. It is intentionally a THIN re-export of the feature
 * component so the public remote surface is decoupled from internal file layout — we can move
 * /features around without changing the contract the shell depends on.
 *
 * The component itself assumes the surrounding Provider (Redux store), i18n instance and
 * router are supplied by the host. Those arrive via the SHARED SINGLETONS (react-redux,
 * react-i18next, react-router-dom) declared in vite.config.ts, so the same React context the
 * shell created is visible here.
 */
export { default } from "@/features/dashboard/Dashboard";
