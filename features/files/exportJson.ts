import type { Budget, Row } from "@/domain/budget";
import { BUCKET_IDS, isEstimable } from "@/domain/catalog/buckets";
import type { ItemId } from "@/domain/catalog/items";
import type { View } from "@/features/wizard/uiSlice";
import type { Locale } from "@/i18n/config";
import {
  APP_ID,
  CURRENT_VERSION,
  MIN_READER_VERSION,
  type BudgetFile,
  type FileBucket,
  type FileRow,
} from "./schema";

export type ExportOptions = {
  locale: Locale;
  view: View;
  /** The catalog item's label in `locale`. */
  itemLabel: (id: ItemId) => string;
  savedAt?: Date;
};

function toFileRow(row: Row, itemLabel: (id: ItemId) => string): FileRow {
  const { amount, frequency } = row;
  return row.kind === "custom"
    ? { id: row.id, custom: true, label: row.label, amount, frequency }
    : { id: row.id, label: itemLabel(row.id), amount, frequency };
}

/** The budget in the current file format. */
export function toBudgetFile(
  budget: Budget,
  { locale, view, itemLabel, savedAt = new Date() }: ExportOptions,
): BudgetFile {
  const buckets: BudgetFile["buckets"] = {};
  for (const bucket of BUCKET_IDS) {
    const entry: FileBucket = {
      rows: budget.rows[bucket].map((row) => toFileRow(row, itemLabel)),
    };
    const estimate = isEstimable(bucket) ? budget.estimates[bucket] : undefined;
    if (estimate) entry.estimate = { ...estimate };
    buckets[bucket] = entry;
  }
  return {
    app: APP_ID,
    version: CURRENT_VERSION,
    minReaderVersion: MIN_READER_VERSION,
    savedAt: savedAt.toISOString(),
    locale,
    view,
    buckets,
  };
}

/** The pretty-printed JSON written to a backup file. */
export function serializeBudget(budget: Budget, options: ExportOptions): string {
  return JSON.stringify(toBudgetFile(budget, options), null, 2);
}
