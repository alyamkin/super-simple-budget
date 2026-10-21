import { toBcp47, type Locale } from "@/i18n/config";

export type FormatOptions = { decimals?: number };

// Bounded: one entry per (locale, style, decimals) actually used.
const formatters = new Map<string, Intl.NumberFormat>();

function formatter(
  locale: Locale,
  style: "currency" | "percent",
  decimals: number,
): Intl.NumberFormat {
  const key = `${locale}|${style}|${decimals}`;
  let format = formatters.get(key);
  if (!format) {
    format = new Intl.NumberFormat(toBcp47(locale), {
      style,
      currency: "CAD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      // No "-$0" for -0 or values that round to zero.
      signDisplay: "negative",
    });
    formatters.set(key, format);
  }
  return format;
}

/** Formats CAD: `$1,235` (en-CA), `1 235 $` (fr-CA). */
export function formatMoney(
  amount: number,
  locale: Locale,
  { decimals = 0 }: FormatOptions = {},
): string {
  return formatter(locale, "currency", decimals).format(amount);
}

/** Formats a ratio as a percentage: `0.25` → `25%` (en-CA), `25 %` (fr-CA). */
export function formatPercent(
  ratio: number,
  locale: Locale,
  { decimals = 0 }: FormatOptions = {},
): string {
  return formatter(locale, "percent", decimals).format(ratio);
}
