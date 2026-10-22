import {
  OUTGOING_BUCKETS,
  type EstimableBucketId,
} from "@/domain/catalog/buckets";
import type { Totals } from "@/domain/totals";
import type { Translator } from "@/i18n/translate";
import { formatMoney } from "@/lib/format";

/**
 * The "Copy summary" text: a heading, income, one line per
 * outgoing bucket (rough totals marked) and the balance, all monthly with
 * cents, one per line.
 */
export function summaryText(
  { t, locale }: Pick<Translator, "t" | "locale">,
  totals: Totals,
  rough: readonly EstimableBucketId[],
): string {
  const line = (name: string, amount: number, isRough = false) =>
    t(isRough ? "results.summary.roughLine" : "results.summary.line", {
      name,
      amount: formatMoney(amount, locale, { decimals: 2 }),
    });
  const isRough = (bucket: string) =>
    rough.some((estimated) => estimated === bucket);

  return [
    t("results.summary.title"),
    line(t("tally.income"), totals.income),
    ...OUTGOING_BUCKETS.map((bucket) =>
      line(t(`buckets.${bucket}.title`), totals.byBucket[bucket], isRough(bucket)),
    ),
    line(
      t(totals.balance >= 0 ? "tally.leftOver" : "tally.shortfall"),
      totals.balance,
    ),
  ].join("\n");
}
