import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useOpenAccountMutation } from "@/api/accountsApi";
import type { AccountType } from "@/api/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ACCOUNT_TYPES: AccountType[] = ["CHECKING", "SAVINGS", "CREDIT"];
const CURRENCIES = ["INR", "USD", "EUR"];

/**
 * "Open account" dialog — POSTs to /api/accounts and lets RTK Query invalidate the list so it
 * refetches automatically. Controlled by the parent via `open`/`onOpenChange`.
 */
export function OpenAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [type, setType] = useState<AccountType>("SAVINGS");
  const [currency, setCurrency] = useState("INR");
  const [openingBalance, setOpeningBalance] = useState("");

  const [openAccount, { isLoading, isError }] = useOpenAccountMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await openAccount({
        type,
        currency,
        openingBalance: openingBalance ? Number(openingBalance) : undefined,
      }).unwrap();
      onOpenChange(false);
      // Reset for next time.
      setOpeningBalance("");
    } catch {
      // Error surfaced via `isError` below; keep the dialog open.
    }
  }

  const fieldClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("accounts.dialog.title")}</DialogTitle>
          <DialogDescription>{t("accounts.dialog.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">{t("accounts.dialog.type")}</span>
            <select
              className={fieldClass}
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
            >
              {ACCOUNT_TYPES.map((tp) => (
                <option key={tp} value={tp}>
                  {t(`accounts.type.${tp}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">{t("accounts.dialog.currency")}</span>
            <select
              className={fieldClass}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">{t("accounts.dialog.openingBalance")}</span>
            <input
              className={fieldClass}
              type="number"
              min="0"
              step="0.01"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              placeholder="0.00"
            />
          </label>

          {isError && (
            <p className="text-sm text-destructive">{t("accounts.dialog.error")}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("accounts.dialog.submitting") : t("accounts.dialog.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
