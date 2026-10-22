"use client";

import { Button } from "@/components/ui/Button";
import { STEPS } from "@/domain/catalog/buckets";
import { useTranslator } from "@/i18n/I18nProvider";
import { useAppSelector } from "@/store/hooks";
import { stepName } from "../stepName";
import { uiSlice } from "../uiSlice";
import { useGoToStep } from "../useGoToStep";

const { selectStep } = uiSlice.selectors;

const RESULTS = STEPS.length - 1;
const LAST_BUCKET = RESULTS - 1;

/**
 * "← Back" / "Next: {bucket} →" under a bucket step (Spec §4.3.6); on the
 * results, "← Edit" goes back to the last bucket (Spec §4.6.9).
 */
export function StepNav() {
  const { t } = useTranslator();
  const step = useAppSelector(selectStep);
  const goToStep = useGoToStep();

  const button = "max-phone:flex-auto";

  if (step === RESULTS) {
    return (
      <div className="mt-[26px] flex flex-wrap justify-between gap-2.5">
        <Button className={button} onClick={() => goToStep(LAST_BUCKET)}>
          {t("wizard.edit")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-[26px] flex flex-wrap justify-between gap-2.5">
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
        {step === LAST_BUCKET
          ? t("wizard.seePlan")
          : t("wizard.next", { name: stepName(t, STEPS[step + 1]) })}
      </Button>
    </div>
  );
}
