import i18next from "i18next";

/**
 * Format a money amount using `Intl.NumberFormat`, honoring BOTH the active i18n locale and
 * the account's own currency. We never hand-roll currency symbols or decimal grouping —
 * Intl does it correctly per locale (e.g. en-IN groups as 1,00,000; the ₹ symbol placement
 * differs from $ etc.).
 *
 * @param amount   numeric amount (the backend sends BigDecimal serialized as a JSON number)
 * @param currency ISO-4217 code from the account (e.g. "INR", "USD")
 * @param locale   BCP-47 locale; defaults to the live i18next language
 */
export function formatMoney(
  amount: number,
  currency: string,
  locale: string = i18next.language || "en",
): string {
  // Map our short i18n codes to fuller BCP-47 tags for better number grouping.
  const bcp47 = LOCALE_TO_BCP47[locale] ?? locale;
  try {
    return new Intl.NumberFormat(bcp47, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).format(amount);
  } catch {
    // Unknown currency code — fall back to a plain number + code.
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/** Our i18n languages mapped to region-qualified BCP-47 tags (drives digit grouping). */
const LOCALE_TO_BCP47: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
};

/** Format a percentage 0..100 for chart tooltips/legends. */
export function formatPercent(
  value: number,
  locale: string = i18next.language || "en",
): string {
  const bcp47 = LOCALE_TO_BCP47[locale] ?? locale;
  return new Intl.NumberFormat(bcp47, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value / 100);
}
