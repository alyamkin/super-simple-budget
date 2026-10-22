"use client";

import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useFileActions } from "@/features/files/useFileActions";
import { useTranslator } from "@/i18n/I18nProvider";

/** The actions that replace the budget. */
export type ConfirmAction = "clear" | "open";

type ConfirmDialogProps = {
  action: ConfirmAction;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Asks before an action replaces an unsaved budget. Mount it only
 * while asking. "Save budget first" keeps it open: once the file is saved the
 * body says so and the primary button runs the action.
 */
export function ConfirmDialog({
  action,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslator();
  const { save } = useFileActions();
  const [saved, setSaved] = useState(false);
  const primary = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const bodyId = useId();

  const saveFirst = () => {
    if (!save()) return;
    flushSync(() => setSaved(true));
    primary.current?.focus();
  };

  return (
    <Dialog
      open
      onClose={onCancel}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
    >
      <h3 id={titleId} className="mb-2 text-[1.25rem] font-bold">
        {t(`notices.confirm.${action}Title`)}
      </h3>
      <p id={bodyId} className="mt-0 mb-[18px] text-muted">
        {t(saved ? "notices.confirm.saved" : "notices.confirm.body")}
      </p>
      <div className="flex flex-col gap-2 [&>button]:w-full">
        {saved ? (
          <Button ref={primary} variant="primary" onClick={onConfirm}>
            {t(`notices.confirm.${action}`)}
          </Button>
        ) : (
          <>
            <Button variant="primary" onClick={saveFirst}>
              {t("notices.confirm.saveFirst")}
            </Button>
            <Button onClick={onConfirm}>{t("notices.confirm.continue")}</Button>
          </>
        )}
        <Button variant="ghost" onClick={onCancel}>
          {t("notices.confirm.cancel")}
        </Button>
      </div>
    </Dialog>
  );
}
