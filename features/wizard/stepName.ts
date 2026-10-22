import type { StepId } from "@/domain/catalog/buckets";
import type { Translator } from "@/i18n/translate";

/** A step's short name: the bucket title, or "Results". */
export function stepName(t: Translator["t"], step: StepId): string {
  return step === "results" ? t("wizard.results") : t(`buckets.${step}.title`);
}
