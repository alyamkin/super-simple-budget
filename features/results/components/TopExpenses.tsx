"use client";

import { bucketColor } from "@/domain/catalog/buckets";
import type { Expense } from "@/domain/results";
import { rowLabel } from "@/features/budget/rowLabel";
import {
  selectIncome,
  selectTopExpenses,
} from "@/features/budget/selectors";
import { useViewMoney } from "@/features/wizard/useViewMoney";
import { useTranslator } from "@/i18n/I18nProvider";
import type { Translator } from "@/i18n/translate";
import { formatPercent } from "@/lib/format";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useAppSelector } from "@/store/hooks";
import { ExpenseBar } from "./charts/ExpenseBar";
import { ResultCard } from "./ResultCard";

function expenseLabel(t: Translator["t"], expense: Expense): string {
  if (expense.kind === "estimate") {
    return t("results.top.roughTotal", {
      name: t(`buckets.${expense.bucket}.title`),
    });
  }
  return rowLabel(t, expense.row);
}

/** "Your biggest expenses": the top 5 as bars. */
export function TopExpenses() {
  const { t, plural, locale } = useTranslator();
  const { view, money } = useViewMoney();
  const { top, count, share } = useAppSelector(selectTopExpenses);
  const income = useAppSelector(selectIncome);
  const animate = !usePrefersReducedMotion();
  if (!top.length) return null;

  const largest = top[0].amount;

  return (
    <ResultCard
      title={t("results.top.title")}
      aside={plural("results.top.count", count, { n: top.length, m: count })}
    >
      <p className="-mt-1.5 mb-3 text-[.86rem] text-muted">
        {top.length < count
          ? t("results.top.share", {
              n: top.length,
              p: formatPercent(share, locale),
            })
          : t("results.top.largest")}
      </p>
      <ol className="grid gap-3">
        {top.map((expense) => (
          <li
            key={expense.kind === "row" ? expense.row.id : expense.bucket}
            className="grid min-w-0 gap-1"
          >
            <div className="flex justify-between gap-2.5 text-[.92rem]">
              <span className="min-w-0 truncate">{expenseLabel(t, expense)}</span>
              <b className="font-mono font-medium whitespace-nowrap tabular-nums">
                {money(expense.amount)}
                {t(`per.${view}`)}
              </b>
            </div>
            <ExpenseBar
              amount={expense.amount}
              largest={largest}
              color={bucketColor(expense.bucket)}
              animate={animate}
            />
            {income > 0 && (
              <small className="text-[.76rem] text-muted">
                {t("budget.ofIncome", {
                  p: formatPercent(expense.amount / income, locale, { decimals: 1 }),
                })}
              </small>
            )}
          </li>
        ))}
      </ol>
    </ResultCard>
  );
}
