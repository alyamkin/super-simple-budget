"use client";

import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Chip } from "@/components/ui/Chip";
import { SearchIcon } from "@/components/ui/Icons";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { BUCKET_OF_ITEM, type BucketId } from "@/domain/catalog/buckets";
import type { ItemId } from "@/domain/catalog/items";
import { toastShown } from "@/features/wizard/uiSlice";
import { useTranslator } from "@/i18n/I18nProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { rowAdded } from "../budgetSlice";
import { focusById, focusTargets } from "../focusTargets";
import { buildSearchIndex, searchItems } from "../itemSearch";
import { selectPickedItemIds } from "../selectors";

/**
 * Search across every bucket's items. A hit from this bucket clears the
 * search and focuses the new row's amount; one from another bucket stays
 * here, shows "Added to {bucket}" and keeps focus in the search box.
 */
export function ItemSearch({ bucket }: { bucket: BucketId }) {
  const { t, plural } = useTranslator();
  const dispatch = useAppDispatch();
  const picked = useAppSelector(selectPickedItemIds);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsId = useId();

  // Rebuilt only when the translator changes (React Compiler memoises it).
  const index = buildSearchIndex(t);
  const hits = searchItems(index, query, picked);
  const searching = query.trim() !== "";

  const pick = (itemId: ItemId) => {
    const target = BUCKET_OF_ITEM[itemId];
    if (target === bucket) {
      flushSync(() => {
        dispatch(rowAdded({ itemId }));
        setQuery("");
      });
      focusById(focusTargets.amount(itemId));
      return;
    }
    dispatch(rowAdded({ itemId }));
    dispatch(
      toastShown({ key: "addedTo", params: { bucket: `buckets.${target}.title` } }),
    );
    // The chip that had focus is gone from the results.
    inputRef.current?.focus();
  };

  return (
    <div className="mt-3.5 mb-1">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-[11px] -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          aria-label={t("budget.searchLabel")}
          aria-controls={resultsId}
          placeholder={t("budget.searchPlaceholder")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="field rounded-[9px] bg-surface py-2.5 pr-3 pl-9"
        />
      </div>
      <VisuallyHidden aria-live="polite">
        {searching &&
          (hits.length
            ? plural("budget.searchResults", hits.length)
            : t("budget.noMatch"))}
      </VisuallyHidden>
      <div id={resultsId} className="mt-2.5 flex flex-wrap gap-2 empty:hidden">
        {searching && !hits.length && (
          <p className="text-[.85rem] text-muted">{t("budget.noMatch")}</p>
        )}
        {hits.map((itemId) => {
          const label = t(`items.${itemId}.label`);
          const target = BUCKET_OF_ITEM[itemId];
          const where =
            target === bucket ? "" : t(`buckets.${target}.title`);
          const name = t("budget.add", { label });
          return (
            <Chip
              key={itemId}
              aria-label={where ? `${name} · ${where}` : name}
              onClick={() => pick(itemId)}
            >
              {label}
              {where && (
                <span className="text-[.75rem] text-muted">· {where}</span>
              )}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}
