import { toBcp47, type Locale } from "@/i18n/config";

/** Exclusive upper bound for amounts (Spec §6.2). */
export const MAX_AMOUNT = 1e9;

const MAX_DECIMALS = 2;

type Separators = { group: string; decimal: string; currency: string };

// Bounded: at most one entry per locale.
const separatorsCache = new Map<Locale, Separators>();

/** Reads the locale's separators and CAD symbol from `Intl` instead of hard-coding them. */
function separators(locale: Locale): Separators {
  let found = separatorsCache.get(locale);
  if (!found) {
    const parts = new Intl.NumberFormat(toBcp47(locale), {
      style: "currency",
      currency: "CAD",
    }).formatToParts(12345.6);
    const part = (type: Intl.NumberFormatPartTypes) =>
      parts.find((p) => p.type === type)?.value ?? "";
    found = {
      group: part("group"),
      decimal: part("decimal"),
      currency: part("currency"),
    };
    separatorsCache.set(locale, found);
  }
  return found;
}

/**
 * Turns what the user typed into an amount, or `null` when there is none.
 *
 * Strips the currency symbol, whitespace (incl. U+00A0/U+202F) and group
 * separators; accepts `.` and the locale's decimal separator, keeping only the
 * first one; truncates to 2 decimals and clamps below {@link MAX_AMOUNT}.
 * Anything else (letters, signs, exponents) makes the input invalid → `null`.
 */
export function parseAmount(input: string, locale: Locale): number | null {
  const { group, decimal, currency } = separators(locale);

  let cleaned = input.replace(/\s/g, "");
  if (currency) cleaned = cleaned.replaceAll(currency, "");
  // A group separator that is not also a decimal mark (fr-CA groups with a space).
  if (group && group !== "." && group !== decimal) {
    cleaned = cleaned.replaceAll(group, "");
  }

  let integer = "";
  let fraction: string | null = null;
  for (const char of cleaned) {
    if (char >= "0" && char <= "9") {
      if (fraction === null) integer += char;
      else fraction += char;
    } else if (char === "." || char === decimal) {
      fraction ??= "";
    } else {
      return null;
    }
  }

  if (!integer && !fraction) return null;
  const value = Number(`${integer || "0"}.${(fraction ?? "").slice(0, MAX_DECIMALS)}`);
  return Math.min(value, MAX_AMOUNT - 10 ** -MAX_DECIMALS);
}
