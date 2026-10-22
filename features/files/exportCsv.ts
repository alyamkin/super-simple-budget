import { isEstimated, type Budget, type Estimate, type Row } from "@/domain/budget";
import { BUCKET_IDS } from "@/domain/catalog/buckets";
import { computeTotals, monthly } from "@/domain/totals";
import { rowLabel } from "@/features/budget/rowLabel";
import type { Locale } from "@/i18n/config";
import type { Translator } from "@/i18n/translate";
import { toCsv } from "@/lib/csv";

/** What a spreadsheet in each language expects. */
const CSV_FORMAT: Record<Locale, { delimiter: string; decimal: string }> = {
  en: { delimiter: ",", decimal: "." },
  fr: { delimiter: ";", decimal: "," },
};

/**
 * Column order is a contract: never reorder, only append. The
 * header text may be re-translated.
 */
const COLUMNS = [
  "section",
  "item",
  "amount",
  "frequency",
  "monthly",
  "yearly",
] as const;

/**
 * The budget as a spreadsheet, for viewing only: each row with an amount (or
 * each rough total) in step order, then the totals and the balance.
 */
export function budgetCsv(
  { t, locale }: Pick<Translator, "t" | "locale">,
  budget: Budget,
): string {
  const { delimiter, decimal } = CSV_FORMAT[locale];
  // Two decimals, no grouping or currency, so spreadsheets read a number.
  const number = (value: number) => value.toFixed(2).replace(".", decimal);
  const line = (
    section: string,
    item: string,
    entry: Row | Estimate,
  ): string[] => [
    section,
    item,
    number(entry.amount ?? 0),
    t(`frequency.${entry.frequency}`),
    number(monthly(entry)),
    number(monthly(entry) * 12),
  ];
  const total = (label: string, value: number) => [
    "",
    label,
    "",
    "",
    number(value),
    number(value * 12),
  ];

  const rows: string[][] = [COLUMNS.map((column) => t(`files.csv.${column}`))];
  for (const bucket of BUCKET_IDS) {
    const section = t(`buckets.${bucket}.title`);
    if (isEstimated(budget, bucket)) {
      const name = t("results.top.roughTotal", { name: section });
      rows.push(line(section, name, budget.estimates[bucket]!));
      continue;
    }
    for (const row of budget.rows[bucket]) {
      if (row.amount) rows.push(line(section, rowLabel(t, row), row));
    }
  }

  const totals = computeTotals(budget);
  rows.push(
    [],
    total(t("files.csv.totalIncome"), totals.income),
    total(t("files.csv.totalPlanned"), totals.outgoing),
    total(
      t(totals.balance >= 0 ? "tally.leftOver" : "tally.shortfall"),
      Math.abs(totals.balance),
    ),
  );
  return toCsv(rows, delimiter);
}
