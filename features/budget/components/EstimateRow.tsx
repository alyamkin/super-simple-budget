"use client";

import { FrequencySelect } from "@/components/ui/FrequencySelect";
import { MoneyInput } from "@/components/ui/MoneyInput";
import type { EstimableBucketId } from "@/domain/catalog/buckets";
import { useTranslator } from "@/i18n/I18nProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  estimateAmountChanged,
  estimateFrequencyChanged,
} from "../budgetSlice";
import { selectEstimate } from "../selectors";

/** The one rough-total row shown instead of the bucket's items. */
export function EstimateRow({ bucket }: { bucket: EstimableBucketId }) {
  const { t, locale } = useTranslator();
  const dispatch = useAppDispatch();
  const estimate = useAppSelector((state) => selectEstimate(state, bucket));

  if (!estimate) return null;

  const amountId = `estimate-${bucket}`;
  const name = t(`buckets.${bucket}.title`).toLocaleLowerCase(locale);

  return (
    <div className="mb-4 rounded-card border border-line bg-surface px-[18px] pt-1.5 pb-3.5 max-phone:px-3.5">
      <div className="grid grid-cols-[minmax(0,1fr)_150px_150px] items-center gap-2.5 py-3 max-phone:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <label htmlFor={amountId} className="font-bold max-phone:col-span-full">
          {t("budget.estimateQuestion", { name })}
        </label>
        <MoneyInput
          id={amountId}
          value={estimate.amount}
          onValueChange={(amount) =>
            dispatch(estimateAmountChanged({ bucket, amount }))
          }
        />
        <FrequencySelect
          aria-label={t("budget.estimateFrequency")}
          value={estimate.frequency}
          onValueChange={(frequency) =>
            dispatch(estimateFrequencyChanged({ bucket, frequency }))
          }
        />
      </div>
    </div>
  );
}
