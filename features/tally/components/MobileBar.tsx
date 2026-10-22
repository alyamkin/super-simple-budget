"use client";

import { Button } from "@/components/ui/Button";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { balanceLevel } from "@/domain/totals";
import {
  selectBalance,
  selectIncome,
  selectOutgoing,
} from "@/features/budget/selectors";
import { uiSlice, viewChanged, VIEW_MULTIPLIER } from "@/features/wizard/uiSlice";
import { useTranslator } from "@/i18n/I18nProvider";
import { classNames } from "@/lib/classNames";
import { formatMoney } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const { selectView } = uiSlice.selectors;

/**
 * The tally docked to the bottom below the tablet breakpoint (Spec §4.5):
 * income, planned and the balance, plus a `/mo` ↔ `/yr` switch.
 */
export function MobileBar() {
  const { t, locale } = useTranslator();
  const dispatch = useAppDispatch();
  const view = useAppSelector(selectView);
  const income = useAppSelector(selectIncome);
  const outgoing = useAppSelector(selectOutgoing);
  const balance = useAppSelector(selectBalance);
  const money = (amount: number) =>
    formatMoney(amount * VIEW_MULTIPLIER[view], locale);
  const short = balanceLevel(balance) === "shortfall";
  const other = view === "month" ? "year" : "month";

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-line bg-surface pt-2.5 pr-[max(16px,env(safe-area-inset-right,0px))] pb-[calc(10px+env(safe-area-inset-bottom,0px))] pl-[max(16px,env(safe-area-inset-left,0px))] tablet:hidden">
      <dl className="flex gap-4 text-[.74rem] text-muted">
        <Figure term={t("tally.income")} value={money(income)} />
        <Figure term={t("tally.planned")} value={money(outgoing)} />
        <Figure
          term={t(short ? "tally.short" : "tally.left")}
          value={money(balance)}
          className={short ? "text-bad" : "text-good"}
        />
      </dl>
      <Button
        className="min-w-14"
        onClick={() => dispatch(viewChanged(other))}
      >
        {t(`per.${view}`)} <VisuallyHidden>{t(`tally.switchTo.${other}`)}</VisuallyHidden>
      </Button>
    </div>
  );
}

function Figure({
  term,
  value,
  className = "text-ink",
}: {
  term: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <dt>{term}</dt>
      <dd className={classNames("font-mono text-[.95rem] font-medium", className)}>
        {value}
      </dd>
    </div>
  );
}
