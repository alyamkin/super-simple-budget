import type { ComponentPropsWithRef } from "react";
import { classNames } from "@/lib/classNames";

export type ButtonVariant = "default" | "primary" | "ghost" | "link";

const VARIANTS: Record<ButtonVariant, string> = {
  default: "btn border-line bg-surface hover:border-accent",
  primary: "btn border-accent bg-accent text-surface",
  ghost: "btn border-transparent bg-transparent px-2 text-accent hover:border-accent",
  link: "border-0 bg-transparent px-0 py-1 text-[.85rem] font-bold text-accent underline underline-offset-[3px]",
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
      className={classNames(VARIANTS[variant], className)}
      {...props}
    />
  );
}
