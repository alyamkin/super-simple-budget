"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

type ExpenseBarProps = {
  amount: number;
  /** The largest expense: every row shares this scale. */
  largest: number;
  /** CSS colour, e.g. `var(--b-home)`. */
  color: string;
  animate: boolean;
};

const HEIGHT = 10;

/**
 * One biggest-expense bar on a track (Spec §10.3). Decorative: the label,
 * amount and share around it are HTML.
 */
export function ExpenseBar({ amount, largest, color, animate }: ExpenseBarProps) {
  return (
    <div aria-hidden="true" style={{ height: HEIGHT }}>
      <ResponsiveContainer
        width="100%"
        height={HEIGHT}
        initialDimension={{ width: 320, height: HEIGHT }}
      >
        <BarChart
          layout="vertical"
          data={[{ amount }]}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          barSize={HEIGHT}
          accessibilityLayer={false}
        >
          <XAxis type="number" domain={[0, largest]} hide />
          <YAxis type="category" hide />
          <Bar
            dataKey="amount"
            fill={color}
            radius={HEIGHT / 2}
            background={{ fill: "var(--bg)", radius: HEIGHT / 2 }}
            isAnimationActive={animate}
            animationDuration={400}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
