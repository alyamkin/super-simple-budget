import type { Metadata, Viewport } from "next";
import { locales, regionalLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { THEME_COLORS } from "@/features/theme/theme";
import { siteUrl } from "@/lib/siteUrl";

/** Search Console ownership token for the vercel.app URL-prefix property. */
const GOOGLE_SITE_VERIFICATION = "EJEuBhj79ccyUfSJEkYwxKcPCfe1dAGVczY7nHCID9k";

/** Path of a locale's page. */
export function localePath(locale: Locale): string {
  return `/${locale}`;
}

/** hreflang map shared by the page metadata and the sitemap (`en-CA` → `/en`, …). */
export function languageAlternates(): Record<string, string> {
  return {
    ...Object.fromEntries(
      locales.map((locale) => [regionalLocale(locale), localePath(locale)]),
    ),
    "x-default": localePath("en"),
  };
}

/** `en` → `en_CA`, as Open Graph expects. */
function ogLocale(locale: Locale): string {
  return regionalLocale(locale).replace("-", "_");
}

/** Page metadata for one locale. */
export function localeMetadata(
  locale: Locale,
  { app, meta }: Pick<Dictionary, "app" | "meta">,
): Metadata {
  const url = localePath(locale);
  return {
    metadataBase: siteUrl(),
    title: meta.title,
    description: meta.description,
    applicationName: app.name,
    alternates: { canonical: url, languages: languageAlternates() },
    openGraph: {
      type: "website",
      url,
      siteName: app.name,
      title: meta.title,
      description: meta.description,
      locale: ogLocale(locale),
      alternateLocale: locales
        .filter((other) => other !== locale)
        .map(ogLocale),
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
    robots: { index: true, follow: true },
    verification: { google: GOOGLE_SITE_VERIFICATION },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
};
