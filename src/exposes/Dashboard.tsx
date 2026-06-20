/**
 * FEDERATION EXPOSE: `mfe_accounts/Dashboard`.
 *
 * The shell lazy-loads this default export. We wrap the feature component in
 * <EmbedProvider> so it has its OWN Redux store (so accountsApi's RTK Query hooks actually
 * run) and its i18n bundles registered — whether embedded in the shell or mounted bare.
 */
import Dashboard from "@/features/dashboard/Dashboard";
import { EmbedProvider } from "@/exposes/EmbedProvider";

export default function ExposedDashboard() {
  return (
    <EmbedProvider>
      <Dashboard />
    </EmbedProvider>
  );
}
