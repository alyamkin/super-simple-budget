import type { Row } from "@/domain/budget";
import type { Translator } from "@/i18n/translate";

/** The name shown for a row: its catalog label, or the user's (or "Your item"). */
export function rowLabel(t: Translator["t"], row: Row): string {
  return row.kind === "catalog"
    ? t(`items.${row.id}.label`)
    : row.label.trim() || t("budget.yourItem");
}
