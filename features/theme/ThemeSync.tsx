"use client";

import { useLayoutEffect } from "react";
import { applyTheme, storedTheme } from "./theme";

/**
 * Re-applies the saved theme when the root layout mounts. Switching language
 * remounts `<html>` (the root layout is per locale), and React strips its
 * attributes, `data-theme` included; `themeScript` only runs on a full load.
 * A layout effect restores it before the paint.
 */
export function ThemeSync() {
  useLayoutEffect(() => applyTheme(storedTheme()), []);
  return null;
}
