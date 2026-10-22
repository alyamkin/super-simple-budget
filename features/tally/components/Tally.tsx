"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  BUCKETS,
  isEstimable,
  OUTGOING_BUCKETS,
  type EstimableBucketId,
  type OutgoingBucketId,
} from "@/domain/catalog/buckets";
import { balanceLevel, type BalanceLevel } from "@/domain/totals";
import { selectIsEstimated, selectTotals } from "@/features/budget/selectors";
import {
  uiSlice,
  viewChanged,
  VIEW_MULTIPLIER,
  type View,
} from "@/features/wizard/uiSlice";
import { useTranslator } from "@/i18n/I18nProvider";
import { classNames } from "@/lib/classNames";
import { formatMoney } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const { selectView } = uiSlice.selectors;

const VIEWS: readonly View[] = ["month", "year"];

const BALANCE_CLASSES: Record<BalanceLevel, string> = {
  leftOver: "bg-good-soft text-good",
  even: "bg-accent-soft text-accent",
  shortfall: "bg-bad-soft text-bad",
};

const bucketColor = (bucket: OutgoingBucketId) => `var(${BUCKETS[bucket].color})`;

/** The desktop running total beside the step. */
export function Tally() {
  const { t, locale } = useTranslator();
  const dispatch = useAppDispatch();
  const view = useAppSelector(selectView);
  const totals = useAppSelector(selectTotals);
  const multiplier = VIEW_MULTIPLIER[view];
  const money = (amount: number) => formatMoney(amount * multiplier, locale);
  const level = balanceLevel(totals.balance);
  // The stack shares one scale so it shows both what is planned and what is left.
  const base = Math.max(totals.income, totals.outgoing) || 1;

  return (
    <aside
      aria-label={t("tally.label")}
      className="sticky top-5 rounded-card border border-line bg-surface p-[18px] max-tablet:hidden"
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h3 className="text-base font-bold">{t("tally.title")}</h3>
        <SegmentedControl
          label={t("tally.showAmounts")}
          options={VIEWS.map((value) => ({ value, label: t(`tally.view.${value}`) }))}
          value={view}
          onValueChange={(value) => dispatch(viewChanged(value))}
        />
      </div>
      <dl className="text-[.9rem]">
        <div className="mb-1 flex justify-between gap-2 border-b border-line pt-1.5 pb-2.5">
          <dt>{t("tally.income")}</dt>
          <dd className="font-mono tabular-nums">{money(totals.income)}</dd>
        </div>
        {OUTGOING_BUCKETS.map((bucket) => (
          <div
            key={bucket}
            className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-2 py-1.5"
          >
            <span
              aria-hidden="true"
              className="size-2.5 rounded-[3px]"
              style={{ background: bucketColor(bucket) }}
            />
            <dt>
              {t(`buckets.${bucket}.title`)}
              {isEstimable(bucket) && <RoughMarker bucket={bucket} />}
            </dt>
            <dd className="font-mono tabular-nums">
              {money(totals.byBucket[bucket])}
            </dd>
          </div>
        ))}
      </dl>
      <div
        aria-hidden="true"
        className="mt-3 flex h-2.5 overflow-hidden rounded-[5px] bg-line"
      >
        {OUTGOING_BUCKETS.filter((bucket) => totals.byBucket[bucket] > 0).map(
          (bucket) => (
            <i
              key={bucket}
              className="block h-full"
              style={{
                width: `${(totals.byBucket[bucket] / base) * 100}%`,
                background: bucketColor(bucket),
              }}
            />
          ),
        )}
      </div>
      <div
        data-level={level}
        className={classNames("mt-3 rounded-[9px] p-3.5", BALANCE_CLASSES[level])}
      >
        <div className="text-xs font-bold tracking-[.08em] uppercase">
          {t(level === "shortfall" ? "tally.shortfall" : "tally.leftOver")}
        </div>
        <div className="font-display text-[1.9rem] font-bold tabular-nums">
          {money(totals.balance)}
        </div>
      </div>
    </aside>
  );
}

/** "rough" after a bucket that has a rough total instead of rows. */
function RoughMarker({ bucket }: { bucket: EstimableBucketId }) {
  const { t } = useTranslator();
  const estimated = useAppSelector((state) => selectIsEstimated(state, bucket));
  if (!estimated) return null;
  return (
    <>
      {" "}
      <span className="text-[.7rem] text-muted">{t("tally.rough")}</span>
    </>
  );
}
