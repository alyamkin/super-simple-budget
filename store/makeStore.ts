import { configureStore } from "@reduxjs/toolkit";
import { rootReducer, type RootState } from "./rootReducer";

/** A new store per call: one per `StoreProvider`, never a module singleton. */
export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({ reducer: rootReducer, preloadedState });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type { RootState };
