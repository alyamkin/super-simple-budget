"use client";

import dynamic from "next/dynamic";
import { ResultsSkeleton } from "./ResultsSkeleton";

/** `ResultsView`, fetched only when the results step opens (Spec §10.0). */
export const LazyResultsView = dynamic(
  () => import("./ResultsView").then((module) => module.ResultsView),
  { ssr: false, loading: () => <ResultsSkeleton /> },
);
