import type { ComponentPropsWithRef, ReactNode } from "react";
import { classNames } from "@/lib/classNames";

export type StatusLevel = "green" | "yellow" | "red" | "none";

const LEVELS: Record<StatusLevel, string> = {
  green: "bg-good-soft text-good",
  yellow: "bg-warn-soft text-warn",
  red: "bg-bad-soft text-bad",
  none: "bg-bg text-muted",
};

type StatusBadgeProps = ComponentPropsWithRef<"span"> & {
  level: StatusLevel;
  /** Required: the colour is never the only signal (WCAG 1.4.1). */
  children: ReactNode;
};

/** A rule-of-thumb status ("On track", "A bit off", "Needs attention"). */
export function StatusBadge({ level, className, ...props }: StatusBadgeProps) {
  return (
    <span
      className={classNames(
        "inline-block rounded-full px-[9px] py-[3px] text-[.76rem] font-bold whitespace-nowrap",
        LEVELS[level],
        className,
      )}
      {...props}
    />
  );
}
