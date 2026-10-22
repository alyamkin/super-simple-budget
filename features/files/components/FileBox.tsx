"use client";

import { useId, useRef, type ChangeEvent, type ReactNode } from "react";
import { DownloadIcon, SheetIcon, UploadIcon } from "@/components/ui/Icons";
import { useTranslator } from "@/i18n/I18nProvider";
import { useFileActions } from "../useFileActions";
import { LastSaved } from "./LastSaved";

/**
 * "Keep your budget" on the results (Spec §4.6.8): save the JSON backup, open
 * one (a real button clicking a hidden file input) or export a spreadsheet.
 */
export function FileBox() {
  const { t } = useTranslator();
  const { save, exportCsv, open } = useFileActions();
  const input = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const onFileChosen = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    // Cleared so choosing the same file again still fires `change`.
    event.currentTarget.value = "";
    if (file) void open(file);
  };

  return (
    <section
      aria-labelledby={titleId}
      className="mt-[22px] mb-3 min-w-0 rounded-card border border-line bg-surface px-[18px] py-4 max-phone:p-3.5"
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2.5">
        <h3 id={titleId} className="text-[1.1rem] font-bold max-tablet:text-[1.05rem]">
          {t("files.title")}
        </h3>
        <LastSaved className="text-[.85rem] text-muted" />
      </div>
      <p className="-mt-1 mb-3.5 max-w-[62ch] text-[.88rem] text-muted">
        {t("files.explain")}
      </p>
      <div className="grid grid-cols-3 gap-2.5 max-phone:grid-cols-1">
        <FileAction
          icon={<DownloadIcon />}
          title={t("files.save")}
          hint={t("files.saveHint")}
          onClick={save}
        />
        <FileAction
          icon={<UploadIcon />}
          title={t("files.open")}
          hint={t("files.openHint")}
          onClick={() => input.current?.click()}
        />
        <FileAction
          icon={<SheetIcon />}
          title={t("files.exportCsv")}
          hint={t("files.exportCsvHint")}
          onClick={exportCsv}
        />
      </div>
      <input
        ref={input}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={onFileChosen}
      />
    </section>
  );
}

type FileActionProps = {
  icon: ReactNode;
  title: string;
  hint: string;
  onClick: () => void;
};

/** A large button named by its title and described by its hint. */
function FileAction({ icon, title, hint, onClick }: FileActionProps) {
  const titleId = useId();
  const hintId = useId();
  return (
    <button
      type="button"
      aria-labelledby={titleId}
      aria-describedby={hintId}
      className="flex items-start gap-3 rounded-[10px] border border-line bg-bg px-3.5 py-3 text-left text-ink hover:border-accent [&>svg]:mt-px [&>svg]:flex-none [&>svg]:text-accent"
      onClick={onClick}
    >
      {icon}
      <span>
        <b id={titleId} className="block text-[.95rem]">
          {title}
        </b>
        <small id={hintId} className="mt-0.5 block text-[.8rem] leading-[1.35] text-muted">
          {hint}
        </small>
      </span>
    </button>
  );
}
