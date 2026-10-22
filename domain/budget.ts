import {
  isEstimable,
  type BucketId,
  type EstimableBucketId,
} from "@/domain/catalog/buckets";
import type { ItemId } from "@/domain/catalog/items";
import type { Frequency } from "@/domain/frequency";

/** Id of a row the user named themselves: `"c_"` + 10 base-36 chars. */
export type CustomId = `c_${string}`;

/** `amount: null` is an empty field, distinct from `0`. */
export type Row =
  | { kind: "catalog"; id: ItemId; amount: number | null; frequency: Frequency }
  | {
      kind: "custom";
      id: CustomId;
      label: string;
      amount: number | null;
      frequency: Frequency;
    };

/** One rough total that stands in for a bucket's rows while enabled. */
export type Estimate = {
  enabled: boolean;
  amount: number | null;
  frequency: Frequency;
};

/** What the user entered (Spec §6.2). */
export type Budget = {
  /** Order = display order. */
  rows: Record<BucketId, Row[]>;
  estimates: Partial<Record<EstimableBucketId, Estimate>>;
};

/** A budget with nothing picked: the app's starting point. */
export const emptyBudget = (): Budget => ({
  rows: {
    income: [],
    savings: [],
    home: [],
    around: [],
    everyday: [],
    family: [],
    debt: [],
  },
  estimates: {},
});

/** Whether the bucket is planned as one rough total instead of its rows. */
export function isEstimated(
  budget: Budget,
  bucket: BucketId,
): bucket is EstimableBucketId {
  return isEstimable(bucket) && budget.estimates[bucket]?.enabled === true;
}
