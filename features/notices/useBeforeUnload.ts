import { useEffect } from "react";

/**
 * Asks the browser to confirm leaving the page while `when` is true. The
 * listener exists only then, so a saved budget leaves freely and the page
 * stays eligible for the back/forward cache.
 */
export function useBeforeUnload(when: boolean) {
  useEffect(() => {
    if (!when) return;
    const controller = new AbortController();
    window.addEventListener(
      "beforeunload",
      (event) => {
        event.preventDefault();
        // Older browsers only prompt when `returnValue` is set.
        event.returnValue = "";
      },
      { signal: controller.signal },
    );
    return () => controller.abort();
  }, [when]);
}
