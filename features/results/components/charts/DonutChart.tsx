"use client";

import { Label, Pie, PieChart } from "recharts";

type DonutChartProps = {
  /** In drawing order, clockwise from 12 o'clock. */
  parts: { key: string; amount: number; color: string }[];
  /** Small muted line in the centre, e.g. "Planned/mo". */
  caption: string;
  /** The formatted total under it. */
  total: string;
  animate: boolean;
};

const SIZE = 210;
const CENTER = SIZE / 2;

/**
 * The spending donut, fixed at 210×210. Decorative: the legend
 * table beside it carries the numbers.
 */
export function DonutChart({ parts, caption, total, animate }: DonutChartProps) {
  const data = parts.map(({ key, amount, color }) => ({ key, amount, fill: color }));
  return (
    <div aria-hidden="true" className="size-[210px]">
      <PieChart width={SIZE} height={SIZE} accessibilityLayer={false}>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="key"
          cx={CENTER}
          cy={CENTER}
          innerRadius={52}
          outerRadius={80}
          startAngle={90}
          endAngle={-270}
          paddingAngle={0}
          stroke="var(--surface)"
          strokeWidth={2}
          rootTabIndex={-1}
          isAnimationActive={animate}
          animationDuration={400}
        >
          <Label
            position="center"
            content={() => (
              <g textAnchor="middle">
                <text
                  x={CENTER}
                  y={CENTER - 5}
                  fontSize={11}
                  fill="var(--muted)"
                  className="font-body"
                >
                  {caption}
                </text>
                <text
                  x={CENTER}
                  y={CENTER + 19}
                  fontSize={19}
                  fontWeight={700}
                  fill="var(--ink)"
                  className="font-display"
                >
                  {total}
                </text>
              </g>
            )}
          />
        </Pie>
      </PieChart>
    </div>
  );
}
