import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Wallet } from "lucide-react";
import {
  useGetSpendingInsightsQuery,
  useListAccountsQuery,
} from "@/api/accountsApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CardSkeletonGrid,
  EmptyState,
  ErrorState,
  TableSkeleton,
} from "@/components/StateViews";
import { formatMoney } from "@/lib/money";
import { SpendingChart } from "./SpendingChart";

/**
 * Dashboard screen — exposed to the shell as `mfe_accounts/Dashboard`.
 *
 * Composes: balance cards (from /api/accounts), recent transactions (derived from the first
 * account's recent activity is out of scope here; we show insight-driven content), and the
 * spending-insights donut + AI summary (from /api/insights/spending).
 *
 * NOTE: This is a presentational React component with NO knowledge of how it is mounted. It
 * relies on the surrounding Provider (store), i18n and router being supplied either by the
 * standalone harness or by the shell — that is the whole point of the remote contract.
 */
export default function Dashboard() {
  const { t, i18n } = useTranslation();

  const accountsQ = useListAccountsQuery();
  const insightsQ = useGetSpendingInsightsQuery();

  // Pick a display currency (the first account's) for the chart/totals.
  const currency = accountsQ.data?.[0]?.currency ?? "INR";

  const totalBalance = useMemo(
    () => (accountsQ.data ?? []).reduce((sum, a) => sum + a.balance, 0),
    [accountsQ.data],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
      </header>

      {/* Total balance hero */}
      {accountsQ.isLoading ? (
        <CardSkeletonGrid count={1} />
      ) : accountsQ.isError ? (
        <ErrorState message={t("accounts.errorList")} onRetry={accountsQ.refetch} />
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="h-4 w-4" /> {t("dashboard.totalBalance")}
            </CardDescription>
            <CardTitle className="text-3xl">
              {formatMoney(totalBalance, currency, i18n.language)}
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Balance cards per account */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          {t("dashboard.balanceCards")}
        </h2>
        {accountsQ.isLoading ? (
          <CardSkeletonGrid />
        ) : accountsQ.data && accountsQ.data.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accountsQ.data.map((acc) => (
              <Card key={acc.id}>
                <CardHeader className="pb-2">
                  <CardDescription>{t(`accounts.type.${acc.type}`)}</CardDescription>
                  <CardTitle className="text-xl">
                    {formatMoney(acc.balance, acc.currency, i18n.language)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">
                    {acc.accountNumber}
                  </span>
                  <Badge variant={acc.status === "ACTIVE" ? "success" : "secondary"}>
                    {t(`accounts.status.${acc.status}`)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState message={t("accounts.empty")} />
        )}
      </section>

      {/* Spending insights: donut chart + AI summary */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.spendingInsights")}</CardTitle>
          </CardHeader>
          <CardContent>
            {insightsQ.isLoading ? (
              <TableSkeleton rows={4} />
            ) : insightsQ.isError ? (
              <ErrorState message={t("dashboard.errorInsights")} onRetry={insightsQ.refetch} />
            ) : insightsQ.data && insightsQ.data.breakdown.length > 0 ? (
              <SpendingChart breakdown={insightsQ.data.breakdown} currency={currency} />
            ) : (
              <EmptyState message={t("common.noData")} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> {t("dashboard.aiSummary")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insightsQ.isLoading ? (
              <TableSkeleton rows={3} />
            ) : insightsQ.data?.summary ? (
              <p className="text-sm leading-relaxed text-foreground/90">
                {insightsQ.data.summary}
              </p>
            ) : (
              <EmptyState message={t("common.noData")} />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
