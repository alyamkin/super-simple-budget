import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { rootReducer, type RootState } from "./rootReducer";

/** A new store per call: one per `StoreProvider`, never a module singleton. */
export const makeStore = (preloadedState?: Partial<RootState>) => {
  // Per store, so listeners (persistence) never outlive or leak across stores.
  const listener = createListenerMiddleware();
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listener.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type { RootState };
