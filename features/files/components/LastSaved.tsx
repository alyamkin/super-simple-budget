"use client";

import { useSyncExternalStore } from "react";
import { uiSlice } from "@/features/wizard/uiSlice";
import { useTranslator } from "@/i18n/I18nProvider";
import { useAppSelector } from "@/store/hooks";
import { lastSavedText, localDay } from "../lastSaved";

const { selectLastFileSaveAt } = uiSlice.selectors;

// Read on every render, never pushed: the text changes at most once a day,
// and nothing has been saved yet when the server renders.
const noSubscription = () => () => {};
const today = () => localDay(Date.now());
const serverToday = () => 0;

/** When the budget was last saved to a file. */
export function LastSaved({ className }: { className?: string }) {
  const { t } = useTranslator();
  const savedAt = useAppSelector(selectLastFileSaveAt);
  const day = useSyncExternalStore(noSubscription, today, serverToday);
  return <span className={className}>{lastSavedText(t, savedAt, day)}</span>;
}
