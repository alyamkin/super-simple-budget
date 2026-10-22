"use client";

import { useState, type ComponentPropsWithRef } from "react";
import { useTranslator } from "@/i18n/I18nProvider";
import { classNames } from "@/lib/classNames";
import { amountToInput, parseAmount } from "@/lib/parseAmount";
import { fieldClassName } from "./fieldClassName";

type MoneyInputProps = Omit<
  ComponentPropsWithRef<"input">,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  value: number | null;
  /** Called with the parsed amount whenever it changes while typing. */
  onValueChange: (amount: number | null) => void;
};

/**
 * An amount field with a `$` prefix (suffix in French). While focused it keeps
 * what the user typed (e.g. `"12,"`) and reports the parsed amount; on blur it
 * shows the stored amount again.
 */
export function MoneyInput({
  value,
  onValueChange,
  onFocus,
  onBlur,
  className,
  ...props
}: MoneyInputProps) {
  const { locale } = useTranslator();
  const [draft, setDraft] = useState<string | null>(null);
  const suffix = locale === "fr";

  return (
    <div className={classNames("relative", className)}>
      <span
        aria-hidden="true"
        className={classNames(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 font-mono text-muted",
          suffix ? "right-2.5" : "left-2.5",
        )}
      >
        $
      </span>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint="next"
        placeholder="0"
        {...props}
        value={draft ?? amountToInput(value, locale)}
        onFocus={(event) => {
          setDraft(amountToInput(value, locale));
          onFocus?.(event);
        }}
        onChange={(event) => {
          setDraft(event.target.value);
          const amount = parseAmount(event.target.value, locale);
          if (amount !== value) onValueChange(amount);
        }}
        onBlur={(event) => {
          setDraft(null);
          onBlur?.(event);
        }}
        className={classNames(
          fieldClassName,
          "text-right font-mono text-[.95rem] tabular-nums",
          suffix ? "pr-6 pl-2" : "pr-2 pl-[22px]",
        )}
      />
    </div>
  );
}
