"use client";

import { STEPS } from "@/domain/catalog/buckets";
import { Progress } from "@/features/wizard/components/Progress";
import { StepHeading } from "@/features/wizard/components/StepHeading";
import { StepNav } from "@/features/wizard/components/StepNav";
import { uiSlice } from "@/features/wizard/uiSlice";
import { useTranslator } from "@/i18n/I18nProvider";
import { useAppSelector } from "@/store/hooks";
import { MAIN_ID } from "./SkipLink";

const { selectStepId, selectHydrated } = uiSlice.selectors;

/** The interactive island: progress, the current step and the tally. */
export function BudgetApp() {
  const { t } = useTranslator();
  const step = useAppSelector(selectStepId);
  const hydrated = useAppSelector(selectHydrated);

  return (
    <div aria-busy={!hydrated}>
      <Progress />
      <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-8 max-tablet:grid-cols-[minmax(0,1fr)]">
        <main id={MAIN_ID} className="min-w-0">
          {step === "results" ? (
            <StepHeading eyebrow={t("results.eyebrow")} title={t("wizard.results")} />
          ) : (
            <StepHeading
              eyebrow={t("wizard.stepOf", {
                n: STEPS.indexOf(step) + 1,
                total: STEPS.length,
                name: t(`buckets.${step}.title`),
              })}
              title={t(`buckets.${step}.question`)}
              lede={t(`buckets.${step}.lede`)}
            />
          )}
          <StepNav />
        </main>
        {/* Placeholder until the tally lands (PLAN step 14). */}
        <aside
          aria-label={t("tally.label")}
          className="sticky top-5 rounded-card border border-line bg-surface p-[18px] max-tablet:hidden"
        >
          <h3 className="text-base font-bold">{t("tally.title")}</h3>
        </aside>
      </div>
    </div>
  );
}
