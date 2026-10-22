"use client";

import { useId } from "react";
import { Button } from "@/components/ui/Button";
import { useFileActions } from "@/features/files/useFileActions";
import { noticeSnoozed, uiSlice } from "@/features/wizard/uiSlice";
import { STEP_HEADING_ID } from "@/features/wizard/useGoToStep";
import { useTranslator } from "@/i18n/I18nProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const { selectIsUnsaved, selectIsNoticeShown } = uiSlice.selectors;

/** Its buttons disappear with it, so focus moves on to the step heading. */
const moveFocusOn = () => document.getElementById(STEP_HEADING_ID)?.focus();

/**
 * "Changes not saved to a file" above the progress (Spec §4.8): save now or
 * snooze for an hour.
 */
export function UnsavedNotice() {
  const { t } = useTranslator();
  const dispatch = useAppDispatch();
  const { save } = useFileActions();
  const titleId = useId();
  // The clock is read with the store, never polled: a snooze that has run out
  // shows the notice again on the next change (Spec §14.6). Only read with
  // unsaved changes, which the prerendered state never has (Cache Components
  // rejects reading the time while prerendering).
  const shown = useAppSelector(
    (state) => selectIsUnsaved(state) && selectIsNoticeShown(state, Date.now()),
  );

  if (!shown) return null;

  const onSave = () => {
    if (save()) moveFocusOn();
  };

  const onLater = () => {
    dispatch(noticeSnoozed());
    moveFocusOn();
  };

  return (
    <section
      aria-labelledby={titleId}
      className="mb-4 flex flex-wrap items-center gap-3 rounded-card border border-warn bg-warn-soft px-3.5 py-3"
    >
      <span aria-hidden="true" className="size-2.5 flex-none rounded-full bg-warn" />
      <div className="grid min-w-0 flex-[1_1_260px] gap-0.5 text-[.9rem]">
        <b id={titleId}>{t("notices.unsavedTitle")}</b>
        <p className="m-0 text-ink opacity-85">{t("notices.unsavedBody")}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Button variant="primary" className="px-3.5 py-2" onClick={onSave}>
          {t("files.save")}
        </Button>
        <Button variant="ghost" className="px-3.5 py-2" onClick={onLater}>
          {t("notices.later")}
        </Button>
      </div>
    </section>
  );
}
