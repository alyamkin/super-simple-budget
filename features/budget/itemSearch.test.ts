/**
 * @jest-environment node
 */
import type { ItemId } from "@/domain/catalog/items";
import { en } from "@/i18n/dictionaries/en";
import { fr } from "@/i18n/dictionaries/fr";
import { createTranslator } from "@/i18n/translate";
import {
  buildSearchIndex,
  MAX_SEARCH_RESULTS,
  searchItems,
} from "./itemSearch";

const enIndex = buildSearchIndex(createTranslator("en", en).t);
const frIndex = buildSearchIndex(createTranslator("fr", fr).t);
const none = new Set<ItemId>();

describe("searchItems", () => {
  it("is empty for a blank query", () => {
    expect(searchItems(enIndex, "", none)).toEqual([]);
    expect(searchItems(enIndex, "   ", none)).toEqual([]);
  });

  it("matches labels case-insensitively", () => {
    expect(searchItems(enIndex, "DAYCARE", none)).toContain("daycare");
  });

  it("matches help text", () => {
    const hits = searchItems(enIndex, "meal kit", none);
    expect(hits).toContain("groceries");
  });

  it("ignores accents in French", () => {
    expect(searchItems(frIndex, "garderie", none)).toContain("daycare");
    expect(searchItems(frIndex, "epicerie", none)).toContain("groceries");
    expect(searchItems(frIndex, "ÉPICERIE", none)).toContain("groceries");
  });

  it(`returns at most ${MAX_SEARCH_RESULTS} items`, () => {
    expect(searchItems(enIndex, "e", none)).toHaveLength(MAX_SEARCH_RESULTS);
  });

  it("leaves out picked items", () => {
    expect(searchItems(enIndex, "daycare", new Set(["daycare"]))).not.toContain(
      "daycare",
    );
  });

  it("finds nothing for an unknown word", () => {
    expect(searchItems(enIndex, "zzzz", none)).toEqual([]);
  });
});
