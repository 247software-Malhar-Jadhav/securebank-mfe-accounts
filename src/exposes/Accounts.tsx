/**
 * FEDERATION EXPOSE: `mfe_accounts/Accounts`.
 *
 * Thin re-export of the Accounts feature (same rationale as Dashboard.tsx). The host renders
 * this and relies on the shared singletons for React/Redux/i18n/router context.
 */
export { default } from "@/features/accounts/Accounts";
