export type Theme = "light" | "dark";

/** Local storage key of an explicit choice; absent means "follow the system". */
export const THEME_STORAGE_KEY = "ssb:theme";

export const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Page backgrounds (`--bg`), used for the browser's `theme-color`. */
export const THEME_COLORS: Record<Theme, string> = {
  light: "#f3f6f7",
  dark: "#0e1a1d",
};

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/** The saved choice, or `null` when there is none (or storage is blocked). */
export function storedTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function systemTheme(): Theme {
  return typeof window.matchMedia === "function" &&
    window.matchMedia(DARK_QUERY).matches
    ? "dark"
    : "light";
}

/** The theme on screen: the `data-theme` override, else the system's. */
export function currentTheme(): Theme {
  const forced = document.documentElement.dataset.theme;
  return isTheme(forced) ? forced : systemTheme();
}

/**
 * Puts `theme` on `<html>` (or removes the override for `null`) and points
 * the `theme-color` metas at it. Kept in sync with {@link themeScript}.
 */
export function applyTheme(theme: Theme | null): void {
  const root = document.documentElement;
  if (theme) root.dataset.theme = theme;
  else delete root.dataset.theme;
  for (const meta of document.querySelectorAll<HTMLMetaElement>(
    'meta[name="theme-color"]',
  )) {
    const media = meta.getAttribute("media") ?? "";
    meta.content =
      THEME_COLORS[theme ?? (media.includes("dark") ? "dark" : "light")];
  }
}

/**
 * Switches to `theme`. Choosing the system's theme forgets the choice, so the
 * page follows the system again.
 */
export function chooseTheme(theme: Theme): void {
  const forced = theme === systemTheme() ? null : theme;
  try {
    if (forced) window.localStorage.setItem(THEME_STORAGE_KEY, forced);
    else window.localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    // Blocked storage: the choice lasts until the page reloads.
  }
  applyTheme(forced);
}

/**
 * Inline `<head>` script that applies the saved theme before the first paint.
 * Mirrors {@link storedTheme} + {@link applyTheme}; the metas are not parsed
 * yet, so it fixes them once the document is.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t!=="light"&&t!=="dark")return;document.documentElement.dataset.theme=t;var c=${JSON.stringify(THEME_COLORS)}[t];document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.content=c})})}catch(e){}})()`;
