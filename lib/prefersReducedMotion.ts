export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Whether the user asked the OS for less motion (`false` where unknown). */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}
