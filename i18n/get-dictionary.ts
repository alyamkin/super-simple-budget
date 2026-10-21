import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((m) => m.en),
  fr: () => import("./dictionaries/fr").then((m) => m.fr),
};

/** Loads one locale's dictionary on the server; pass it to `I18nProvider`. */
export function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}
