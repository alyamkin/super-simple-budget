"use client";

import { useId } from "react";
import { flushSync } from "react-dom";
import { Chip } from "@/components/ui/Chip";
import type { BucketId } from "@/domain/catalog/buckets";
import type { ItemId } from "@/domain/catalog/items";
import { showAllChipsToggled, uiSlice } from "@/features/wizard/uiSlice";
import { useTranslator } from "@/i18n/I18nProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { customRowAdded, rowAdded } from "../budgetSlice";
import { focusById, focusTargets } from "../focusTargets";
import { selectChips, selectPickedCount } from "../selectors";

const { selectShowAllChips } = uiSlice.selectors;

/**
 * Chips for the bucket's popular, not-yet-picked items, the rest behind
 * "Show {n} more", and "+ Something else" for a custom row (Spec §4.3.4).
 * A pick focuses the new row's first field (Spec §4.4).
 */
export function ChipPicker({ bucket }: { bucket: BucketId }) {
  const { t } = useTranslator();
  const dispatch = useAppDispatch();
  const hasRows = useAppSelector((state) => selectPickedCount(state, bucket) > 0);
  const { popular, more } = useAppSelector((state) => selectChips(state, bucket));
  const showAll = useAppSelector((state) => selectShowAllChips(state, bucket));
  const chipsId = useId();

  const pick = (itemId: ItemId) => {
    flushSync(() => dispatch(rowAdded({ itemId })));
    focusById(focusTargets.amount(itemId));
  };

  const addCustom = () => {
    const action = customRowAdded({ bucket });
    flushSync(() => dispatch(action));
    focusById(focusTargets.label(action.payload.id));
  };

  const shown = showAll ? [...popular, ...more] : popular;

  return (
    <div>
      <h3
        id={focusTargets.pickerHeading}
        tabIndex={-1}
        className="mt-1 mb-2.5 text-base font-bold"
      >
        {hasRows ? t("budget.anythingElse") : t("budget.tapWhat")}
      </h3>
      <div id={chipsId} className="flex flex-wrap gap-2">
        {shown.map((itemId) => {
          const label = t(`items.${itemId}.label`);
          return (
            <Chip
              key={itemId}
              aria-label={t("budget.add", { label })}
              onClick={() => pick(itemId)}
            >
              {label}
            </Chip>
          );
        })}
        {more.length > 0 && (
          <Chip
            variant="more"
            aria-expanded={showAll}
            aria-controls={chipsId}
            onClick={() => dispatch(showAllChipsToggled(bucket))}
          >
            {showAll
              ? t("budget.showFewer")
              : t("budget.showMore", { n: more.length })}
          </Chip>
        )}
        <Chip variant="more" onClick={addCustom}>
          {t("budget.somethingElse")}
        </Chip>
      </div>
    </div>
  );
}
