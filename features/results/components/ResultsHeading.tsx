"use client";

import {
  selectChecks,
  selectFlaggedChecks,
  selectHeadline,
  selectTotals,
} from "@/features/budget/selectors";
import { StepHeading } from "@/features/wizard/components/StepHeading";
import { useTranslator } from "@/i18n/I18nProvider";
import { formatMoney, formatPercent } from "@/lib/format";
import { useAppSelector } from "@/store/hooks";

/**
 * The results' eyebrow, headline and lede (Spec §4.6.1–2), always monthly.
 * Not code-split with the charts: step changes focus this `h2` right away.
 */
export function ResultsHeading() {
  const { t, plural, locale } = useTranslator();
  const headline = useAppSelector(selectHeadline);
  const totals = useAppSelector(selectTotals);
  const checks = useAppSelector(selectChecks);
  const flagged = useAppSelector(selectFlaggedChecks);
  const money = (amount: number) => formatMoney(amount, locale);

  const title =
    headline.kind === "noIncome"
      ? t("results.headline.noIncome")
      : t(`results.headline.${headline.kind}`, { amount: money(headline.amount) });

  let lede = t("results.needIncome");
  if (totals.income > 0) {
    const plan = t("results.lede", {
      income: money(totals.income),
      spending: money(totals.spending),
      savings: money(totals.savings),
      share: formatPercent(totals.savings / totals.income, locale),
    });
    const range = flagged.length
      ? plural("results.outside", flagged.length)
      : checks.length
        ? t("results.allWithin")
        : "";
    lede = range ? `${plan} ${range}` : plan;
  }

  return <StepHeading eyebrow={t("results.eyebrow")} title={title} lede={lede} />;
}
