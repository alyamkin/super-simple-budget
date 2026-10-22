"use client";

import { STEPS } from "@/domain/catalog/buckets";
import { useTranslator } from "@/i18n/I18nProvider";
import { useAppSelector } from "@/store/hooks";
import { stepName } from "../stepName";
import { uiSlice } from "../uiSlice";
import { useGoToStep } from "../useGoToStep";

const { selectStep } = uiSlice.selectors;

/**
 * One button per step. Below the tablet breakpoint the labels are
 * hidden visually (`text-[0]`) but still name the buttons, and each bar keeps
 * a tall tap target.
 */
export function Progress() {
  const { t } = useTranslator();
  const current = useAppSelector(selectStep);
  const goToStep = useGoToStep();

  return (
    <nav aria-label={t("wizard.progress")}>
      <ol className="mt-1.5 mb-[26px] flex gap-1.5 max-tablet:mt-0 max-tablet:mb-[18px] max-tablet:gap-1">
        {STEPS.map((step, index) => (
          <li key={step} className="min-w-0 flex-1 basis-0">
            <button
              type="button"
              aria-current={index === current ? "step" : undefined}
              onClick={() => goToStep(index)}
              className="group block w-full truncate border-0 bg-transparent p-0 text-left text-[.74rem] text-muted aria-[current=step]:font-bold aria-[current=step]:text-ink tablet:pointer-coarse:-my-3 tablet:pointer-coarse:py-3 max-tablet:-my-3 max-tablet:py-4 max-tablet:text-[0]"
            >
              <span
                aria-hidden="true"
                className={
                  index < current
                    ? "mb-1.5 block h-1.5 rounded-[3px] bg-accent opacity-55"
                    : "mb-1.5 block h-1.5 rounded-[3px] bg-line group-aria-[current=step]:bg-accent"
                }
              />
              {stepName(t, step)}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
