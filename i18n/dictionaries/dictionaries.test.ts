/**
 * @jest-environment node
 */
import { BUCKET_IDS } from "@/domain/catalog/buckets";
import { CATEGORY_IDS } from "@/domain/catalog/categories";
import { ITEMS } from "@/domain/catalog/items";
import { FREQUENCIES } from "@/domain/frequency";
import { en } from "@/i18n/dictionaries/en";
import { fr } from "@/i18n/dictionaries/fr";

/** Dotted paths of every string leaf, sorted. */
function leafEntries(node: unknown, prefix = ""): [string, string][] {
  if (typeof node === "string") return [[prefix, node]];
  return Object.entries(node as Record<string, unknown>)
    .flatMap(([key, value]) =>
      leafEntries(value, prefix ? `${prefix}.${key}` : key),
    )
    .sort(([a], [b]) => a.localeCompare(b));
}

/** Item help and tip are optional: an empty string means "none". */
const isOptional = (key: string) => /^items\.\w+\.(help|tip)$/.test(key);

const dictionaries = { en, fr };
const sorted = (keys: Iterable<string>) => [...keys].sort();

describe("dictionaries", () => {
  it("en and fr have exactly the same keys", () => {
    expect(leafEntries(fr).map(([key]) => key)).toEqual(
      leafEntries(en).map(([key]) => key),
    );
  });

  it.each(Object.entries(dictionaries))("%s has no empty strings", (_, dict) => {
    const empty = leafEntries(dict).filter(
      ([key, value]) => !value.trim() && !isOptional(key),
    );
    expect(empty).toEqual([]);
  });

  it("en and fr agree on which items have help and tips", () => {
    const filled = (dict: typeof en) =>
      leafEntries(dict)
        .filter(([key, value]) => isOptional(key) && value)
        .map(([key]) => key);
    expect(filled(fr)).toEqual(filled(en));
  });

  it.each(Object.entries(dictionaries))(
    "%s meta description fits in 160 characters",
    (_, dict) => {
      expect(dict.meta.description.length).toBeLessThanOrEqual(160);
    },
  );

  it.each(Object.entries(dictionaries))(
    "%s labels exactly the catalog",
    (_, dict) => {
      expect(sorted(Object.keys(dict.frequency))).toEqual(sorted(FREQUENCIES));
      expect(sorted(Object.keys(dict.buckets))).toEqual(sorted(BUCKET_IDS));
      expect(sorted(Object.keys(dict.categories))).toEqual(
        sorted([...CATEGORY_IDS, "savings"]),
      );
      expect(sorted(Object.keys(dict.items))).toEqual(
        sorted(ITEMS.map((item) => item.id)),
      );
    },
  );

  it.each(Object.entries(dictionaries))(
    "%s names every fund type the catalog uses",
    (_, dict) => {
      const used = new Set(ITEMS.flatMap((item) => item.fundType ?? []));
      expect(sorted(Object.keys(dict.fundTypes))).toEqual(sorted(used));
    },
  );
});
