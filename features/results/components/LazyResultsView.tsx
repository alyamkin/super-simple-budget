"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { ResultsSkeleton } from "./ResultsSkeleton";

/** `ResultsView`, fetched only when the results step opens. */
export const LazyResultsView = dynamic(
  () => import("./ResultsView").then((module) => module.ResultsView),
  { ssr: false, loading: () => <ResultsSkeleton /> },
);

/**
 * Fetches the results chunk when the browser is idle while `when` holds, so
 * it is ready by the time the user opens the results.
 */
export function usePrefetchResults(when: boolean) {
  useEffect(() => {
    if (!when) return;
    const load = () => void import("./ResultsView");
    // Safari has no requestIdleCallback.
    if (typeof requestIdleCallback !== "function") {
      const timer = setTimeout(load, 200);
      return () => clearTimeout(timer);
    }
    const handle = requestIdleCallback(load, { timeout: 2000 });
    return () => cancelIdleCallback(handle);
  }, [when]);
}
