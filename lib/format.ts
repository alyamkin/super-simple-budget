import { regionalLocale, type Locale } from "@/i18n/config";

export type FormatOptions = { decimals?: number };

// One formatter per locale and options, created on first use.
const formatters = new Map<string, Intl.NumberFormat>();

function numberFormat(
  locale: Locale,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = `${locale} ${JSON.stringify(options)}`;
  let format = formatters.get(key);
  if (!format) {
    format = new Intl.NumberFormat(regionalLocale(locale), options);
    formatters.set(key, format);
  }
  return format;
}

const digits = (decimals: number) => ({
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
});

/** Formats CAD: `$1,235` (en-CA), `1 235 $` (fr-CA). */
export function formatMoney(
  amount: number,
  locale: Locale,
  { decimals = 0 }: FormatOptions = {},
): string {
  return numberFormat(locale, {
    style: "currency",
    currency: "CAD",
    signDisplay: "negative", // no "-$0"
    ...digits(decimals),
  }).format(amount);
}

/** Formats a ratio as a percentage: `0.25` → `25%` (en-CA), `25 %` (fr-CA). */
export function formatPercent(
  ratio: number,
  locale: Locale,
  { decimals = 0 }: FormatOptions = {},
): string {
  return numberFormat(locale, { style: "percent", ...digits(decimals) }).format(
    ratio,
  );
}

const listFormats = new Map<Locale, Intl.ListFormat>();

/** Joins names into a sentence list: `A, B and C` (en-CA), `A, B et C` (fr-CA). */
export function formatList(names: readonly string[], locale: Locale): string {
  let format = listFormats.get(locale);
  if (!format) {
    format = new Intl.ListFormat(regionalLocale(locale), { type: "conjunction" });
    listFormats.set(locale, format);
  }
  return format.format(names);
}
