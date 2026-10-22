import type { MetadataRoute } from "next";
import { languageAlternates, localePath } from "@/features/seo/metadata";
import { locales } from "@/i18n/config";
import { siteUrl } from "@/lib/siteUrl";

/** One entry per locale page, each listing every language version. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const languages = Object.fromEntries(
    Object.entries(languageAlternates()).map(([tag, path]) => [
      tag,
      new URL(path, base).href,
    ]),
  );
  return locales.map((locale) => ({
    url: new URL(localePath(locale), base).href,
    changeFrequency: "monthly",
    priority: 1,
    alternates: { languages },
  }));
}
