import { flushSync } from "react-dom";
import { STEPS } from "@/domain/catalog/buckets";
import { useTranslator } from "@/i18n/I18nProvider";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";
import { useAppDispatch } from "@/store/hooks";
import { clampStep, stepChanged } from "./uiSlice";
import { stepName } from "./stepName";

/** The step `h2`, focused after every step change. */
export const STEP_HEADING_ID = "step-heading";

/** Moves focus to the step heading, e.g. when the control that had it goes away. */
export function focusStepHeading(options?: FocusOptions) {
  document.getElementById(STEP_HEADING_ID)?.focus(options);
}

/**
 * Returns a handler that moves to a step the way a page change would: scroll
 * to the top, focus the new step's heading and update `document.title`. Only
 * user navigation goes through here, so hydrating a saved step never steals
 * focus or rewrites the server-rendered title.
 */
export function useGoToStep() {
  const dispatch = useAppDispatch();
  const { t } = useTranslator();

  return (step: number) => {
    const target = clampStep(step);
    // Render the new step now so its heading exists before we focus it.
    flushSync(() => dispatch(stepChanged(target)));
    document.title = t("wizard.documentTitle", {
      step: stepName(t, STEPS[target]),
      app: t("app.name"),
    });
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "instant" : "smooth",
    });
    focusStepHeading({ preventScroll: true });
  };
}
