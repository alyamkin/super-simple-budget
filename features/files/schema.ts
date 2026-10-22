import type { Estimate } from "@/domain/budget";
import type { BucketId } from "@/domain/catalog/buckets";
import type { Frequency } from "@/domain/frequency";
import type { View } from "@/features/wizard/uiSlice";
import type { Locale } from "@/i18n/config";

/** Every budget file says it comes from this app. */
export const APP_ID = "super-simple-budget";

/** The format version this app writes. */
export const CURRENT_VERSION = 2;

/** The oldest reader that understands what this app writes. */
export const MIN_READER_VERSION = 2;

/** Files larger than this are refused before parsing. */
export const MAX_FILE_BYTES = 1024 * 1024;

/**
 * A row as written to a file. `label` is the text shown at export time; readers
 * use it only when the id is no longer in the catalog.
 */
export type FileRow = {
  id: string;
  custom?: true;
  label: string;
  amount: number | null;
  frequency: Frequency;
};

export type FileBucket = { rows: FileRow[]; estimate?: Estimate };

/** JSON backup format v2. */
export type BudgetFile = {
  app: typeof APP_ID;
  version: typeof CURRENT_VERSION;
  minReaderVersion: number;
  /** ISO 8601. */
  savedAt: string;
  /** Informational: the language the labels were written in. */
  locale: Locale;
  view: View;
  buckets: Partial<Record<BucketId, FileBucket>>;
};

/** Narrows a parsed JSON value to an object whose fields can be read. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
