import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { STEPS, type BucketId } from "@/domain/catalog/buckets";
import { isBudgetEdit } from "@/features/budget/budgetSlice";
import { hydrated } from "@/store/hydrated";

export type View = "month" | "year";

/** Narrowed to the dictionary's toast keys when the Toaster lands (step 12). */
export type ToastKey = string;

/** Stores a key + params, not text, so a toast survives a language switch. */
export type Toast = {
  id: number;
  key: ToastKey;
  params?: Record<string, string>;
};

export type UiState = {
  /** Index into `STEPS`. */
  step: number;
  view: View;
  showAllChips: Partial<Record<BucketId, boolean>>;
  /** Epoch ms. */
  lastFileSaveAt: number | null;
  /** First edit since the last file save/open; `null` = nothing unsaved. */
  changedAt: number | null;
  noticeSnoozedUntil: number | null;
  /** Transient. */
  toast: Toast | null;
  /** Transient: whether local storage has been read (step 8). */
  hydrated: boolean;
};

/** The fields kept in local storage (Spec §6.4). */
export const PERSISTED_UI_KEYS = [
  "step",
  "view",
  "showAllChips",
  "lastFileSaveAt",
  "changedAt",
  "noticeSnoozedUntil",
] as const satisfies readonly (keyof UiState)[];

export type PersistedUi = Pick<UiState, (typeof PERSISTED_UI_KEYS)[number]>;

const LAST_STEP = STEPS.length - 1;

/** An existing step index; anything else is the first step. */
export function clampStep(value: number): number {
  const step = Math.trunc(value);
  return Number.isFinite(step) ? Math.min(Math.max(step, 0), LAST_STEP) : 0;
}

export const NOTICE_SNOOZE_MS = 60 * 60 * 1000;

const initialState: UiState = {
  step: 0,
  view: "month",
  showAllChips: {},
  lastFileSaveAt: null,
  changedAt: null,
  noticeSnoozedUntil: null,
  toast: null,
  hydrated: false,
};

const stamped = () => ({ payload: Date.now() });

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    /** Clamped to an existing step. */
    stepChanged: (state, action: PayloadAction<number>) => {
      state.step = clampStep(action.payload);
    },
    viewChanged: (state, action: PayloadAction<View>) => {
      state.view = action.payload;
    },
    showAllChipsToggled: (state, action: PayloadAction<BucketId>) => {
      const bucket = action.payload;
      state.showAllChips[bucket] = !state.showAllChips[bucket];
    },
    /** The budget was written to a file: nothing is unsaved any more. */
    fileSaved: {
      reducer: (state, action: PayloadAction<number>) => {
        state.lastFileSaveAt = action.payload;
        state.changedAt = null;
      },
      prepare: stamped,
    },
    /** "Later" on the unsaved-changes notice hides it for an hour. */
    noticeSnoozed: {
      reducer: (state, action: PayloadAction<number>) => {
        state.noticeSnoozedUntil = action.payload + NOTICE_SNOOZE_MS;
      },
      prepare: stamped,
    },
    /** Replaces the current toast; a new id restarts its timer. */
    toastShown: (state, action: PayloadAction<Omit<Toast, "id">>) => {
      state.toast = { id: (state.toast?.id ?? 0) + 1, ...action.payload };
    },
    /** Ignored when a newer toast has replaced the one that timed out. */
    toastDismissed: (state, action: PayloadAction<number>) => {
      if (state.toast?.id === action.payload) state.toast = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrated, (state, action) => {
      Object.assign(state, action.payload.ui);
      state.hydrated = true;
    });
    builder.addMatcher(isBudgetEdit, (state, action) => {
      state.changedAt ??= action.meta.at;
    });
  },
  selectors: {
    selectStep: (ui) => ui.step,
    selectStepId: (ui) => STEPS[ui.step],
    selectView: (ui) => ui.view,
    selectShowAllChips: (ui, bucket: BucketId) =>
      ui.showAllChips[bucket] === true,
    selectLastFileSaveAt: (ui) => ui.lastFileSaveAt,
    selectIsUnsaved: (ui) => ui.changedAt !== null,
    /** `now` is passed in so the selector stays pure. */
    selectIsNoticeShown: (ui, now: number) =>
      ui.changedAt !== null &&
      (ui.noticeSnoozedUntil === null || ui.noticeSnoozedUntil <= now),
    selectToast: (ui) => ui.toast,
    selectHydrated: (ui) => ui.hydrated,
  },
});

export const {
  stepChanged,
  viewChanged,
  showAllChipsToggled,
  fileSaved,
  noticeSnoozed,
  toastShown,
  toastDismissed,
} = uiSlice.actions;
