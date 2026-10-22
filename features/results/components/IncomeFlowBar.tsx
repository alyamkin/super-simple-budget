"use client";

import {
  selectIncomeFlow,
  selectTotals,
} from "@/features/budget/selectors";
import { FLOW_COLORS } from "@/features/results/flowColors";
import { uiSlice, VIEW_MULTIPLIER } from "@/features/wizard/uiSlice";
import { useTranslator } from "@/i18n/I18nProvider";
import { classNames } from "@/lib/classNames";
import { formatMoney, formatPercent } from "@/lib/format";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useAppSelector } from "@/store/hooks";
import { IncomeFlowChart } from "./charts/IncomeFlowChart";
import { ResultCard } from "./ResultCard";

const { selectView } = uiSlice.selectors;

type KeyEntry = {
  kind: keyof typeof FLOW_COLORS | "shortfall";
  amount: number;
};

/** "Where your income goes": the flow bar and its key (Spec §4.6.3, §10.2). */
export function IncomeFlowBar() {
  const { t, locale } = useTranslator();
  const flow = useAppSelector(selectIncomeFlow);
  const totals = useAppSelector(selectTotals);
  const view = useAppSelector(selectView);
  const animate = !usePrefersReducedMotion();
  if (!flow) return null;

  const money = (amount: number) =>
    formatMoney(amount * VIEW_MULTIPLIER[view], locale);
  const { income, savings, spending, balance } = totals;
  const entries: KeyEntry[] = [
    { kind: "savings", amount: savings },
    { kind: "spending", amount: spending },
  ];
  if (balance > 0) entries.push({ kind: "leftOver", amount: balance });
  if (balance < 0) entries.push({ kind: "shortfall", amount: -balance });

  return (
    <ResultCard
      title={t("results.flow.title")}
      aside={t("results.flow.income", {
        amount: money(income),
        per: t(`per.${view}`),
      })}
    >
      <IncomeFlowChart
        {...flow}
        incomeLabel={t("results.flow.incomeMark")}
        animate={animate}
      />
      <ul className="mt-3.5 grid grid-cols-3 gap-2.5 max-tablet:gap-1.5">
        {entries.map(({ kind, amount }) => (
          <li
            key={kind}
            className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-0.5 text-[.9rem] max-tablet:gap-x-1.5 max-tablet:text-[.8rem]"
          >
            <span
              aria-hidden="true"
              className="size-2.5 rounded-[3px]"
              style={{
                background: kind === "shortfall" ? "var(--bad)" : FLOW_COLORS[kind],
              }}
            />
            <span>{t(`results.flow.${kind}`)}</span>
            <b
              className={classNames(
                "col-[2/-1] font-display text-[1.25rem] tabular-nums max-tablet:text-base",
                kind === "shortfall" && "text-bad",
              )}
            >
              {money(amount)}
            </b>
            {income > 0 && (
              <small className="col-[2/-1] -mt-0.5 text-[.78rem] text-muted">
                {t("budget.ofIncome", { p: formatPercent(amount / income, locale) })}
              </small>
            )}
          </li>
        ))}
      </ul>
    </ResultCard>
  );
}
