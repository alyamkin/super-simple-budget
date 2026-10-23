"use client";

import { MoonIcon, SunIcon } from "@/components/ui/Icons";
import { useTranslator } from "@/i18n/I18nProvider";
import { useTheme } from "./useTheme";

/**
 * "Dark theme" toggle button. Starts from the system's theme; the choice is
 * remembered in local storage and applied before paint by `themeScript`.
 * The server does not know the theme, so it renders the light state.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslator();
  const [theme, setTheme] = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={t("theme.dark")}
      aria-pressed={dark}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={className}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
