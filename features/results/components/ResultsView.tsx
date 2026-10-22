"use client";

import { FileBox } from "@/features/files/components/FileBox";
import { CompareSection } from "./CompareSection";
import { IncomeFlowBar } from "./IncomeFlowBar";
import { NextSteps } from "./NextSteps";
import { SpendingDonut } from "./SpendingDonut";
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
      <SpendingDonut />
      <CompareSection />
      <NextSteps />
      <FileBox />
    </>
  );
}
