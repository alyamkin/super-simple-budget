import type { CategoryId } from "@/domain/catalog/categories";

/** Anything a rule of thumb applies to: the expense categories plus savings. */
export type RuleCategory = CategoryId | "savings";

export type RuleLevel = "green" | "yellow" | "red";

type Rule =
  /** A target to reach: green from `green` up, yellow below it, red at zero. */
  | { kind: "target"; green: number }
  /** A ceiling: green up to `green`, yellow up to `yellow`, red above. */
  | { kind: "ceiling"; green: number; yellow: number; zeroIsRed?: boolean };

/**
 * Usual Canadian ranges as a share of monthly income, cleaned from the
 * artifact's `D.rules`.
 */
export const RULES: Record<RuleCategory, Rule> = {
  savings: { kind: "target", green: 0.05 },
  debt: { kind: "ceiling", green: 0.15, yellow: 0.3 },
  housing: { kind: "ceiling", green: 0.35, yellow: 0.43 },
  communications: { kind: "ceiling", green: 0.05, yellow: 0.15 },
  food: { kind: "ceiling", green: 0.2, yellow: 0.3, zeroIsRed: true },
  insurance: { kind: "ceiling", green: 0.03, yellow: 0.09, zeroIsRed: true },
  transportation: { kind: "ceiling", green: 0.2, yellow: 0.3 },
  childcare: { kind: "ceiling", green: 0.14, yellow: 0.25 },
  education: { kind: "ceiling", green: 0.08, yellow: 0.17 },
  recreation: { kind: "ceiling", green: 0.15, yellow: 0.3 },
  personalCare: { kind: "ceiling", green: 0.02, yellow: 0.1 },
  clothing: { kind: "ceiling", green: 0.05, yellow: 0.2, zeroIsRed: true },
  medical: { kind: "ceiling", green: 0.05, yellow: 0.2 },
  pets: { kind: "ceiling", green: 0.02, yellow: 0.1 },
  fees: { kind: "ceiling", green: 0.02, yellow: 0.1 },
  giftsDonations: { kind: "ceiling", green: 0.05, yellow: 0.2 },
};

export type RuleResult = { level: RuleLevel; share: number };

/** Where the usual range ends: the `{edge}` in rule sentences and the bar marker. */
export const greenEdge = (category: RuleCategory): number =>
  RULES[category].green;

/**
 * Compares a monthly amount with the usual range. `null` when there is no
 * income to compare with, or when nothing is planned and that is fine.
 */
export function evaluateRule(
  category: RuleCategory,
  amount: number,
  income: number,
): RuleResult | null {
  if (income <= 0) return null;
  const rule = RULES[category];
  const share = amount / income;
  if (share === 0) {
    const zeroIsRed = rule.kind === "target" || rule.zeroIsRed;
    return zeroIsRed ? { level: "red", share } : null;
  }
  if (rule.kind === "target") {
    return { level: share >= rule.green ? "green" : "yellow", share };
  }
  const level =
    share <= rule.green ? "green" : share <= rule.yellow ? "yellow" : "red";
  return { level, share };
}

/** Key of the explaining sentence under the dictionary's `rule.*`. */
export type RuleSentence =
  | "savings.zero"
  | "savings.green"
  | "savings.under"
  | "zero"
  | RuleLevel;

export function ruleSentence(
  category: RuleCategory,
  { level, share }: RuleResult,
): RuleSentence {
  if (category === "savings") {
    return share === 0
      ? "savings.zero"
      : level === "green"
        ? "savings.green"
        : "savings.under";
  }
  return share === 0 ? "zero" : level;
}

/** Decorative bar geometry, as fractions of the bar's width. */
export function ruleBar(
  category: RuleCategory,
  share: number,
): { fill: number; marker: number } {
  const edge = greenEdge(category);
  const scale = Math.max(0.3, share * 1.15, edge * 2);
  return { fill: Math.min(share / scale, 1), marker: edge / scale };
}
