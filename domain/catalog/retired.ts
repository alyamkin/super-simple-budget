import type { ItemId } from "./items";

/**
 * Ids removed from the catalog, kept so old budget files still open (Spec §11.3).
 * Maps to the replacement id, or `null` to turn the row into a custom row.
 */
export const RETIRED_ITEMS: Readonly<Record<string, ItemId | null>> = {};
