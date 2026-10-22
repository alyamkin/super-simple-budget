import { useTranslator } from "@/i18n/I18nProvider";
import { formatMoney } from "@/lib/format";
import { useAppSelector } from "@/store/hooks";
import { uiSlice, VIEW_MULTIPLIER } from "./uiSlice";

const { selectView } = uiSlice.selectors;

/**
 * The month/year view, plus `money`, which formats a monthly amount in that
 * view (×12 when yearly).
 */
export function useViewMoney() {
  const { locale } = useTranslator();
  const view = useAppSelector(selectView);
  const money = (monthly: number) =>
    formatMoney(monthly * VIEW_MULTIPLIER[view], locale);
  return { view, money };
}
