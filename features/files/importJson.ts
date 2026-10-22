import type { Budget } from "@/domain/budget";
import type { View } from "@/features/wizard/uiSlice";
import { v1ToV2 } from "./migrations/v1ToV2";
import { sanitizeBuckets, sanitizeView, type SanitizeOptions } from "./sanitize";
import { APP_ID, CURRENT_VERSION, isRecord, MAX_FILE_BYTES } from "./schema";

/** Why a file could not be read; mapped to a message by the UI. */
export type ReadError = "notBudgetFile" | "newerVersion" | "tooLarge";

export type ReadResult =
  | { ok: true; budget: Budget; view: View }
  | { ok: false; error: ReadError };

type Migration = (file: Record<string, unknown>) => Record<string, unknown>;

/** `MIGRATIONS[n]` turns version n into n + 1. Append only. */
const MIGRATIONS: Readonly<Record<number, Migration>> = { 1: v1ToV2 };

/**
 * Reads parsed JSON from a file or local storage (Spec §11.3): detect, migrate
 * to the current version, sanitize. Only the app id and version can fail it.
 */
export function readBudgetData(
  data: unknown,
  options?: SanitizeOptions,
): ReadResult {
  if (!isRecord(data) || data.app !== APP_ID) {
    return { ok: false, error: "notBudgetFile" };
  }
  const { version, minReaderVersion } = data;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    return { ok: false, error: "notBudgetFile" };
  }
  if (
    version > CURRENT_VERSION &&
    (typeof minReaderVersion !== "number" || minReaderVersion > CURRENT_VERSION)
  ) {
    return { ok: false, error: "newerVersion" };
  }

  let file = data;
  for (let v = version; v < CURRENT_VERSION; v++) file = MIGRATIONS[v](file);

  return {
    ok: true,
    budget: sanitizeBuckets(file.buckets, options),
    view: sanitizeView(file.view),
  };
}

/**
 * Reads a file the user chose; never throws. Large files are refused before
 * they are read.
 */
export async function readBudgetFile(
  file: Blob,
  options?: SanitizeOptions,
): Promise<ReadResult> {
  if (file.size > MAX_FILE_BYTES) return { ok: false, error: "tooLarge" };
  let text: string;
  try {
    text = await file.text();
  } catch {
    return { ok: false, error: "notBudgetFile" };
  }
  return parseBudgetFile(text, options);
}

/** Parses the text of a budget file; never throws. */
export function parseBudgetFile(
  text: string,
  options?: SanitizeOptions,
): ReadResult {
  if (text.length > MAX_FILE_BYTES) return { ok: false, error: "tooLarge" };
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "notBudgetFile" };
  }
  return readBudgetData(data, options);
}
