"use client";

import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { useTranslator } from "@/i18n/I18nProvider";

/** Holds the charts' space while the results chunk loads. */
export function ResultsSkeleton() {
  const { t } = useTranslator();
  return (
    <div>
      <VisuallyHidden>{t("results.loading")}</VisuallyHidden>
      <div aria-hidden="true" className="grid gap-3">
        <div className="h-[170px] animate-pulse rounded-card border border-line bg-surface" />
        <div className="h-[300px] animate-pulse rounded-card border border-line bg-surface" />
      </div>
    </div>
  );
}
