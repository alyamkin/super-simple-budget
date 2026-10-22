import { isEstimated, type Budget, type Row } from "@/domain/budget";
import {
  BUCKETS,
  OUTGOING_BUCKETS,
  type EstimableBucketId,
  type OutgoingBucketId,
} from "@/domain/catalog/buckets";
import {
  evaluateRule,
  type RuleCategory,
  type RuleLevel,
} from "@/domain/rules";
import { monthly, type Totals } from "@/domain/totals";

export type Check = {
  category: RuleCategory;
  /** Monthly. */
  amount: number;
  level: RuleLevel;
  share: number;
};

const LEVEL_ORDER: Record<RuleLevel, number> = { red: 0, yellow: 1, green: 2 };

/**
 * Rule-of-thumb comparisons for every itemized bucket's categories, worst
 * first, then largest first. Empty without income (Spec §7.4).
 */
export function computeChecks(budget: Budget, totals: Totals): Check[] {
  const checks: Check[] = [];
  for (const bucket of OUTGOING_BUCKETS) {
    if (isEstimated(budget, bucket)) continue;
    for (const category of BUCKETS[bucket].categories) {
      if (!category) continue;
      const amount = totals.byCategory[category];
      const result = evaluateRule(category, amount, totals.income);
      if (result && (amount > 0 || result.level === "red")) {
        checks.push({ category, amount, ...result });
      }
    }
  }
  return checks.sort(
    (a, b) =>
      LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] || b.amount - a.amount,
  );
}

/** Checks outside the usual range ("{n} categories are outside…"). */
export const flaggedChecks = (checks: readonly Check[]): Check[] =>
  checks.filter((check) => check.level !== "green");

/** Buckets planned as a rough total, in step order. */
export const roughBuckets = (budget: Budget): EstimableBucketId[] =>
  OUTGOING_BUCKETS.filter((bucket): bucket is EstimableBucketId =>
    isEstimated(budget, bucket),
  );

export type Headline =
  | { kind: "noIncome" }
  | { kind: "leftOver" | "shortfall"; amount: number };

/** Results heading, always monthly. `amount` is positive. */
export function headline(totals: Totals): Headline {
  if (totals.income <= 0) return { kind: "noIncome" };
  return totals.balance >= 0
    ? { kind: "leftOver", amount: totals.balance }
    : { kind: "shortfall", amount: -totals.balance };
}

export type FlowSegmentKind = "savings" | "spending" | "leftOver" | "over";

export type IncomeFlow = {
  /** Non-zero stacked segments, left to right, summing to `max`. */
  segments: { kind: FlowSegmentKind; amount: number }[];
  /** The bar's full scale: income or what goes out, whichever is larger. */
  max: number;
  /** Where income ends on the bar when outgoing exceeds it, else `null`. */
  incomeMark: number | null;
};

/**
 * The "Where your income goes" bar (Spec §10.2): savings, spending and what
 * is left over. When outgoing exceeds income, the part beyond income becomes
 * one `over` segment. `null` when there is nothing to show.
 */
export function incomeFlow(totals: Totals): IncomeFlow | null {
  const { income, outgoing, savings, spending, balance } = totals;
  if (income <= 0 && outgoing <= 0) return null;
  const short = income > 0 && balance < 0;
  // Clip savings, then spending, to income so the overflow is drawn once.
  const shownSavings = short ? Math.min(savings, income) : savings;
  const segments: IncomeFlow["segments"] = [
    { kind: "savings", amount: shownSavings },
    { kind: "spending", amount: short ? income - shownSavings : spending },
    { kind: "leftOver", amount: Math.max(balance, 0) },
    { kind: "over", amount: short ? -balance : 0 },
  ];
  return {
    segments: segments.filter((segment) => segment.amount > 0),
    max: Math.max(income, outgoing),
    incomeMark: short ? income : null,
  };
}

/** Donut order (Spec §8.3): spending buckets first, savings last. */
const SPLIT_ORDER: readonly OutgoingBucketId[] = [
  "home",
  "around",
  "everyday",
  "family",
  "debt",
  "savings",
];

export type SpendingSplit = {
  /** Non-zero buckets in donut order; `share` is of `total`. */
  parts: { bucket: OutgoingBucketId; amount: number; share: number }[];
  /** Everything planned to go out, monthly. */
  total: number;
};

/** "Where your money goes": each outgoing bucket's part of the plan. */
export function spendingSplit(totals: Totals): SpendingSplit {
  const total = totals.outgoing;
  return {
    parts: SPLIT_ORDER.flatMap((bucket) => {
      const amount = totals.byBucket[bucket];
      return amount > 0 ? { bucket, amount, share: amount / total } : [];
    }),
    total,
  };
}

export type Expense = { bucket: OutgoingBucketId; amount: number } & (
  | { kind: "estimate" }
  | { kind: "row"; row: Row }
);

export type TopExpenses = {
  /** Up to 5, largest first. */
  top: Expense[];
  /** How many expenses there are in all. */
  count: number;
  /** The top entries' share of all listed expenses (0 when there are none). */
  share: number;
};

const TOP_COUNT = 5;

/**
 * Biggest monthly expenses: each rough total as one entry plus each itemized
 * row, savings excluded, zero amounts skipped (Spec §8.2).
 */
export function topExpenses(budget: Budget): TopExpenses {
  const all: Expense[] = [];
  for (const bucket of OUTGOING_BUCKETS) {
    if (bucket === "savings") continue;
    if (isEstimated(budget, bucket)) {
      const amount = monthly(budget.estimates[bucket]!);
      if (amount > 0) all.push({ kind: "estimate", bucket, amount });
      continue;
    }
    for (const row of budget.rows[bucket]) {
      const amount = monthly(row);
      if (amount > 0) all.push({ kind: "row", bucket, row, amount });
    }
  }
  // Stable sort keeps step and row order among equal amounts.
  all.sort((a, b) => b.amount - a.amount);
  const top = all.slice(0, TOP_COUNT);
  const sum = (list: Expense[]) => list.reduce((s, e) => s + e.amount, 0);
  const total = sum(all);
  return { top, count: all.length, share: total ? sum(top) / total : 0 };
}

export type NextStep =
  | { kind: "addIncome" }
  /** `startWith`: the worst category outside the usual range, if any. */
  | { kind: "closeGap"; gap: number; startWith: RuleCategory | null }
  | { kind: "surplus"; surplus: number }
  | { kind: "emergencyFund" }
  | { kind: "itemize"; buckets: EstimableBucketId[] };

const MAX_NEXT_STEPS = 4;

/** Tips for the results page, in priority order (Spec §8.4). */
export function nextSteps(
  budget: Budget,
  totals: Totals,
  checks: readonly Check[],
): NextStep[] {
  const steps: NextStep[] = [];
  if (totals.income <= 0) steps.push({ kind: "addIncome" });
  if (totals.balance < 0) {
    const [worst] = flaggedChecks(checks);
    steps.push({
      kind: "closeGap",
      gap: -totals.balance,
      startWith: worst?.category ?? null,
    });
  }
  if (totals.balance > 0.5) {
    steps.push({ kind: "surplus", surplus: totals.balance });
  }
  const hasEmergencyFund = budget.rows.savings.some(
    (row) => row.kind === "catalog" && row.id === "emergencyFund",
  );
  if (!hasEmergencyFund) steps.push({ kind: "emergencyFund" });
  const rough = roughBuckets(budget);
  if (rough.length) steps.push({ kind: "itemize", buckets: rough });
  return steps.slice(0, MAX_NEXT_STEPS);
}
