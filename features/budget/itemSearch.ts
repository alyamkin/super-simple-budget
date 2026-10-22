import { ITEMS, type ItemId } from "@/domain/catalog/items";
import type { Translator } from "@/i18n/translate";
import { normalizeSearch } from "@/lib/normalizeSearch";

export const MAX_SEARCH_RESULTS = 10;

/** Every catalog item with its folded label and help text, in catalog order. */
export type SearchIndex = readonly { id: ItemId; text: string }[];

export function buildSearchIndex(t: Translator["t"]): SearchIndex {
  return ITEMS.map(({ id }) => ({
    id,
    text: normalizeSearch(`${t(`items.${id}.label`)} ${t(`items.${id}.help`)}`),
  }));
}

/**
 * Items whose label or help text contains the query, ignoring accents and
 * case; already-picked items are left out. Empty for a blank
 * query.
 */
export function searchItems(
  index: SearchIndex,
  query: string,
  picked: ReadonlySet<ItemId>,
): ItemId[] {
  const needle = normalizeSearch(query.trim());
  if (!needle) return [];
  const hits: ItemId[] = [];
  for (const { id, text } of index) {
    if (hits.length === MAX_SEARCH_RESULTS) break;
    if (!picked.has(id) && text.includes(needle)) hits.push(id);
  }
  return hits;
}
