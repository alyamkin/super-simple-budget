"use client";

import { useEffect, useEffectEvent, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import type { ItemId } from "@/domain/catalog/items";
import { useT } from "@/i18n/I18nProvider";
import { makeStore } from "./makeStore";
import { startPersistence } from "./persistence";

/**
 * Creates this tree's store once, on first render (Spec §6.1), and hydrates it
 * from local storage after mount, so server and first client render match.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);
  const { locale, t } = useT();
  const itemLabel = useEffectEvent((id: ItemId) => t(`items.${id}.label`));

  useEffect(
    () => startPersistence(store, { locale, itemLabel: (id) => itemLabel(id) }),
    [store, locale],
  );

  return <Provider store={store}>{children}</Provider>;
}
