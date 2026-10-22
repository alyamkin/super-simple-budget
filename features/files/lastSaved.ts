import type { Translator } from "@/i18n/translate";

/** A calendar day in local time, as a day count, so days can be subtracted. */
export function localDay(time: number): number {
  const date = new Date(time);
  return Math.round(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
}

/**
 * "Last saved to a file: today / yesterday / N days ago" or "Not saved to a
 * file yet". Calendar days, so last night's save is "yesterday".
 */
export function lastSavedText(
  t: Translator["t"],
  savedAt: number | null,
  today: number,
): string {
  if (savedAt === null) return t("files.notSaved");
  const days = today - localDay(savedAt);
  const when =
    days <= 0
      ? t("files.today")
      : days === 1
        ? t("files.yesterday")
        : t("files.daysAgo", { n: days });
  return t("files.lastSaved", { when });
}
