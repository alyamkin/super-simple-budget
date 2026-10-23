import { useSyncExternalStore } from "react";
import {
  applyTheme,
  chooseTheme,
  currentTheme,
  DARK_QUERY,
  storedTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from "./theme";

function subscribe(onChange: () => void) {
  // `data-theme` changes: this tab's choices (and anything else setting it).
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributeFilter: ["data-theme"],
  });
  // Another tab's choice.
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) {
      applyTheme(storedTheme());
    }
  };
  window.addEventListener("storage", onStorage);
  const media =
    typeof window.matchMedia === "function"
      ? window.matchMedia(DARK_QUERY)
      : null;
  media?.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onStorage);
    media?.removeEventListener("change", onChange);
  };
}

/** The theme on screen (`null` on the server) and a setter that remembers it. */
export function useTheme(): [Theme | null, (theme: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => null);
  return [theme, chooseTheme];
}
