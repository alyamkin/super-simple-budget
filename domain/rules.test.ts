/**
 * @jest-environment node
 */
import { CATEGORY_IDS } from "@/domain/catalog/categories";
import {
  RULES,
  evaluateRule,
  greenEdge,
  ruleBar,
  ruleSentence,
  type RuleCategory,
  type RuleSentence,
} from "@/domain/rules";
import { en } from "@/i18n/dictionaries/en";
import { fr } from "@/i18n/dictionaries/fr";

const INCOME = 10_000;

/** Level for a share of income given in percent. */
const levelAt = (category: RuleCategory, percent: number) =>
  evaluateRule(category, (INCOME * percent) / 100, INCOME)?.level;

const CEILINGS = Object.entries(RULES).flatMap(([category, rule]) =>
  rule.kind === "ceiling"
    ? [[category as RuleCategory, rule.green * 100, rule.yellow * 100] as const]
    : [],
);

describe("RULES", () => {
  it("covers every category and savings", () => {
    expect(Object.keys(RULES).sort()).toEqual(
      [...CATEGORY_IDS, "savings"].sort(),
    );
  });
});

describe("evaluateRule", () => {
  it("returns null without income", () => {
    expect(evaluateRule("housing", 1000, 0)).toBeNull();
    expect(evaluateRule("savings", 0, 0)).toBeNull();
    expect(evaluateRule("food", 0, -5)).toBeNull();
  });

  it("returns the share of income", () => {
    expect(evaluateRule("housing", 2500, INCOME)).toEqual({
      level: "green",
      share: 0.25,
    });
  });

  it.each(CEILINGS)(
    "%s: green up to %s%, yellow up to %s%, red above",
    (category, green, yellow) => {
      expect(levelAt(category, 0.01)).toBe("green");
      expect(levelAt(category, green)).toBe("green");
      expect(levelAt(category, green + 0.01)).toBe("yellow");
      expect(levelAt(category, yellow)).toBe("yellow");
      expect(levelAt(category, yellow + 0.01)).toBe("red");
    },
  );

  it("savings: green from 5%, yellow below, red at zero", () => {
    expect(levelAt("savings", 5)).toBe("green");
    expect(levelAt("savings", 50)).toBe("green");
    expect(levelAt("savings", 4.99)).toBe("yellow");
    expect(levelAt("savings", 0.01)).toBe("yellow");
    expect(levelAt("savings", 0)).toBe("red");
  });

  it("flags zero as red only for savings, food, insurance and clothing", () => {
    const zeroIsRed = [...CATEGORY_IDS, "savings" as const].filter(
      (category) => evaluateRule(category, 0, INCOME)?.level === "red",
    );
    expect(zeroIsRed.sort()).toEqual(
      ["clothing", "food", "insurance", "savings"].sort(),
    );
    expect(evaluateRule("housing", 0, INCOME)).toBeNull();
  });
});

describe("greenEdge", () => {
  it("is where the usual range ends", () => {
    expect(greenEdge("savings")).toBe(0.05);
    expect(greenEdge("debt")).toBe(0.15);
  });
});

describe("ruleSentence", () => {
  it.each<[RuleCategory, number, RuleSentence]>([
    ["savings", 0, "savings.zero"],
    ["savings", 4, "savings.under"],
    ["savings", 6, "savings.green"],
    ["food", 0, "zero"],
    ["food", 10, "green"],
    ["food", 25, "yellow"],
    ["food", 40, "red"],
  ])("%s at %s% → %s", (category, percent, sentence) => {
    const result = evaluateRule(category, (INCOME * percent) / 100, INCOME)!;
    expect(ruleSentence(category, result)).toBe(sentence);
  });

  it.each(Object.entries({ en, fr }))(
    "has an %s sentence for every outcome with the {edge} placeholder",
    (_, dict) => {
      const sentences = [
        dict.rule.savings.zero,
        dict.rule.savings.green,
        dict.rule.savings.under,
        dict.rule.zero,
        dict.rule.green,
        dict.rule.yellow,
        dict.rule.red,
      ];
      for (const sentence of sentences) expect(sentence).toContain("{edge}");
    },
  );
});

describe("ruleBar", () => {
  it("uses a scale of at least 30%", () => {
    expect(ruleBar("fees", 0.03)).toEqual({ fill: 0.1, marker: 0.02 / 0.3 });
  });

  it("widens the scale to twice the green edge", () => {
    expect(ruleBar("housing", 0.35)).toEqual({ fill: 0.5, marker: 0.5 });
  });

  it("widens the scale past a large share and caps the fill", () => {
    const { fill, marker } = ruleBar("debt", 0.6);
    expect(fill).toBeCloseTo(1 / 1.15);
    expect(marker).toBeCloseTo(0.15 / 0.69);
    expect(fill).toBeLessThanOrEqual(1);
  });
});
