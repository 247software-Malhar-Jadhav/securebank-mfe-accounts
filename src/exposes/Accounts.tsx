/**
 * FEDERATION EXPOSE: `mfe_accounts/Accounts`.
 *
 * Wrapped in <EmbedProvider> (own Redux store + i18n bundles) so RTK Query hooks run and
 * translations resolve whether embedded in the shell or mounted bare.
 */
import Accounts from "@/features/accounts/Accounts";
import { EmbedProvider } from "@/exposes/EmbedProvider";

export default function ExposedAccounts() {
  return (
    <EmbedProvider>
      <Accounts />
    </EmbedProvider>
  );
}
