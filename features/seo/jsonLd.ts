import { regionalLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { siteUrl } from "@/lib/siteUrl";
import { localePath } from "./metadata";

/** schema.org `WebApplication` for one locale's page. */
export function webApplicationJsonLd(
  locale: Locale,
  { app, meta }: Pick<Dictionary, "app" | "meta">,
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: app.name,
    description: meta.description,
    url: new URL(localePath(locale), siteUrl()).href,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    inLanguage: regionalLocale(locale),
    offers: { "@type": "Offer", price: 0, priceCurrency: "CAD" },
  };
}

/** JSON for an inline `<script>`: `<` is escaped so the data cannot close the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
