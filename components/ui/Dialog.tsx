"use client";

import { useEffect, useRef, type ComponentPropsWithRef } from "react";
import { classNames } from "@/lib/classNames";

type DialogProps = Omit<ComponentPropsWithRef<"dialog">, "open" | "onClose"> & {
  open: boolean;
  /** Called when the dialog closes itself (Esc) or after `open` turns false. */
  onClose: () => void;
};

/**
 * A modal native `<dialog>`: `showModal()` gives the focus trap, Esc and the
 * inert background. Focus returns to whatever had it before opening.
 * Name it with `aria-labelledby` pointing at its heading.
 */
export function Dialog({
  open,
  onClose,
  className,
  children,
  ...props
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      opener?.focus();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={classNames(
        "m-auto w-[calc(100%-32px)] max-w-[440px] rounded-[14px] bg-surface p-[22px] text-ink shadow-[0_18px_50px_rgba(0,0,0,.25)] backdrop:bg-black/45",
        className,
      )}
      {...props}
    >
      {children}
    </dialog>
  );
}
