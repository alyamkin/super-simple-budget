import type { ComponentPropsWithRef } from "react";
import { classNames } from "@/lib/classNames";

export type ButtonVariant = "default" | "primary" | "ghost" | "link";

const VARIANTS: Record<ButtonVariant, string> = {
  default:
    "rounded-[9px] border border-line bg-surface px-[18px] py-2.5 hover:border-accent max-tablet:min-h-11",
  primary:
    "rounded-[9px] border border-accent bg-accent px-[18px] py-2.5 text-surface max-tablet:min-h-11",
  ghost:
    "rounded-[9px] border border-transparent bg-transparent px-2 py-2.5 text-accent hover:border-accent max-tablet:min-h-11",
  link: "border-0 bg-transparent px-0 py-1 text-[.85rem] text-accent underline underline-offset-[3px]",
};

type ButtonProps = ComponentPropsWithRef<"button"> & { variant?: ButtonVariant };

/** The artifact's `.btn` (and `.linkbtn` for `variant="link"`). */
export function Button({
  variant = "default",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classNames("font-bold", VARIANTS[variant], className)}
      {...props}
    />
  );
}
