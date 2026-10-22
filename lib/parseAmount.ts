import type { Locale } from "@/i18n/config";

/** Exclusive upper bound for amounts (Spec §6.2). */
export const MAX_AMOUNT = 1e9;

/** Whole part, then optionally `.` or `,` and the decimals. */
const AMOUNT = /^(\d*)(?:[.,](\d*))?$/;

/**
 * Turns what the user typed into an amount, or `null` when there is none.
 *
 * Ignores `$` and spaces (incl. U+00A0/U+202F, the French thousands separators).
 * English commas are thousands separators; in French `,` is the decimal mark.
 * `.` is a decimal mark in both. Keeps 2 decimals and stays below {@link MAX_AMOUNT}.
 */
export function parseAmount(input: string, locale: Locale): number | null {
  let text = input.replace(/[\s$]/g, "");
  if (locale === "en") text = text.replaceAll(",", "");

  const match = AMOUNT.exec(text);
  if (!match) return null;

  const [, whole, decimals = ""] = match;
  if (!whole && !decimals) return null;

  const amount = Number(`${whole || "0"}.${decimals.slice(0, 2)}`);
  return Math.min(amount, MAX_AMOUNT - 0.01);
}

/**
 * Brings an amount within the stored bounds (Spec §6.2): `0 ≤ amount <`
 * {@link MAX_AMOUNT}, rounded to 2 decimals. Anything not a finite number is
 * an empty field.
 */
export function normalizeAmount(amount: number | null): number | null {
  if (amount === null || !Number.isFinite(amount)) return null;
  const rounded = Math.round(amount * 100) / 100;
  return Math.min(Math.max(rounded, 0), MAX_AMOUNT - 0.01);
}

/**
 * Shows a stored amount in an input the way the user would type it: no
 * grouping, `,` as the decimal mark in French (`12.5` → `"12,5"`), empty for
 * `null`. {@link parseAmount} reads it back to the same number.
 */
export function amountToInput(amount: number | null, locale: Locale): string {
  if (amount === null) return "";
  const text = String(amount);
  return locale === "fr" ? text.replace(".", ",") : text;
}
