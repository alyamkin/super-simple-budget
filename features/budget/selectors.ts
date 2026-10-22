import { shallowEqual } from "react-redux";
import type { RowId } from "@/domain/budget";
import {
  BUCKET_IDS,
  BUCKETS,
  ITEMS_BY_BUCKET,
  type BucketId,
} from "@/domain/catalog/buckets";
import type { ItemId } from "@/domain/catalog/items";
import {
  computeChecks,
  flaggedChecks,
  headline,
  nextSteps,
  roughBuckets,
  topExpenses,
} from "@/domain/results";
import { evaluateRule } from "@/domain/rules";
import { computeTotals } from "@/domain/totals";
import { budgetSlice } from "@/features/budget/budgetSlice";
import { createAppSelector, type RootState } from "@/store/rootReducer";

export const {
  selectBudget,
  selectAllRows,
  selectBucketRows,
  selectEstimates,
  selectRow,
  selectPickedCount,
  selectEstimate,
  selectIsEstimated,
} = budgetSlice.selectors;

const sameSet = <T>(a: ReadonlySet<T>, b: ReadonlySet<T>) =>
  a.size === b.size && [...a].every((value) => b.has(value));

/** Keeps the previous result when a new one is shallowly equal to it. */
const keepIfShallowEqual = {
  memoizeOptions: { resultEqualityCheck: shallowEqual },
};

/**
 * Turns a selector factory into `(state, bucket) => T` backed by one memoised
 * selector per bucket, so each bucket keeps its own cache and result check.
 */
function perBucket<T>(
  make: (bucket: BucketId) => (state: RootState) => T,
): (state: RootState, bucket: BucketId) => T {
  const selectors = Object.fromEntries(
    BUCKET_IDS.map((bucket) => [bucket, make(bucket)]),
  ) as Record<BucketId, (state: RootState) => T>;
  return (state, bucket) => selectors[bucket](state);
}

// ── Rows and chips ───────────────────────────────────────────────────────────

/**
 * Row ids in display order. Stays the same array while only amounts,
 * frequencies or labels change, so the row list does not re-render on typing.
 */
export const selectRowIds = perBucket((bucket) =>
  createAppSelector(
    [(state) => selectBucketRows(state, bucket)],
    (rows): RowId[] => rows.map((row) => row.id),
    keepIfShallowEqual,
  ),
);

/** Catalog items picked in any bucket; stable while picks are unchanged. */
export const selectPickedItemIds = createAppSelector(
  [selectAllRows],
  (rows): ReadonlySet<ItemId> =>
    new Set(
      BUCKET_IDS.flatMap((bucket) =>
        rows[bucket].flatMap((row) => (row.kind === "catalog" ? row.id : [])),
      ),
    ),
  { memoizeOptions: { resultEqualityCheck: sameSet } },
);

export type Chips = {
  /** Popular, not-yet-picked items in their curated order. */
  popular: ItemId[];
  /** The bucket's other not-yet-picked items, behind "Show {n} more". */
  more: ItemId[];
};

/** The picker's chips; recomputed only when what is picked changes. */
export const selectChips = perBucket((bucket) =>
  createAppSelector([selectPickedItemIds], (picked): Chips => {
    const { popular } = BUCKETS[bucket];
    return {
      popular: popular.filter((id) => !picked.has(id)),
      more: ITEMS_BY_BUCKET[bucket].filter(
        (id) => !picked.has(id) && !popular.includes(id),
      ),
    };
  }),
);

// ── Totals (monthly) ─────────────────────────────────────────────────────────

export const selectTotals = createAppSelector([selectBudget], computeTotals);

// Plain numbers: components re-render only when the value itself changes.
export const selectIncome = (state: RootState) => selectTotals(state).income;
export const selectOutgoing = (state: RootState) =>
  selectTotals(state).outgoing;
export const selectSavings = (state: RootState) => selectTotals(state).savings;
export const selectSpending = (state: RootState) =>
  selectTotals(state).spending;
export const selectBalance = (state: RootState) => selectTotals(state).balance;

/** A bucket's monthly total: its rough total when estimated, else its rows. */
export const selectBucketTotal = (state: RootState, bucket: BucketId) => {
  const totals = selectTotals(state);
  return bucket === "income" ? totals.income : totals.byBucket[bucket];
};

/** The savings badge: savings as a share of income, rated by the savings rule. */
export const selectSavingsRate = createAppSelector(
  [selectSavings, selectIncome],
  (savings, income) => evaluateRule("savings", savings, income),
);

// ── Results ──────────────────────────────────────────────────────────────────

export const selectHeadline = createAppSelector(
  [selectTotals],
  headline,
  keepIfShallowEqual,
);

export const selectChecks = createAppSelector(
  [selectBudget, selectTotals],
  computeChecks,
);

export const selectFlaggedChecks = createAppSelector(
  [selectChecks],
  flaggedChecks,
);

export const selectRoughBuckets = createAppSelector(
  [selectBudget],
  roughBuckets,
  keepIfShallowEqual,
);

export const selectTopExpenses = createAppSelector([selectBudget], topExpenses);

export const selectNextSteps = createAppSelector(
  [selectBudget, selectTotals, selectChecks],
  nextSteps,
);
