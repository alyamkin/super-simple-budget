import { createAction } from "@reduxjs/toolkit";
import type { Budget } from "@/domain/budget";
import type { PersistedUi } from "@/features/wizard/uiSlice";

export type HydratedPayload = {
  /** `null` when nothing readable was stored: the budget stays empty. */
  budget: Budget | null;
  ui: Partial<PersistedUi>;
};

/**
 * Local storage was read after mount (Spec §6.4). Its own module because both
 * slices handle it and `uiSlice` already imports `budgetSlice`.
 */
export const hydrated = createAction<HydratedPayload>("store/hydrated");
