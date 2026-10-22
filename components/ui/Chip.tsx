import type { ComponentPropsWithRef } from "react";
import { classNames } from "@/lib/classNames";

export type ChipVariant = "add" | "more";

type ChipProps = ComponentPropsWithRef<"button"> & { variant?: ChipVariant };

/**
 * A pill button in the picker. `add` shows a decorative "+" before its text
 * (give it an accessible name like "Add Rent"); `more` is the dashed chip for
 * "Show more" and "+ Something else".
 */
export function Chip({
  variant = "add",
  type = "button",
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface py-2 text-[.92rem] hover:border-accent hover:text-accent pointer-coarse:min-h-[42px] pointer-coarse:px-3.5",
        variant === "add"
          ? "pr-3.5 pl-[11px]"
          : "border-dashed px-3.5 font-bold text-accent",
        className,
      )}
      {...props}
    >
      {variant === "add" && (
        <b aria-hidden="true" className="font-bold text-accent">
          +
        </b>
      )}
      {children}
    </button>
  );
}
