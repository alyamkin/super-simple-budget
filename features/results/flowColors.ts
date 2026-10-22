import type { FlowSegmentKind } from "@/domain/results";

/** Colours of the income flow bar and its key (Spec §10.2). */
export const FLOW_COLORS: Record<Exclude<FlowSegmentKind, "over">, string> = {
  savings: "var(--b-save)",
  spending: "var(--accent)",
  leftOver: "var(--good-mid)",
};
