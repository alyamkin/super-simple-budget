"use client";

import { flushSync } from "react-dom";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { RowId } from "@/domain/budget";
import type { BucketId } from "@/domain/catalog/buckets";
import { uiSlice, VIEW_MULTIPLIER } from "@/features/wizard/uiSlice";
import { useTranslator } from "@/i18n/I18nProvider";
import type { PluralKey } from "@/i18n/translate";
import { formatMoney, formatPercent } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { rowRemoved } from "../budgetSlice";
import { focusById, focusTargets } from "../focusTargets";
import {
  selectBucketTotal,
  selectRowIds,
  selectSavingsRate,
} from "../selectors";
import { Row } from "./Row";

const { selectView } = uiSlice.selectors;

const COUNT_KEYS: Record<BucketId, PluralKey> = {
  income: "budget.count.income",
  savings: "budget.count.savings",
  home: "budget.count.other",
  around: "budget.count.other",
  everyday: "budget.count.other",
  family: "budget.count.other",
  debt: "budget.count.debt",
};

/**
 * The step's picked rows under a heading with their count and the step total
 * (Spec §4.3.3). On savings, a badge rates the savings rate.
 */
export function PickedPanel({ bucket }: { bucket: BucketId }) {
  const { t, plural, locale } = useTranslator();
  const dispatch = useAppDispatch();
  const ids = useAppSelector((state) => selectRowIds(state, bucket));
  const total = useAppSelector((state) => selectBucketTotal(state, bucket));
  const view = useAppSelector(selectView);

  // Focus goes to the next row's remove button, else the previous one's,
  // else the picker heading (Spec §4.3.1).
  const remove = (id: RowId) => {
    const index = ids.indexOf(id);
    const neighbour = ids[index + 1] ?? ids[index - 1];
    flushSync(() => dispatch(rowRemoved({ bucket, id })));
    focusById(
      neighbour ? focusTargets.remove(neighbour) : focusTargets.pickerHeading,
    );
  };

  return (
    <div className="mb-4 rounded-card border border-line bg-surface px-[18px] pt-1.5 pb-3.5 max-phone:px-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-3 pt-3 pb-1.5">
        <h3 className="text-base font-bold">
          {ids.length ? plural(COUNT_KEYS[bucket], ids.length) : t("budget.nothingYet")}
        </h3>
        <span className="font-mono text-[.95rem]">
          {formatMoney(total * VIEW_MULTIPLIER[view], locale)}
          {t(`per.${view}`)}
          {bucket === "savings" && <SavingsBadge />}
        </span>
      </div>
      {ids.length ? (
        ids.map((id) => (
          <Row key={id} bucket={bucket} id={id} onRemove={remove} />
        ))
      ) : (
        <p className="pt-2 pb-1 text-[.9rem] text-muted">
          {t("budget.emptyHint")}
        </p>
      )}
    </div>
  );
}

/** "{p} of income", coloured by the savings rule; hidden without income. */
function SavingsBadge() {
  const { t, locale } = useTranslator();
  const rate = useAppSelector(selectSavingsRate);
  if (!rate) return null;
  return (
    <StatusBadge level={rate.level} className="ml-2 font-body">
      {t("budget.ofIncome", {
        p: formatPercent(rate.share, locale, { decimals: 1 }),
      })}
    </StatusBadge>
  );
}
