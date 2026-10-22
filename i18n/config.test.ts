/**
 * @jest-environment node
 */
import {
  defaultLocale,
  hasLocale,
  negotiateLocale,
  regionalLocale,
} from "@/i18n/config";

describe("hasLocale", () => {
  it.each(["en", "fr"])("accepts %s", (value) => {
    expect(hasLocale(value)).toBe(true);
  });

  it.each(["de", "EN", "en-CA", "", undefined, null, 1])(
    "rejects %p",
    (value) => {
      expect(hasLocale(value)).toBe(false);
    },
  );
});

describe("regionalLocale", () => {
  it("maps to Canadian tags", () => {
    expect(regionalLocale("en")).toBe("en-CA");
    expect(regionalLocale("fr")).toBe("fr-CA");
  });
});

describe("negotiateLocale", () => {
  it("prefers a valid cookie", () => {
    expect(negotiateLocale("fr", "en-CA,en;q=0.9")).toBe("fr");
  });

  it("ignores an invalid cookie", () => {
    expect(negotiateLocale("de", "fr-CA")).toBe("fr");
  });

  it.each([
    ["fr-CA,fr;q=0.9,en;q=0.8", "fr"],
    ["FR", "fr"],
    ["en-US,en;q=0.9", "en"],
    ["de-DE,fr;q=0.8,en;q=0.5", "fr"],
    ["en;q=0.5,fr;q=0.9", "fr"],
    ["fr;q=0,en", "en"],
    ["de, ja", defaultLocale],
    ["*", defaultLocale],
    ["", defaultLocale],
  ])("Accept-Language %p → %s", (header, expected) => {
    expect(negotiateLocale(undefined, header)).toBe(expected);
  });

  it("defaults without any hint", () => {
    expect(negotiateLocale(undefined, null)).toBe(defaultLocale);
  });
});
