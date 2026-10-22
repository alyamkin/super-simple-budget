"use client";

import { useId } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Check } from "@/domain/results";
import {
  greenEdge,
  ruleBar,
  ruleSentence,
  type RuleLevel,
} from "@/domain/rules";
import {
  selectChecks,
  selectRoughBuckets,
} from "@/features/budget/selectors";
import { uiSlice, VIEW_MULTIPLIER } from "@/features/wizard/uiSlice";
import { useTranslator } from "@/i18n/I18nProvider";
import { classNames } from "@/lib/classNames";
import { formatList, formatMoney, formatPercent } from "@/lib/format";
import { useAppSelector } from "@/store/hooks";

const { selectView } = uiSlice.selectors;

/** Counts are listed worst first, like the checks. */
const LEVELS: readonly RuleLevel[] = ["red", "yellow", "green"];

const BAR_FILL: Record<RuleLevel, string> = {
  green: "bg-good",
  yellow: "bg-warn",
  red: "bg-bad",
};

const ROW = "border-t border-line px-[18px] py-2.5 max-tablet:px-3.5";

/**
 * "How your plan compares": each itemized category as a share of income
 * against the usual Canadian range (Spec §4.6.6, §7.4). The bars are
 * decorative; the share, status and sentence carry the information.
 */
export function CompareSection() {
  const { t, plural, locale } = useTranslator();
  const checks = useAppSelector(selectChecks);
  const rough = useAppSelector(selectRoughBuckets);
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="mb-3 min-w-0 overflow-hidden rounded-card border border-line bg-surface"
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-[18px] pt-4 pb-1 max-tablet:px-3.5">
        <h3 id={titleId} className="text-[1.15rem] font-bold max-tablet:text-[1.05rem]">
          {t("results.compare.title")}
        </h3>
        {checks.length > 0 && (
          <p className="flex flex-wrap gap-1.5">
            {LEVELS.map((level) => {
              const n = checks.filter((check) => check.level === level).length;
              return n ? (
                <StatusBadge key={level} level={level}>
                  {plural(`results.compare.count.${level}`, n)}
                </StatusBadge>
              ) : null;
            })}
          </p>
        )}
      </div>
      <p className="px-[18px] pb-3 text-[.86rem] text-muted max-tablet:px-3.5">
        {t("results.compare.explain")}
      </p>
      {checks.length ? (
        <ul>
          {checks.map((check) => (
            <RuleRow key={check.category} check={check} />
          ))}
        </ul>
      ) : (
        // With income there is always a check: savings is rated even at zero.
        <p className={classNames(ROW, "text-[.84rem] text-muted")}>
          {t("results.compare.addIncome")}
        </p>
      )}
      {rough.length > 0 && (
        <p className={classNames(ROW, "text-[.84rem] text-muted")}>
          {t("results.compare.notCompared", {
            buckets: formatList(
              rough.map((bucket) => t(`buckets.${bucket}.title`)),
              locale,
            ),
          })}
        </p>
      )}
    </section>
  );
}

function RuleRow({ check }: { check: Check }) {
  const { t, locale } = useTranslator();
  const view = useAppSelector(selectView);
  const { category, amount, level, share } = check;
  const bar = ruleBar(category, share);

  return (
    <li className={classNames(ROW, "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5")}>
      <span className="text-[.93rem] font-bold">
        {t(`categories.${category}`)}{" "}
        <span className="ml-1 font-mono text-[.82rem] font-medium whitespace-nowrap text-muted">
          {formatPercent(share, locale, { decimals: 1 })} ·{" "}
          {formatMoney(amount * VIEW_MULTIPLIER[view], locale)}
          {t(`per.${view}`)}
        </span>
      </span>
      <StatusBadge level={level} className="self-start justify-self-end">
        {t(`rule.level.${level}`)}
      </StatusBadge>
      <span className="col-span-full text-[.84rem] text-muted">
        {t(`rule.${ruleSentence(category, check)}`, {
          edge: formatPercent(greenEdge(category), locale),
        })}
      </span>
      <div
        aria-hidden="true"
        className="relative col-span-full mt-1.5 h-1.5 rounded-[3px] bg-line"
      >
        <i
          className={classNames("absolute inset-y-0 left-0 rounded-[3px]", BAR_FILL[level])}
          style={{ width: `${bar.fill * 100}%` }}
        />
        <em
          className="absolute -top-1 -bottom-1 w-0.5 bg-ink"
          style={{ left: `${bar.marker * 100}%` }}
        />
      </div>
    </li>
  );
}
