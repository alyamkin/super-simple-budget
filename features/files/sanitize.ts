import {
  emptyBudget,
  type Budget,
  type CustomId,
  type Estimate,
  type Row,
  type RowId,
} from "@/domain/budget";
import {
  BUCKET_IDS,
  BUCKET_OF_ITEM,
  isEstimable,
  type BucketId,
} from "@/domain/catalog/buckets";
import { isItemId, ITEMS_BY_ID, type ItemId } from "@/domain/catalog/items";
import { RETIRED_ITEMS } from "@/domain/catalog/retired";
import { TIMES_PER_YEAR, type Frequency } from "@/domain/frequency";
import { MAX_LABEL_LENGTH } from "@/features/budget/budgetSlice";
import type { View } from "@/features/wizard/uiSlice";
import { customId } from "@/lib/customId";
import { MAX_AMOUNT } from "@/lib/parseAmount";
import { isRecord } from "./schema";

/** Rows kept per bucket; the rest of a bucket is dropped. */
export const MAX_ROWS_PER_BUCKET = 200;

/** Custom ids from any version: the artifact wrote `"c"` + base 36, v2 `"c_"`. */
const FILE_CUSTOM_ID = /^c_?([a-z0-9]{1,16})$/;

const DEFAULT_FREQUENCY: Frequency = "Monthly";

/** Frequencies renamed since they were written to files. */
const LEGACY_FREQUENCIES: Readonly<Record<string, Frequency>> = {
  SemiMonthly: "TwiceMonthly",
};

export type SanitizeOptions = {
  /** Retired catalog ids; a parameter so tests can retire some. */
  retired?: Readonly<Record<string, ItemId | null>>;
};

/** `0 ≤ amount <` {@link MAX_AMOUNT}, 2 decimals; numeric strings accepted. */
export function sanitizeAmount(value: unknown): number | null {
  const amount =
    typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof amount !== "number" || !Number.isFinite(amount)) return null;
  const rounded = Math.round(amount * 100) / 100;
  return rounded >= 0 && rounded < MAX_AMOUNT ? rounded : null;
}

export function sanitizeFrequency(
  value: unknown,
  fallback: Frequency = DEFAULT_FREQUENCY,
): Frequency {
  if (typeof value !== "string") return fallback;
  if (Object.hasOwn(TIMES_PER_YEAR, value)) return value as Frequency;
  return Object.hasOwn(LEGACY_FREQUENCIES, value)
    ? LEGACY_FREQUENCIES[value]
    : fallback;
}

export function sanitizeLabel(value: unknown): string {
  return typeof value === "string"
    ? value.trim().slice(0, MAX_LABEL_LENGTH)
    : "";
}

export const sanitizeView = (value: unknown): View =>
  value === "year" ? "year" : "month";

const isBucketId = (value: string): value is BucketId =>
  (BUCKET_IDS as readonly string[]).includes(value);

/** Keeps a valid id from a file in v2 form; anything else gets a new one. */
function sanitizeCustomId(value: unknown): CustomId {
  const match = typeof value === "string" ? FILE_CUSTOM_ID.exec(value) : null;
  return match ? `c_${match[1]}` : customId();
}

/**
 * Where a file row ends up: catalog rows go to their item's bucket, custom
 * rows stay in the file's bucket (dropped when that bucket is unknown).
 */
function sanitizeRow(
  raw: Record<string, unknown>,
  fileBucket: BucketId | null,
  retired: Readonly<Record<string, ItemId | null>>,
): { bucket: BucketId; row: Row } | null {
  const amount = sanitizeAmount(raw.amount);
  const isCustom = raw.custom === true;
  let id = raw.id;
  if (!isCustom && typeof id === "string" && Object.hasOwn(retired, id)) {
    id = retired[id];
  }

  if (!isCustom && isItemId(id)) {
    const frequency = sanitizeFrequency(
      raw.frequency,
      ITEMS_BY_ID[id].defaultFrequency,
    );
    return {
      bucket: BUCKET_OF_ITEM[id],
      row: { kind: "catalog", id, amount, frequency },
    };
  }

  if (!fileBucket) return null;
  // Unknown or retired-without-replacement ids keep their label as custom rows.
  return {
    bucket: fileBucket,
    row: {
      kind: "custom",
      id: isCustom ? sanitizeCustomId(raw.id) : customId(),
      label: sanitizeLabel(raw.label),
      amount,
      frequency: sanitizeFrequency(raw.frequency),
    },
  };
}

function sanitizeEstimate(raw: unknown): Estimate | null {
  if (!isRecord(raw)) return null;
  return {
    enabled: raw.enabled === true,
    amount: sanitizeAmount(raw.amount),
    frequency: sanitizeFrequency(raw.frequency),
  };
}

/**
 * Repairs the `buckets` of a v2 file into a valid budget.
 * Never throws: whatever cannot be repaired is dropped.
 */
export function sanitizeBuckets(
  buckets: unknown,
  { retired = RETIRED_ITEMS }: SanitizeOptions = {},
): Budget {
  const budget = emptyBudget();
  if (!isRecord(buckets)) return budget;

  const seen = new Set<RowId>();
  // Known buckets first, in step order, so their rows win over moved ones.
  const keys = Object.keys(buckets).sort((a, b) => order(a) - order(b));

  for (const key of keys) {
    const fileBucket = isBucketId(key) ? key : null;
    const raw = buckets[key];
    if (!isRecord(raw)) continue;

    if (Array.isArray(raw.rows)) {
      for (const rawRow of raw.rows) {
        if (!isRecord(rawRow)) continue;
        const placed = sanitizeRow(rawRow, fileBucket, retired);
        if (!placed || seen.has(placed.row.id)) continue;
        const rows = budget.rows[placed.bucket];
        if (rows.length >= MAX_ROWS_PER_BUCKET) continue;
        seen.add(placed.row.id);
        rows.push(placed.row);
      }
    }

    const estimate = sanitizeEstimate(raw.estimate);
    if (fileBucket && isEstimable(fileBucket) && estimate) {
      budget.estimates[fileBucket] = estimate;
    }
  }
  return budget;
}

/** Step order; unknown buckets after the known ones. */
function order(key: string): number {
  const index = (BUCKET_IDS as readonly string[]).indexOf(key);
  return index === -1 ? BUCKET_IDS.length : index;
}
