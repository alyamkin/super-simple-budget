/**
 * @jest-environment node
 */
import {
  BUCKET_IDS,
  BUCKET_OF_ITEM,
  BUCKETS,
  ESTIMABLE_BUCKETS,
  ITEMS_BY_BUCKET,
  OUTGOING_BUCKETS,
  STEPS,
  isEstimable,
} from "@/domain/catalog/buckets";
import { CATEGORY_IDS } from "@/domain/catalog/categories";
import { ITEMS, ITEMS_BY_ID, isItemId } from "@/domain/catalog/items";
import { RETIRED_ITEMS } from "@/domain/catalog/retired";

const ids = ITEMS.map((item) => item.id);

describe("catalog", () => {
  it("has the artifact's 16 income, 9 savings, 79 expense items and 15 categories", () => {
    const count = (match: (category: unknown) => boolean) =>
      ITEMS.filter((item) => match(item.category)).length;
    expect(count((c) => c === null)).toBe(16);
    expect(count((c) => c === "savings")).toBe(9);
    expect(count((c) => c !== null && c !== "savings")).toBe(79);
    expect(CATEGORY_IDS).toHaveLength(15);
  });

  it("has unique ids", () => {
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("indexes every item by id", () => {
    expect(Object.keys(ITEMS_BY_ID)).toEqual(ids);
    expect(isItemId("rent")).toBe(true);
    expect(isItemId("toString")).toBe(false);
    expect(isItemId(42)).toBe(false);
  });

  it("puts every expense category in exactly one bucket", () => {
    const listed = BUCKET_IDS.flatMap((bucket) => BUCKETS[bucket].categories);
    expect([...listed].sort()).toEqual(
      [...CATEGORY_IDS, "savings", null].sort(),
    );
  });

  it("puts every item in exactly one bucket", () => {
    expect(Object.keys(BUCKET_OF_ITEM)).toEqual(ids);
    expect(Object.values(BUCKET_OF_ITEM)).not.toContain(undefined);
    const bucketed = BUCKET_IDS.flatMap((bucket) => ITEMS_BY_BUCKET[bucket]);
    expect([...bucketed].sort()).toEqual([...ids].sort());
  });

  it.each(BUCKET_IDS)("%s: popular chips exist and belong to it", (bucket) => {
    for (const id of BUCKETS[bucket].popular) {
      expect(BUCKET_OF_ITEM[id]).toBe(bucket);
    }
  });

  it("keeps the artifact's chip order inside a bucket", () => {
    expect(ITEMS_BY_BUCKET.debt.slice(0, 3)).toEqual([
      "creditCard",
      "lineOfCredit",
      "personalLoan",
    ]);
  });

  it("orders steps and buckets", () => {
    expect(STEPS).toHaveLength(8);
    expect(BUCKET_IDS).toEqual(STEPS.slice(0, 7));
    expect(OUTGOING_BUCKETS).toEqual(STEPS.slice(1, 7));
  });

  it("allows rough totals only for spending buckets", () => {
    expect(BUCKET_IDS.filter(isEstimable)).toEqual([...ESTIMABLE_BUCKETS]);
  });

  it("retires only ids that are no longer in the catalog", () => {
    for (const [id, replacement] of Object.entries(RETIRED_ITEMS)) {
      expect(isItemId(id)).toBe(false);
      if (replacement !== null) expect(isItemId(replacement)).toBe(true);
    }
  });
});
