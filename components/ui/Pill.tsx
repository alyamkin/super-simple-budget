import type { ComponentPropsWithRef } from "react";
import { classNames } from "@/lib/classNames";

export type PillTone = "good" | "warn";

const TONES: Record<PillTone, string> = {
  good: "bg-good-soft text-good",
  warn: "bg-warn-soft text-warn",
};

type PillProps = ComponentPropsWithRef<"span"> & { tone: PillTone };

/** A small rounded label, e.g. "Saved" next to the budget's file state. */
export function Pill({ tone, className, ...props }: PillProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-[3px] text-[.78rem] font-bold whitespace-nowrap",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
