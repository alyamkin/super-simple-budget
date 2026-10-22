"use client";

import { IncomeFlowBar } from "./IncomeFlowBar";
import { TopExpenses } from "./TopExpenses";

/**
 * The results sections below the headline (Spec §4.6.3–9). Loaded on demand
 * through `LazyResultsView`, so Recharts stays out of the wizard's bundle.
 */
export function ResultsView() {
  return (
    <>
      <IncomeFlowBar />
      <TopExpenses />
    </>
  );
}
