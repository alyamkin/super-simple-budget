import type { ComponentPropsWithRef } from "react";
import { classNames } from "@/lib/classNames";

type IconButtonProps = Omit<ComponentPropsWithRef<"button">, "aria-label"> & {
  /** Accessible name; the icon itself is decorative. */
  label: string;
};

/** A square button holding one icon, e.g. a row's tip and remove buttons. */
export function IconButton({
  label,
  type = "button",
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={classNames(
        "grid size-8 place-items-center rounded-lg border border-transparent bg-transparent text-muted hover:border-line hover:text-accent aria-expanded:bg-accent-soft aria-expanded:text-accent pointer-coarse:size-10",
        className,
      )}
      {...props}
    />
  );
}
