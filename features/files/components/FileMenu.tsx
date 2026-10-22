"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import {
  ChevronDownIcon,
  DownloadIcon,
  FileIcon,
  SheetIcon,
  UploadIcon,
} from "@/components/ui/Icons";
import {
  ConfirmDialog,
  type ConfirmAction,
} from "@/features/notices/components/ConfirmDialog";
import { uiSlice } from "@/features/wizard/uiSlice";
import { useTranslator } from "@/i18n/I18nProvider";
import { useAppSelector } from "@/store/hooks";
import { useFileActions } from "../useFileActions";
import { BudgetFileInput } from "./BudgetFileInput";
import { LastSaved } from "./LastSaved";

const { selectIsUnsaved } = uiSlice.selectors;

/**
 * "File" in the header (Spec §4.1): a disclosure button whose panel saves,
 * opens, exports or clears the budget from any step. A dot on the button
 * marks unsaved changes. Opening and clearing ask first while unsaved.
 *
 * The panel is positioned against the header (`relative`), so on phones it
 * can span the header's width.
 */
export function FileMenu() {
  const { t } = useTranslator();
  const { save, exportCsv, clear } = useFileActions();
  const unsaved = useAppSelector(selectIsUnsaved);
  const [expanded, setExpanded] = useState(false);
  const [asking, setAsking] = useState<ConfirmAction | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setExpanded(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [expanded]);

  // Closed with focus back on the toggle first: the item that ran the action
  // unmounts, and the confirm dialog returns focus to whatever opened it.
  const closeToToggle = () => {
    flushSync(() => setExpanded(false));
    toggle.current?.focus();
  };

  const run = (action: ConfirmAction) => {
    if (action === "open") input.current?.click();
    else clear();
  };

  const request = (action: ConfirmAction) => {
    closeToToggle();
    if (unsaved) setAsking(action);
    else run(action);
  };

  const confirmed = (action: ConfirmAction) => {
    // Closed first: the modal makes the file input inert.
    flushSync(() => setAsking(null));
    run(action);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || !expanded) return;
    event.preventDefault();
    closeToToggle();
  };

  // Only when focus moves somewhere else: Safari doesn't focus buttons on
  // click, so a blur to nothing must not close the panel under the pointer.
  const onBlur = (event: FocusEvent) => {
    const next = event.relatedTarget;
    if (next instanceof Node && !root.current?.contains(next)) {
      setExpanded(false);
    }
  };

  return (
    <div ref={root} onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={toggle}
        type="button"
        aria-label={t(unsaved ? "files.menuUnsaved" : "files.menu")}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="btn relative inline-flex items-center gap-1.5 border-line bg-transparent px-2.5 text-accent hover:border-accent max-phone:min-h-10 max-phone:gap-0.5 max-phone:px-2"
        onClick={() => setExpanded(!expanded)}
      >
        <FileIcon />
        <span className="max-phone:sr-only">{t("files.menu")}</span>
        {unsaved && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-bg bg-warn"
          />
        )}
        <ChevronDownIcon />
      </button>
      <div
        id={panelId}
        hidden={!expanded}
        className="absolute top-full right-0 z-30 -mt-2 w-[340px] rounded-card border border-line bg-surface p-2 shadow-[0_12px_32px_rgba(0,0,0,.14)] max-phone:left-0 max-phone:w-auto"
      >
        <LastSaved className="block px-2.5 pt-1.5 pb-2 text-[.82rem] text-muted" />
        <ul className="m-0 list-none p-0">
          <MenuItem
            icon={<DownloadIcon />}
            title={t("files.save")}
            hint={t("files.saveHint")}
            onClick={() => {
              closeToToggle();
              save();
            }}
          />
          <MenuItem
            icon={<UploadIcon />}
            title={t("files.open")}
            hint={t("files.openHint")}
            onClick={() => request("open")}
          />
          <MenuItem
            icon={<SheetIcon />}
            title={t("files.exportCsv")}
            hint={t("files.exportCsvHint")}
            onClick={() => {
              closeToToggle();
              exportCsv();
            }}
          />
          <li className="mt-1 border-t border-line pt-1">
            <button
              type="button"
              className="w-full rounded-lg px-2.5 py-2 text-left text-[.92rem] font-bold text-ink hover:bg-accent-soft"
              onClick={() => request("clear")}
            >
              {t("files.clear")}
            </button>
          </li>
        </ul>
        <p className="m-0 px-2.5 pt-2 pb-1.5 text-[.78rem] leading-[1.4] text-muted">
          {t("files.explain")}
        </p>
      </div>
      {asking && (
        <ConfirmDialog
          action={asking}
          onConfirm={() => confirmed(asking)}
          onCancel={() => setAsking(null)}
        />
      )}
      <BudgetFileInput ref={input} />
    </div>
  );
}

type MenuItemProps = {
  icon: ReactNode;
  title: string;
  hint: string;
  onClick: () => void;
};

/** A panel button named by its title and described by its hint. */
function MenuItem({ icon, title, hint, onClick }: MenuItemProps) {
  const titleId = useId();
  const hintId = useId();
  return (
    <li>
      <button
        type="button"
        aria-labelledby={titleId}
        aria-describedby={hintId}
        className="flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left text-ink hover:bg-accent-soft [&>svg]:mt-px [&>svg]:flex-none [&>svg]:text-accent"
        onClick={onClick}
      >
        {icon}
        <span>
          <b id={titleId} className="block text-[.92rem]">
            {title}
          </b>
          <small id={hintId} className="mt-0.5 block text-[.78rem] leading-[1.35] text-muted">
            {hint}
          </small>
        </span>
      </button>
    </li>
  );
}
