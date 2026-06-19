import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { useListAccountsQuery } from "@/api/accountsApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/StateViews";
import { formatMoney } from "@/lib/money";
import { AccountDetail } from "./AccountDetail";
import { OpenAccountDialog } from "./OpenAccountDialog";

/**
 * Accounts screen — exposed to the shell as `mfe_accounts/Accounts`.
 *
 * It owns a small internal view state (list <-> detail) so the remote does NOT have to assume
 * a particular nested-route layout in the host. The shell just renders <Accounts/>; navigation
 * within the feature is self-contained. (If the shell wants deep links, it can route to the
 * remote at a base path; this internal toggle still works.)
 */
export default function Accounts() {
  const { t, i18n } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const accountsQ = useListAccountsQuery();

  // Detail view takes over the whole feature surface when an account is selected.
  if (selectedId) {
    return <AccountDetail accountId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">{t("accounts.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("accounts.subtitle")}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> {t("accounts.openAccount")}
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("accounts.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {accountsQ.isLoading ? (
            <TableSkeleton />
          ) : accountsQ.isError ? (
            <ErrorState message={t("accounts.errorList")} onRetry={accountsQ.refetch} />
          ) : accountsQ.data && accountsQ.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("accounts.accountNumber")}</TableHead>
                  <TableHead>{t("accounts.type")}</TableHead>
                  <TableHead>{t("accounts.status")}</TableHead>
                  <TableHead className="text-right">{t("accounts.balance")}</TableHead>
                  <TableHead className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountsQ.data.map((acc) => (
                  <TableRow key={acc.id}>
                    <TableCell className="font-mono text-xs">{acc.accountNumber}</TableCell>
                    <TableCell>{t(`accounts.type.${acc.type}`)}</TableCell>
                    <TableCell>
                      <Badge variant={acc.status === "ACTIVE" ? "success" : "secondary"}>
                        {t(`accounts.status.${acc.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(acc.balance, acc.currency, i18n.language)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedId(acc.id)}>
                        {t("accounts.viewDetails")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState message={t("accounts.empty")} />
          )}
        </CardContent>
      </Card>

      <OpenAccountDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
