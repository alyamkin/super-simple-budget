import type { ComponentPropsWithRef } from "react";
import { classNames } from "@/lib/classNames";

/** Text for screen readers only, e.g. "(opens in a new tab)". */
export function VisuallyHidden({
  className,
  ...props
}: ComponentPropsWithRef<"span">) {
  return <span className={classNames("sr-only", className)} {...props} />;
}
