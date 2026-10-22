import { isEstimated, type Budget } from "@/domain/budget";
import {
  OUTGOING_BUCKETS,
  type OutgoingBucketId,
} from "@/domain/catalog/buckets";
import { CATEGORY_IDS } from "@/domain/catalog/categories";
import { ITEMS_BY_ID } from "@/domain/catalog/items";
import { toMonthly, type Frequency } from "@/domain/frequency";
import type { RuleCategory } from "@/domain/rules";

/** Every amount is monthly; the yearly view multiplies at display time. */
export type Totals = {
  income: number;
  byBucket: Record<OutgoingBucketId, number>;
  /** Itemized amounts only: estimated buckets add nothing here. */
  byCategory: Record<RuleCategory, number>;
  savings: number;
  debt: number;
  outgoing: number;
  /** Outgoing minus savings. */
  spending: number;
  /** Income minus outgoing; negative is a shortfall. */
  balance: number;
};

/** Monthly value of an amount; an empty field counts as zero. */
export const monthly = (entry: {
  amount: number | null;
  frequency: Frequency;
}): number => (entry.amount ? toMonthly(entry.amount, entry.frequency) : 0);

/** Custom rows count towards a category only where the bucket implies one. */
const CUSTOM_ROW_CATEGORY: Partial<Record<OutgoingBucketId, RuleCategory>> = {
  savings: "savings",
  debt: "debt",
};

export function computeTotals(budget: Budget): Totals {
  const income = budget.rows.income.reduce((sum, row) => sum + monthly(row), 0);
  const byBucket = {} as Record<OutgoingBucketId, number>;
  const byCategory = Object.fromEntries(
    [...CATEGORY_IDS, "savings"].map((category) => [category, 0]),
  ) as Record<RuleCategory, number>;

  for (const bucket of OUTGOING_BUCKETS) {
    if (isEstimated(budget, bucket)) {
      byBucket[bucket] = monthly(budget.estimates[bucket]!);
      continue;
    }
    byBucket[bucket] = 0;
    for (const row of budget.rows[bucket]) {
      const value = monthly(row);
      byBucket[bucket] += value;
      const category =
        row.kind === "catalog"
          ? ITEMS_BY_ID[row.id].category
          : CUSTOM_ROW_CATEGORY[bucket];
      if (category) byCategory[category] += value;
    }
  }

  const outgoing = OUTGOING_BUCKETS.reduce((sum, b) => sum + byBucket[b], 0);
  return {
    income,
    byBucket,
    byCategory,
    savings: byBucket.savings,
    debt: byBucket.debt,
    outgoing,
    spending: outgoing - byBucket.savings,
    balance: income - outgoing,
  };
}

export type BalanceLevel = "leftOver" | "even" | "shortfall";

/** Within half a dollar of zero counts as even. */
const EVEN_THRESHOLD = 0.5;

/** How a monthly balance reads: left over, even or short. */
export function balanceLevel(balance: number): BalanceLevel {
  if (balance > EVEN_THRESHOLD) return "leftOver";
  if (balance < -EVEN_THRESHOLD) return "shortfall";
  return "even";
}
