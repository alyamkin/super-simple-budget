import { useSyncExternalStore } from "react";
import {
  prefersReducedMotion,
  REDUCED_MOTION_QUERY,
} from "./prefersReducedMotion";

function subscribe(onChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** {@link prefersReducedMotion}, kept up to date; `false` on the server. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}
