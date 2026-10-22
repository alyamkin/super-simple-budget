"use client";

import { useEffect } from "react";
import { toastDismissed, uiSlice } from "@/features/wizard/uiSlice";
import { useTranslator } from "@/i18n/I18nProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const { selectToast } = uiSlice.selectors;

export const TOAST_MS = 2400;

/**
 * The one toast live region (Spec §4.8). It stays in the DOM so screen readers
 * announce each message; a new toast replaces the old one and restarts the
 * timer.
 */
export function Toaster() {
  const { t } = useTranslator();
  const dispatch = useAppDispatch();
  const toast = useAppSelector(selectToast);
  const id = toast?.id;

  useEffect(() => {
    if (id === undefined) return;
    const timer = setTimeout(() => dispatch(toastDismissed(id)), TOAST_MS);
    return () => clearTimeout(timer);
  }, [dispatch, id]);

  const params = toast?.params ?? {};
  const vars = Object.fromEntries(
    Object.entries(params).map(([name, key]) => [name, t(key)]),
  );

  return (
    <div role="status">
      {toast && (
        // Keyed by id so a repeated message is a new node and is re-announced.
        <p
          key={toast.id}
          className="fixed bottom-[calc(90px+env(safe-area-inset-bottom,0px))] left-1/2 z-50 max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-lg bg-ink px-4 py-2.5 text-[.9rem] text-bg"
        >
          {t(`toasts.${toast.key}`, vars)}
        </p>
      )}
    </div>
  );
}
