"use client";

import { Button } from "@/components/ui/Button";
import {
  LAST_BUCKET_STEP,
  RESULTS_STEP,
  STEPS,
} from "@/domain/catalog/buckets";
import { CopySummary } from "@/features/results/components/CopySummary";
import { useTranslator } from "@/i18n/I18nProvider";
import { useAppSelector } from "@/store/hooks";
import { stepName } from "../stepName";
import { uiSlice } from "../uiSlice";
import { useGoToStep } from "../useGoToStep";

const { selectStep } = uiSlice.selectors;

/**
 * "← Back" / "Next: {bucket} →" under a bucket step; on the
 * results, "← Edit" goes back to the last bucket and "Copy summary" copies
 * the plan.
 */
export function StepNav() {
  const { t } = useTranslator();
  const step = useAppSelector(selectStep);
  const goToStep = useGoToStep();

  const button = "max-phone:flex-auto";

  return (
    <div className="mt-[26px] flex flex-wrap justify-between gap-2.5">
      {step === RESULTS_STEP ? (
        <>
          <Button className={button} onClick={() => goToStep(LAST_BUCKET_STEP)}>
            {t("wizard.edit")}
          </Button>
          <CopySummary className={button} />
        </>
      ) : (
        <>
          {step > 0 ? (
            <Button className={button} onClick={() => goToStep(step - 1)}>
              {t("wizard.back")}
            </Button>
          ) : (
            <span />
          )}
          <Button
            variant="primary"
            className={button}
            onClick={() => goToStep(step + 1)}
          >
            {step === LAST_BUCKET_STEP
              ? t("wizard.seePlan")
              : t("wizard.next", { name: stepName(t, STEPS[step + 1]) })}
          </Button>
        </>
      )}
    </div>
  );
}
