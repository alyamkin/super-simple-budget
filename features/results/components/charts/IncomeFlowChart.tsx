"use client";

import { useId } from "react";
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { IncomeFlow } from "@/domain/results";
import { FLOW_COLORS } from "@/features/results/flowColors";

type IncomeFlowChartProps = IncomeFlow & {
  /** Text beside the income mark. */
  incomeLabel: string;
  animate: boolean;
};

const BAR = 34;
/** Room above the bar for the income label. */
const LABEL_SPACE = 16;
/** How far the income mark reaches past the bar's edges. */
const OVERHANG = 6;
const HEIGHT = LABEL_SPACE + BAR + 2 * OVERHANG;
const RADIUS = 8;

/** Rounds only the outer ends of the stack (corners: TL, TR, BR, BL). */
function radius(index: number, count: number): [number, number, number, number] {
  const left = index === 0 ? RADIUS : 0;
  const right = index === count - 1 ? RADIUS : 0;
  return [left, right, right, left];
}

/**
 * One stacked row: savings, spending, left over; past income, a hatched
 * overflow and a mark where income ends (Spec §10.2). Decorative: the key
 * beside it carries the numbers.
 */
export function IncomeFlowChart({
  segments,
  max,
  incomeMark,
  incomeLabel,
  animate,
}: IncomeFlowChartProps) {
  const hatch = useId();
  const datum = Object.fromEntries(
    segments.map((segment) => [segment.kind, segment.amount]),
  );

  return (
    <div aria-hidden="true" style={{ height: HEIGHT }}>
      <ResponsiveContainer
        width="100%"
        height={HEIGHT}
        initialDimension={{ width: 320, height: HEIGHT }}
      >
        <BarChart
          layout="vertical"
          data={[datum]}
          margin={{ top: LABEL_SPACE, right: 0, bottom: 0, left: 0 }}
          barSize={BAR}
          accessibilityLayer={false}
        >
          <defs>
            <pattern
              id={hatch}
              width={11}
              height={11}
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width={11} height={11} fill="var(--bad-soft)" />
              <rect width={6} height={11} fill="var(--bad)" />
            </pattern>
          </defs>
          <XAxis type="number" domain={[0, max]} hide />
          <YAxis type="category" hide />
          {segments.map(({ kind }, index) => (
            <Bar
              key={kind}
              dataKey={kind}
              stackId="flow"
              fill={kind === "over" ? `url(#${hatch})` : FLOW_COLORS[kind]}
              radius={radius(index, segments.length)}
              isAnimationActive={animate}
              animationDuration={400}
            />
          ))}
          {incomeMark !== null && (
            <ReferenceLine
              x={incomeMark}
              stroke="var(--bad)"
              strokeWidth={2}
              label={({ viewBox }: { viewBox?: { x?: number; y?: number } }) => (
                <text
                  x={(viewBox?.x ?? 0) - 3}
                  y={(viewBox?.y ?? 0) - 4}
                  textAnchor="end"
                  fill="var(--bad)"
                  fontSize="0.72rem"
                  fontWeight={700}
                >
                  {incomeLabel}
                </text>
              )}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
