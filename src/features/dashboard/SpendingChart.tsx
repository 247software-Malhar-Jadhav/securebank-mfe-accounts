import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CategoryTotal } from "@/api/types";
import { formatMoney } from "@/lib/money";

/** The five-step chart palette resolved from CSS variables (matches the shell theme). */
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

/**
 * Spending-insights donut chart. Fed by GET /api/insights/spending breakdown. Currency is
 * formatted via Intl honoring the active locale.
 */
export function SpendingChart({
  breakdown,
  currency,
}: {
  breakdown: CategoryTotal[];
  currency: string;
}) {
  const { i18n } = useTranslation();

  // recharts wants a flat [{ name, value }] shape.
  const data = useMemo(
    () => breakdown.map((b) => ({ name: b.category, value: b.total })),
    [breakdown],
  );

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatMoney(value, currency, i18n.language)}
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            color: "hsl(var(--popover-foreground))",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
