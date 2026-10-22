"use client";

import type { ChangeEvent, Ref } from "react";
import { useFileActions } from "../useFileActions";

/**
 * The hidden `.json` picker behind an "Open budget" button: click
 * it through `ref` and the chosen file replaces the budget.
 */
export function BudgetFileInput({ ref }: { ref: Ref<HTMLInputElement> }) {
  const { open } = useFileActions();

  const onFileChosen = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    // Cleared so choosing the same file again still fires `change`.
    event.currentTarget.value = "";
    if (file) void open(file);
  };

  return (
    <input
      ref={ref}
      type="file"
      accept=".json,application/json"
      hidden
      onChange={onFileChosen}
    />
  );
}
