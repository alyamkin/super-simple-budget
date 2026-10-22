import { combineSlices, createSelector } from "@reduxjs/toolkit";
import { budgetSlice } from "@/features/budget/budgetSlice";
import { uiSlice } from "@/features/wizard/uiSlice";

/** Each slice is mounted under its `name`, where its `selectors` expect it. */
export const rootReducer = combineSlices(budgetSlice, uiSlice);

export type RootState = ReturnType<typeof rootReducer>;

/** `createSelector` with `state` typed as {@link RootState}. */
export const createAppSelector = createSelector.withTypes<RootState>();
