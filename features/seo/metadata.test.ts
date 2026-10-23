/**
 * @jest-environment node
 */
import { en } from "@/i18n/dictionaries/en";
import { fr } from "@/i18n/dictionaries/fr";
import { languageAlternates, localeMetadata } from "./metadata";

const languages = { "en-CA": "/en", "fr-CA": "/fr", "x-default": "/en" };

describe("languageAlternates", () => {
  it("maps every regional tag to its page, defaulting to English", () => {
    expect(languageAlternates()).toEqual(languages);
  });
});

describe("localeMetadata", () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL;
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://budget.example";
  });
  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = original;
  });

  it("builds the English page metadata", () => {
    const metadata = localeMetadata("en", en);
    expect(String(metadata.metadataBase)).toBe("https://budget.example/");
    expect(metadata.title).toBe(
      "Super Simple Budget — free monthly budget planner",
    );
    expect(metadata.description).toBe(en.meta.description);
    expect(metadata.alternates).toEqual({ canonical: "/en", languages });
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      url: "/en",
      siteName: "Super Simple Budget",
      locale: "en_CA",
      alternateLocale: ["fr_CA"],
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.verification).toEqual({
      google: "EJEuBhj79ccyUfSJEkYwxKcPCfe1dAGVczY7nHCID9k",
    });
  });

  it("builds the French page metadata", () => {
    const metadata = localeMetadata("fr", fr);
    expect(metadata.title).toBe(
      "Budget super simple — planificateur budgétaire mensuel gratuit",
    );
    expect(metadata.description).toBe(fr.meta.description);
    expect(metadata.alternates).toEqual({ canonical: "/fr", languages });
    expect(metadata.openGraph).toMatchObject({
      url: "/fr",
      siteName: "Budget super simple",
      locale: "fr_CA",
      alternateLocale: ["en_CA"],
    });
  });

  it.each([
    ["en", en],
    ["fr", fr],
  ] as const)("keeps the %s description within 160 characters", (_, dict) => {
    expect(dict.meta.description.length).toBeLessThanOrEqual(160);
  });
});
