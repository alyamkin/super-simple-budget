/**
 * @jest-environment node
 */
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

const dictionaries = { en, fr };

describe("dictionaries", () => {
  it("en and fr have exactly the same keys", () => {
    expect(leafEntries(fr).map(([key]) => key)).toEqual(
      leafEntries(en).map(([key]) => key),
    );
  });

  it.each(Object.entries(dictionaries))("%s has no empty strings", (_, dict) => {
    const empty = leafEntries(dict).filter(([, value]) => !value.trim());
    expect(empty).toEqual([]);
  });

  it.each(Object.entries(dictionaries))(
    "%s meta description fits in 160 characters",
    (_, dict) => {
      expect(dict.meta.description.length).toBeLessThanOrEqual(160);
    },
  );

  it("labels every frequency, and nothing else", () => {
    for (const dict of Object.values(dictionaries)) {
      expect(Object.keys(dict.frequency).sort()).toEqual([...FREQUENCIES].sort());
    }
  });
});
