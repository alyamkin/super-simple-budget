"use client";

import { useEffect, useRef, useState } from "react";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { balanceLevel } from "@/domain/totals";
import { selectBalance } from "@/features/budget/selectors";
import { uiSlice } from "@/features/wizard/uiSlice";
import { useTranslator } from "@/i18n/I18nProvider";
import { formatMoney } from "@/lib/format";
import { useAppSelector } from "@/store/hooks";

const { selectHydrated } = uiSlice.selectors;

export const ANNOUNCE_DELAY_MS = 1000;

/**
 * Reads the monthly balance to screen readers once edits pause for a second,
 * not on every keystroke. The balance loaded from storage is the
 * starting point and is not announced.
 */
export function BalanceAnnouncer() {
  const { t, locale } = useTranslator();
  const balance = useAppSelector(selectBalance);
  const hydrated = useAppSelector(selectHydrated);
  const [announced, setAnnounced] = useState<number | null>(null);
  // The last balance the user has heard (or the loaded one).
  const heard = useRef<number | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (heard.current === null) {
      heard.current = balance;
      return;
    }
    if (balance === heard.current) return;
    const timer = setTimeout(() => {
      heard.current = balance;
      setAnnounced(balance);
    }, ANNOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [balance, hydrated]);

  const message =
    announced === null
      ? ""
      : t(
          balanceLevel(announced) === "shortfall"
            ? "tally.announce.shortfall"
            : "tally.announce.leftOver",
          { amount: formatMoney(Math.abs(announced), locale) },
        );

  return (
    <VisuallyHidden aria-live="polite" aria-atomic="true">
      {message}
    </VisuallyHidden>
  );
}
