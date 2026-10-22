"use client";

import { useId } from "react";
import { Switch } from "@/components/ui/Switch";
import type { EstimableBucketId } from "@/domain/catalog/buckets";
import { useTranslator } from "@/i18n/I18nProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { estimateToggled } from "../budgetSlice";
import { selectIsEstimated } from "../selectors";

/**
 * "Give a rough total instead" (Spec §4.3.2). Turning it on swaps the rows
 * for one rough total; the rows are kept and come back when it is turned off.
 */
export function EstimateToggle({ bucket }: { bucket: EstimableBucketId }) {
  const { t } = useTranslator();
  const dispatch = useAppDispatch();
  const estimated = useAppSelector((state) => selectIsEstimated(state, bucket));
  const hintId = useId();

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-card bg-accent-soft px-4 py-3">
      <Switch
        checked={estimated}
        aria-describedby={hintId}
        onChange={(event) =>
          dispatch(estimateToggled({ bucket, enabled: event.target.checked }))
        }
      >
        {t("budget.estimateToggle")}
      </Switch>
      <small id={hintId} className="flex-[1_1_220px] text-[.82rem] text-muted">
        {t("budget.estimateHint")}
      </small>
    </div>
  );
}
