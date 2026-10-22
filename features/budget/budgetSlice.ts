import { createSlice, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";
import {
  emptyBudget,
  type Budget,
  type CustomId,
  type Row,
  type RowId,
} from "@/domain/budget";
import {
  BUCKET_OF_ITEM,
  type BucketId,
  type EstimableBucketId,
} from "@/domain/catalog/buckets";
import { ITEMS_BY_ID, type ItemId } from "@/domain/catalog/items";
import { DEFAULT_FREQUENCY, type Frequency } from "@/domain/frequency";
import { customId } from "@/lib/customId";
import { normalizeAmount } from "@/lib/parseAmount";
import { hydrated } from "@/store/hydrated";

/** Longest name a custom row can have. */
export const MAX_LABEL_LENGTH = 80;

type RowRef = { bucket: BucketId; id: RowId };

/** When the user made the edit; the `ui` slice turns it into `changedAt`. */
type EditMeta = { at: number };

/**
 * A reducer for a user edit. Its action carries the edit time in `meta.at`,
 * stamped in `prepare` so reducers stay pure.
 */
const edit = <P>(apply: (state: Budget, payload: P) => void) => ({
  reducer: (state: Budget, action: PayloadAction<P, string, EditMeta>) =>
    apply(state, action.payload),
  prepare: (payload: P) => ({ payload, meta: { at: Date.now() } }),
});

const findRow = (state: Budget, { bucket, id }: RowRef): Row | undefined =>
  state.rows[bucket].find((row) => row.id === id);

export const budgetSlice = createSlice({
  name: "budget",
  initialState: emptyBudget,
  reducers: {
    /** Adds a catalog item to its own bucket, wherever it was picked from. */
    rowAdded: edit<{ itemId: ItemId }>((state, { itemId }) => {
      const rows = state.rows[BUCKET_OF_ITEM[itemId]];
      if (rows.some((row) => row.id === itemId)) return;
      rows.push({
        kind: "catalog",
        id: itemId,
        amount: null,
        frequency: ITEMS_BY_ID[itemId].defaultFrequency,
      });
    }),
    customRowAdded: {
      reducer: (
        state,
        action: PayloadAction<
          { bucket: BucketId; id: CustomId },
          string,
          EditMeta
        >,
      ) => {
        const { bucket, id } = action.payload;
        state.rows[bucket].push({
          kind: "custom",
          id,
          label: "",
          amount: null,
          frequency: DEFAULT_FREQUENCY,
        });
      },
      prepare: ({ bucket }: { bucket: BucketId }) => ({
        payload: { bucket, id: customId() },
        meta: { at: Date.now() },
      }),
    },
    rowRemoved: edit<RowRef>((state, { bucket, id }) => {
      state.rows[bucket] = state.rows[bucket].filter((row) => row.id !== id);
    }),
    amountChanged: edit<RowRef & { amount: number | null }>((state, p) => {
      const row = findRow(state, p);
      if (row) row.amount = normalizeAmount(p.amount);
    }),
    frequencyChanged: edit<RowRef & { frequency: Frequency }>((state, p) => {
      const row = findRow(state, p);
      if (row) row.frequency = p.frequency;
    }),
    customLabelChanged: edit<RowRef & { label: string }>((state, p) => {
      const row = findRow(state, p);
      if (row?.kind === "custom") {
        row.label = p.label.slice(0, MAX_LABEL_LENGTH);
      }
    }),
    /** Switches a bucket to one rough total and back; its rows are kept. */
    estimateToggled: edit<{ bucket: EstimableBucketId; enabled: boolean }>(
      (state, { bucket, enabled }) => {
        const estimate = state.estimates[bucket];
        if (estimate) estimate.enabled = enabled;
        else if (enabled) {
          state.estimates[bucket] = {
            enabled,
            amount: null,
            frequency: DEFAULT_FREQUENCY,
          };
        }
      },
    ),
    estimateAmountChanged: edit<{
      bucket: EstimableBucketId;
      amount: number | null;
    }>((state, { bucket, amount }) => {
      const estimate = state.estimates[bucket];
      if (estimate) estimate.amount = normalizeAmount(amount);
    }),
    estimateFrequencyChanged: edit<{
      bucket: EstimableBucketId;
      frequency: Frequency;
    }>((state, { bucket, frequency }) => {
      const estimate = state.estimates[bucket];
      if (estimate) estimate.frequency = frequency;
    }),
    /** Open file, clear and hydrate: not an edit, so `changedAt` is untouched. */
    budgetReplaced: (_state, action: PayloadAction<Budget>) => action.payload,
  },
  extraReducers: (builder) => {
    builder.addCase(hydrated, (state, action) => action.payload.budget ?? state);
  },
  selectors: {
    selectBudget: (budget) => budget,
    selectAllRows: (budget) => budget.rows,
    selectBucketRows: (budget, bucket: BucketId) => budget.rows[bucket],
    selectRow: (budget, bucket: BucketId, id: RowId) =>
      budget.rows[bucket].find((row) => row.id === id),
    selectPickedCount: (budget, bucket: BucketId) =>
      budget.rows[bucket].length,
    selectEstimate: (budget, bucket: EstimableBucketId) =>
      budget.estimates[bucket],
    selectIsEstimated: (budget, bucket: EstimableBucketId) =>
      budget.estimates[bucket]?.enabled === true,
  },
});

export const {
  rowAdded,
  customRowAdded,
  rowRemoved,
  amountChanged,
  frequencyChanged,
  customLabelChanged,
  estimateToggled,
  estimateAmountChanged,
  estimateFrequencyChanged,
  budgetReplaced,
} = budgetSlice.actions;

/** Every action that edits the budget's data (all but `budgetReplaced`). */
export const isBudgetEdit = isAnyOf(
  rowAdded,
  customRowAdded,
  rowRemoved,
  amountChanged,
  frequencyChanged,
  customLabelChanged,
  estimateToggled,
  estimateAmountChanged,
  estimateFrequencyChanged,
);
