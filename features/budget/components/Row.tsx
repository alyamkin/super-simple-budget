"use client";

import { useState } from "react";
import { FrequencySelect } from "@/components/ui/FrequencySelect";
import { IconButton } from "@/components/ui/IconButton";
import { CloseIcon, TipIcon } from "@/components/ui/Icons";
import { MoneyInput } from "@/components/ui/MoneyInput";
import type { RowId } from "@/domain/budget";
import type { BucketId } from "@/domain/catalog/buckets";
import { ITEMS_BY_ID } from "@/domain/catalog/items";
import { useTranslator } from "@/i18n/I18nProvider";
import { classNames } from "@/lib/classNames";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  amountChanged,
  customLabelChanged,
  frequencyChanged,
  MAX_LABEL_LENGTH,
} from "../budgetSlice";
import { focusTargets } from "../focusTargets";
import { rowLabel } from "../rowLabel";
import { selectRow } from "../selectors";

type RowProps = {
  bucket: BucketId;
  id: RowId;
  onRemove: (id: RowId) => void;
};

/**
 * One picked item: label · amount · frequency · tip · remove.
 * Below the phone breakpoint the label shares the top line with the two icon
 * buttons, and the amount and frequency take the second line.
 */
export function Row({ bucket, id, onRemove }: RowProps) {
  const { t } = useTranslator();
  const dispatch = useAppDispatch();
  const row = useAppSelector((state) => selectRow(state, bucket, id));
  const [tipOpen, setTipOpen] = useState(false);

  if (!row) return null;

  const amountId = focusTargets.amount(id);
  const tipId = `tip-${id}`;
  const catalog = row.kind === "catalog";
  const name = rowLabel(t, row);
  const help = catalog ? t(`items.${row.id}.help`) : "";
  const tip = catalog ? t(`items.${row.id}.tip`) : "";
  const fundType = catalog ? ITEMS_BY_ID[row.id].fundType : undefined;

  const topLine = "max-phone:row-start-1 max-phone:self-start";

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_124px_148px_40px_40px] items-center gap-2 border-t border-dashed border-line py-2.5 max-phone:grid-cols-[minmax(0,.8fr)_minmax(0,1.25fr)_40px_40px] max-phone:gap-1.5">
      <div className="min-w-0 text-[.95rem] max-phone:col-span-2 max-phone:row-start-1">
        {row.kind === "catalog" ? (
          <>
            <label htmlFor={amountId}>{name}</label>
            {fundType && (
              <span className="ml-1.5 rounded bg-accent-soft px-1.5 py-px align-[.1em] text-[.7rem] font-bold text-accent">
                {t(`fundTypes.${fundType}`)}
              </span>
            )}
            {help && (
              <small className="mt-0.5 block text-[.78rem]/[1.35] text-muted">
                {help}
              </small>
            )}
          </>
        ) : (
          <input
            id={focusTargets.label(id)}
            type="text"
            autoComplete="off"
            maxLength={MAX_LABEL_LENGTH}
            placeholder={t("budget.nameItem")}
            aria-label={t("budget.itemName")}
            value={row.label}
            onChange={(event) =>
              dispatch(
                customLabelChanged({ bucket, id, label: event.target.value }),
              )
            }
            className="field px-2.5 [--field-text:.95rem]"
          />
        )}
      </div>
      <MoneyInput
        id={amountId}
        aria-label={t("budget.amount", { label: name })}
        value={row.amount}
        onValueChange={(amount) =>
          dispatch(amountChanged({ bucket, id, amount }))
        }
        className="max-phone:col-start-1 max-phone:row-start-2"
      />
      <FrequencySelect
        aria-label={t("budget.frequency", { label: name })}
        value={row.frequency}
        onValueChange={(frequency) =>
          dispatch(frequencyChanged({ bucket, id, frequency }))
        }
        className="max-phone:col-[2/-1] max-phone:row-start-2"
      />
      {tip ? (
        <IconButton
          label={t("budget.tip", { label: name })}
          aria-expanded={tipOpen}
          aria-controls={tipId}
          onClick={() => setTipOpen(!tipOpen)}
          className={classNames("max-phone:col-start-3", topLine)}
        >
          <TipIcon />
        </IconButton>
      ) : (
        <span className={classNames("max-phone:col-start-3", topLine)} />
      )}
      <IconButton
        id={focusTargets.remove(id)}
        label={t("budget.remove", { label: name })}
        onClick={() => onRemove(id)}
        className={classNames("max-phone:col-start-4", topLine)}
      >
        <CloseIcon />
      </IconButton>
      {tip && (
        <p
          id={tipId}
          hidden={!tipOpen}
          className="col-span-full flex items-start gap-2 rounded-lg bg-accent-soft px-2.5 py-2 text-[.84rem]"
        >
          <TipIcon className="mt-0.5 shrink-0" />
          <span>{tip}</span>
        </p>
      )}
    </div>
  );
}
