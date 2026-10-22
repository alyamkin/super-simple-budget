import type { ComponentPropsWithRef, ReactNode } from "react";
import { classNames } from "@/lib/classNames";

type SwitchProps = Omit<ComponentPropsWithRef<"input">, "type" | "role"> & {
  /** Visible label; also the switch's accessible name. */
  children: ReactNode;
};

/** A native checkbox with `role="switch"`: its checked state is the on/off state. */
export function Switch({ children, className, ...props }: SwitchProps) {
  return (
    <label
      className={classNames(
        "inline-flex cursor-pointer items-center gap-2.5 text-[.92rem] font-bold",
        className,
      )}
    >
      <input
        type="checkbox"
        role="switch"
        className="relative m-0 h-[22px] w-10 flex-none cursor-pointer appearance-none rounded-full bg-line transition-colors after:absolute after:top-[3px] after:left-[3px] after:size-4 after:rounded-full after:bg-surface after:transition-[left] after:duration-150 after:content-[''] checked:bg-accent checked:after:left-[21px] pointer-coarse:h-[26px] pointer-coarse:w-[46px] pointer-coarse:after:size-5 pointer-coarse:checked:after:left-[23px]"
        {...props}
      />
      {children}
    </label>
  );
}
