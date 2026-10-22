"use client";

import { useEffect, useEffectEvent, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import type { ItemId } from "@/domain/catalog/items";
import { useTranslator } from "@/i18n/I18nProvider";
import { makeStore } from "./makeStore";
import { startPersistence } from "./persistence";

/**
 * Creates this tree's store once, on first render (Spec §6.1), and hydrates it
 * from local storage after mount, so server and first client render match.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);
  // What the server rendered. Selectors read it while hydrating, because Next
  // hydrates the page after this layout's effects have already hydrated the
  // store; React re-renders with the real state once hydration is done.
  const [serverState] = useState(store.getState);
  const { locale, t } = useTranslator();
  const itemLabel = useEffectEvent((id: ItemId) => t(`items.${id}.label`));

  useEffect(
    () => startPersistence(store, { locale, itemLabel: (id) => itemLabel(id) }),
    [store, locale],
  );

  return (
    <Provider store={store} serverState={serverState}>
      {children}
    </Provider>
  );
}
