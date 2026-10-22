"use client";

import { STEPS } from "@/domain/catalog/buckets";
import { BucketStep } from "@/features/budget/components/BucketStep";
import { Toaster } from "@/features/notices/components/Toaster";
import { LazyResultsView } from "@/features/results/components/LazyResultsView";
import { ResultsHeading } from "@/features/results/components/ResultsHeading";
import { BalanceAnnouncer } from "@/features/tally/components/BalanceAnnouncer";
import { MobileBar } from "@/features/tally/components/MobileBar";
import { Tally } from "@/features/tally/components/Tally";
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
            <>
              <ResultsHeading />
              <LazyResultsView />
            </>
          ) : (
            <>
              <StepHeading
                eyebrow={t("wizard.stepOf", {
                  n: STEPS.indexOf(step) + 1,
                  total: STEPS.length,
                  name: t(`buckets.${step}.title`),
                })}
                title={t(`buckets.${step}.question`)}
                lede={t(`buckets.${step}.lede`)}
              />
              <BucketStep key={step} bucket={step} />
            </>
          )}
          <StepNav />
        </main>
        <Tally />
      </div>
      <MobileBar />
      <BalanceAnnouncer />
      <Toaster />
    </div>
  );
}
