"use client";

import { useId } from "react";
import { Button } from "@/components/ui/Button";
import type { NextStep } from "@/domain/results";
import { selectNextSteps } from "@/features/budget/selectors";
import { useGoToStep } from "@/features/wizard/useGoToStep";
import { useTranslator } from "@/i18n/I18nProvider";
import { formatList, formatMoney } from "@/lib/format";
import { useAppSelector } from "@/store/hooks";

/**
 * "Next steps": up to four tips in priority order (Spec §4.6.7, §8.4).
 * Hidden when no tip applies. Tips are `h4`s under the section's `h3`, like
 * the artifact's `.tip h4`, so the heading outline stays in order.
 */
export function NextSteps() {
  const { t } = useTranslator();
  const steps = useAppSelector(selectNextSteps);
  const titleId = useId();

  if (!steps.length) return null;

  return (
    <section aria-labelledby={titleId} className="mb-3 min-w-0">
      <h3 id={titleId} className="mb-2.5 text-[1.15rem] font-bold max-tablet:text-[1.05rem]">
        {t("results.next.title")}
      </h3>
      <ul className="grid gap-2.5">
        {steps.map((step) => (
          <Tip key={step.kind} step={step} />
        ))}
      </ul>
    </section>
  );
}

function Tip({ step }: { step: NextStep }) {
  const { t, locale } = useTranslator();
  const goToStep = useGoToStep();
  const money = (amount: number) => formatMoney(amount, locale);
  // A name inside a sentence: lower-cased in English ("start with personal
  // insurance"), quoted by the French template (« Logement »).
  const inSentence = (name: string) =>
    t("results.next.name", {
      name:
        locale === "en"
          ? name.charAt(0).toLocaleLowerCase("en-CA") + name.slice(1)
          : name,
    });

  let title: string;
  let body: string;
  switch (step.kind) {
    case "addIncome":
      title = t("results.next.addIncome.title");
      body = t("results.next.addIncome.body");
      break;
    case "closeGap":
      title = t("results.next.closeGap.title", { amount: money(step.gap) });
      body = step.startWith
        ? t("results.next.closeGap.startWith", {
            category: inSentence(t(`categories.${step.startWith}`)),
          })
        : t("results.next.closeGap.startLargest");
      break;
    case "surplus":
      title = t("results.next.surplus.title", { amount: money(step.surplus) });
      body = t("results.next.surplus.body");
      break;
    case "emergencyFund":
      title = t("results.next.emergencyFund.title");
      body = t("results.next.emergencyFund.body");
      break;
    case "itemize":
      title = t("results.next.itemize.title");
      body = t("results.next.itemize.body", {
        buckets: formatList(
          step.buckets.map((bucket) => inSentence(t(`buckets.${bucket}.title`))),
          locale,
        ),
      });
      break;
  }

  return (
    <li className="rounded-r-card border-l-4 border-accent bg-surface px-4 py-[13px]">
      <h4 className="mb-1 text-[.98rem] font-bold">{title}</h4>
      <p className="text-[.9rem] text-muted">{body}</p>
      {step.kind === "addIncome" && (
        <Button className="mt-2.5" onClick={() => goToStep(0)}>
          {t("results.next.addIncome.action")}
        </Button>
      )}
    </li>
  );
}
