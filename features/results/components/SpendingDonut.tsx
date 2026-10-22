"use client";

import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { BUCKETS } from "@/domain/catalog/buckets";
import { selectSpendingSplit } from "@/features/budget/selectors";
import { uiSlice, VIEW_MULTIPLIER } from "@/features/wizard/uiSlice";
import { useTranslator } from "@/i18n/I18nProvider";
import { formatMoney, formatPercent } from "@/lib/format";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useAppSelector } from "@/store/hooks";
import { DonutChart } from "./charts/DonutChart";
import { ResultCard } from "./ResultCard";

const { selectView } = uiSlice.selectors;

/** "Where your money goes": the donut and its legend table (Spec §8.3, §10.1). */
export function SpendingDonut() {
  const { t, locale } = useTranslator();
  const { parts, total } = useAppSelector(selectSpendingSplit);
  const view = useAppSelector(selectView);
  const animate = !usePrefersReducedMotion();
  const money = (amount: number) =>
    formatMoney(amount * VIEW_MULTIPLIER[view], locale);
  const color = (bucket: (typeof parts)[number]["bucket"]) =>
    `var(${BUCKETS[bucket].color})`;

  return (
    <ResultCard title={t("results.donut.title")}>
      {parts.length ? (
        <div className="grid grid-cols-[210px_minmax(0,1fr)] items-center gap-[22px] max-tablet:grid-cols-[minmax(0,1fr)] max-tablet:justify-items-center">
          <DonutChart
            parts={parts.map(({ bucket, amount }) => ({
              key: bucket,
              amount,
              color: color(bucket),
            }))}
            caption={t("results.donut.planned", { per: t(`per.${view}`) })}
            total={money(total)}
            animate={animate}
          />
          <table className="w-full border-collapse text-[.9rem]">
            <thead>
              <tr>
                <th scope="col">
                  <VisuallyHidden>{t("results.donut.category")}</VisuallyHidden>
                </th>
                <th scope="col">
                  <VisuallyHidden>{t("results.donut.share")}</VisuallyHidden>
                </th>
                <th scope="col">
                  <VisuallyHidden>{t("results.donut.amount")}</VisuallyHidden>
                </th>
              </tr>
            </thead>
            <tbody>
              {parts.map(({ bucket, amount, share }) => (
                <tr key={bucket}>
                  <th scope="row" className="py-[3.5px] text-left font-normal">
                    <span className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="size-2.5 flex-none rounded-[3px]"
                        style={{ background: color(bucket) }}
                      />
                      {t(`buckets.${bucket}.title`)}
                    </span>
                  </th>
                  <td className="w-[3.4em] px-2.5 text-right font-mono text-[.8rem] text-muted tabular-nums">
                    {formatPercent(share, locale)}
                  </td>
                  <td className="text-right font-mono font-medium tabular-nums">
                    {money(amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center gap-[22px] max-phone:flex-col">
          <div aria-hidden="true" className="grid size-[210px] flex-none place-items-center">
            <div className="size-40 rounded-full border-[28px] border-line" />
          </div>
          <p className="text-muted">{t("results.donut.nothingPlanned")}</p>
        </div>
      )}
    </ResultCard>
  );
}
