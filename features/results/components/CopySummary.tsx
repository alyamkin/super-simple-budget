"use client";

import { Button } from "@/components/ui/Button";
import { selectRoughBuckets, selectTotals } from "@/features/budget/selectors";
import { toastShown } from "@/features/wizard/uiSlice";
import { useTranslator } from "@/i18n/I18nProvider";
import { useAppDispatch, useAppStore } from "@/store/hooks";
import { summaryText } from "../summaryText";

/**
 * The results' primary "Copy summary" button (Spec §4.6.8, §4.9). Reads the
 * store on click, so it never re-renders while the plan changes.
 */
export function CopySummary({ className }: { className?: string }) {
  const translator = useTranslator();
  const dispatch = useAppDispatch();
  const store = useAppStore();

  const copy = async () => {
    const state = store.getState();
    const text = summaryText(
      translator,
      selectTotals(state),
      selectRoughBuckets(state),
    );
    try {
      // Throws synchronously too when the Clipboard API is missing.
      await navigator.clipboard.writeText(text);
      dispatch(toastShown({ key: "copied" }));
    } catch {
      dispatch(toastShown({ key: "noCopy" }));
    }
  };

  return (
    <Button variant="primary" className={className} onClick={copy}>
      {translator.t("results.summary.copy")}
    </Button>
  );
}
