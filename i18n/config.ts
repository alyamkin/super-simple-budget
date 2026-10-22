export const locales = ["en", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Cookie that remembers an explicit language choice (read by `proxy.ts`). */
export const LOCALE_COOKIE = "NEXT_LOCALE";

const REGIONAL_LOCALES: Record<Locale, string> = { en: "en-CA", fr: "fr-CA" };

export function hasLocale(value: unknown): value is Locale {
  return (locales as readonly unknown[]).includes(value);
}

/** The locale with its region (`en` → `en-CA`), as `Intl` and `<html lang>` expect it. */
export function regionalLocale(locale: Locale): string {
  return REGIONAL_LOCALES[locale];
}

/**
 * Picks the locale for `/`: a valid cookie wins, then the highest-weighted
 * `Accept-Language` entry we support (`fr*` → `fr`, `en*` → `en`), else the default.
 */
export function negotiateLocale(
  cookie: string | undefined,
  acceptLanguage: string | null | undefined,
): Locale {
  if (hasLocale(cookie)) return cookie;

  const ranges = (acceptLanguage ?? "")
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="));
      const weight = q ? Number(q.slice(2)) : 1;
      return { tag: tag.toLowerCase(), weight: Number.isNaN(weight) ? 0 : weight, index };
    })
    .filter((range) => range.tag && range.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index);

  for (const { tag } of ranges) {
    const primary = tag.split("-")[0];
    if (hasLocale(primary)) return primary;
  }
  return defaultLocale;
}
