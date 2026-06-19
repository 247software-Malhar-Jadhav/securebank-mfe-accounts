import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import {
  useGetAccountQuery,
  useGetAccountTransactionsQuery,
} from "@/api/accountsApi";
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

/**
 * Account-detail view: account header + transactions table (GET /api/accounts/{id}/transactions).
 * `onBack` returns to the list (the Accounts component swaps views internally so this works
 * the same standalone and embedded, without depending on a specific router shape).
 */
export function AccountDetail({ accountId, onBack }: { accountId: string; onBack: () => void }) {
  const { t, i18n } = useTranslation();
  const accountQ = useGetAccountQuery(accountId);
  const txnQ = useGetAccountTransactionsQuery(accountId);

  const dateFmt = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> {t("common.back")}
        </Button>
        <h1 className="text-xl font-bold tracking-tight">{t("accounts.detail.title")}</h1>
      </div>

      {/* Account header card */}
      {accountQ.isLoading ? (
        <TableSkeleton rows={2} />
      ) : accountQ.isError ? (
        <ErrorState message={t("accounts.errorList")} onRetry={accountQ.refetch} />
      ) : accountQ.data ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {formatMoney(accountQ.data.balance, accountQ.data.currency, i18n.language)}
              </CardTitle>
              <p className="font-mono text-xs text-muted-foreground">
                {accountQ.data.accountNumber} · {t(`accounts.type.${accountQ.data.type}`)}
              </p>
            </div>
            <Badge variant={accountQ.data.status === "ACTIVE" ? "success" : "secondary"}>
              {t(`accounts.status.${accountQ.data.status}`)}
            </Badge>
          </CardHeader>
        </Card>
      ) : null}

      {/* Transactions table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("accounts.detail.transactions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {txnQ.isLoading ? (
            <TableSkeleton />
          ) : txnQ.isError ? (
            <ErrorState message={t("accounts.detail.errorTransactions")} onRetry={txnQ.refetch} />
          ) : txnQ.data && txnQ.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("accounts.detail.date")}</TableHead>
                  <TableHead>{t("accounts.detail.description")}</TableHead>
                  <TableHead>{t("accounts.detail.category")}</TableHead>
                  <TableHead className="text-right">{t("accounts.detail.amount")}</TableHead>
                  <TableHead className="text-right">{t("accounts.detail.balanceAfter")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txnQ.data.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {dateFmt.format(new Date(tx.timestamp))}
                    </TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tx.category}</Badge>
                    </TableCell>
                    <TableCell
                      className={
                        "text-right font-medium " +
                        (tx.direction === "CREDIT" ? "text-emerald-600" : "text-foreground")
                      }
                    >
                      {tx.direction === "DEBIT" ? "-" : "+"}
                      {formatMoney(tx.amount, tx.currency, i18n.language)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {tx.balanceAfter != null
                        ? formatMoney(tx.balanceAfter, tx.currency, i18n.language)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState message={t("accounts.detail.noTransactions")} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
