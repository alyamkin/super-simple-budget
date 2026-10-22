"use client";

import type { ComponentPropsWithRef } from "react";
import { FREQUENCIES, type Frequency } from "@/domain/frequency";
import { useTranslator } from "@/i18n/I18nProvider";
import { classNames } from "@/lib/classNames";
import { fieldClassName } from "./fieldClassName";

type FrequencySelectProps = Omit<
  ComponentPropsWithRef<"select">,
  "value" | "defaultValue" | "onChange" | "children"
> & {
  value: Frequency;
  onValueChange: (frequency: Frequency) => void;
};

/** The 8 frequencies (Spec §7.1), most to least frequent, with localised names. */
export function FrequencySelect({
  value,
  onValueChange,
  className,
  ...props
}: FrequencySelectProps) {
  const { t } = useTranslator();
  return (
    <select
      {...props}
      value={value}
      onChange={(event) => onValueChange(event.target.value as Frequency)}
      className={classNames(fieldClassName, "px-2 text-[.88rem]", className)}
    >
      {FREQUENCIES.map((frequency) => (
        <option key={frequency} value={frequency}>
          {t(`frequency.${frequency}`)}
        </option>
      ))}
    </select>
  );
}
