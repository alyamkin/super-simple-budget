/**
 * @jest-environment node
 */
import { en } from "@/i18n/dictionaries/en";
import { fr } from "@/i18n/dictionaries/fr";
import {
  createTranslator,
  interpolate,
  plural,
  type PluralForms,
} from "@/i18n/translate";

describe("interpolate", () => {
  it("fills every placeholder", () => {
    expect(
      interpolate("Step {n} of {total} · {name}", {
        n: 2,
        total: 8,
        name: "Savings",
      }),
    ).toBe("Step 2 of 8 · Savings");
  });

  it("fills a placeholder used more than once", () => {
    expect(interpolate("{a} and {a}", { a: "x" })).toBe("x and x");
  });

  it("leaves missing variables visible", () => {
    expect(interpolate("Hello {name}, {n}", { n: 1 })).toBe("Hello {name}, 1");
  });

  it("returns the template unchanged without vars", () => {
    expect(interpolate("Hello {name}")).toBe("Hello {name}");
  });

  it("does not read inherited properties", () => {
    expect(interpolate("{toString}", {})).toBe("{toString}");
  });
});

describe("plural", () => {
  const sources: PluralForms = {
    one: "{n} source of income",
    other: "{n} sources of income",
  };
  const sourcesFr: PluralForms = {
    one: "{n} source de revenu",
    other: "{n} sources de revenu",
  };

  it.each([
    [0, "0 sources of income"],
    [1, "1 source of income"],
    [2, "2 sources of income"],
  ])("en %d", (count, expected) => {
    expect(plural("en", sources, count)).toBe(expected);
  });

  it.each([
    [0, "0 source de revenu"],
    [1, "1 source de revenu"],
    [1.5, "1.5 source de revenu"],
    [2, "2 sources de revenu"],
  ])("fr %d (0 and 1 are singular)", (count, expected) => {
    expect(plural("fr", sourcesFr, count)).toBe(expected);
  });

  it("falls back to other when a category is missing", () => {
    expect(plural("en", { other: "{n} items" }, 1)).toBe("1 items");
  });

  it("passes extra vars through", () => {
    expect(plural("en", { one: "{n} in {b}", other: "{n} in {b}" }, 3, { b: "Home" })).toBe(
      "3 in Home",
    );
  });
});

describe("createTranslator", () => {
  it("resolves dotted keys in the active locale", () => {
    expect(createTranslator("en", en).t("footer.about")).toBe("About this tool");
    expect(createTranslator("fr", fr).t("footer.about")).toBe(
      "À propos de cet outil",
    );
  });

  it("returns the key for an unknown key", () => {
    const { t } = createTranslator("en", en);
    // @ts-expect-error unknown keys are a type error
    expect(t("nope.missing")).toBe("nope.missing");
  });

  it("exposes its locale", () => {
    expect(createTranslator("fr", fr).locale).toBe("fr");
  });
});
