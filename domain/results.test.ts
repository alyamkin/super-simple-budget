/**
 * @jest-environment node
 */
import { EXAMPLE_BUDGET } from "@/domain/__fixtures__/exampleBudget";
import { emptyBudget, type Budget, type Row } from "@/domain/budget";
import type { ItemId } from "@/domain/catalog/items";
import {
  computeChecks,
  flaggedChecks,
  headline,
  incomeFlow,
  nextSteps,
  roughBuckets,
  topExpenses,
} from "@/domain/results";
import { computeTotals } from "@/domain/totals";

const row = (id: ItemId, amount: number | null): Row => ({
  kind: "catalog",
  id,
  amount,
  frequency: "Monthly",
});

/** A budget with only the given monthly rows. */
function budgetWith(rows: Partial<Record<keyof Budget["rows"], Row[]>>) {
  const budget = emptyBudget();
  Object.assign(budget.rows, rows);
  return budget;
}

const resultsOf = (budget: Budget) => {
  const totals = computeTotals(budget);
  const checks = computeChecks(budget, totals);
  return { totals, checks };
};

describe("computeChecks", () => {
  it("flags only insurance in the example, listed first", () => {
    const { checks } = resultsOf(EXAMPLE_BUDGET);
    expect(flaggedChecks(checks)).toEqual([
      { category: "insurance", amount: 0, level: "red", share: 0 },
    ]);
    expect(checks[0].category).toBe("insurance");
    expect(checks.find((c) => c.category === "savings")?.level).toBe("green");
  });

  it("leaves out estimated buckets' categories", () => {
    const categories = resultsOf(EXAMPLE_BUDGET).checks.map((c) => c.category);
    for (const category of ["childcare", "education", "recreation", "pets", "giftsDonations"]) {
      expect(categories).not.toContain(category);
    }
    expect(roughBuckets(EXAMPLE_BUDGET)).toEqual(["family"]);
  });

  it("includes zero amounts only when zero is red", () => {
    const { checks } = resultsOf(budgetWith({ income: [row("myNetIncome", 1000)] }));
    expect(checks.map((c) => c.category).sort()).toEqual(
      ["clothing", "food", "insurance", "savings"].sort(),
    );
    expect(checks.every((c) => c.level === "red")).toBe(true);
  });

  it("sorts red, yellow, green, then by amount", () => {
    const { checks } = resultsOf(
      budgetWith({
        income: [row("myNetIncome", 1000)],
        savings: [row("emergencyFund", 100)], // 10% green
        home: [row("rent", 500), row("life", 50), row("bankFees", 50)], // red, yellow, yellow
        everyday: [row("groceries", 150), row("clothes", 30), row("dentist", null)],
      }),
    );
    expect(checks.map((c) => [c.category, c.level])).toEqual([
      ["housing", "red"],
      ["insurance", "yellow"],
      ["fees", "yellow"],
      ["food", "green"],
      ["savings", "green"],
      ["clothing", "green"],
    ]);
  });

  it("is empty without income", () => {
    expect(resultsOf(budgetWith({ home: [row("rent", 1000)] })).checks).toEqual([]);
  });
});

describe("headline", () => {
  it("reports the example's monthly balance", () => {
    expect(headline(computeTotals(EXAMPLE_BUDGET))).toEqual({
      kind: "leftOver",
      amount: expect.closeTo(1871.5),
    });
  });

  it("reports a shortfall as a positive amount", () => {
    const totals = computeTotals(
      budgetWith({ income: [row("myNetIncome", 1000)], home: [row("rent", 1200)] }),
    );
    expect(headline(totals)).toEqual({ kind: "shortfall", amount: 200 });
  });

  it("asks for income when there is none", () => {
    const totals = computeTotals(budgetWith({ home: [row("rent", 1200)] }));
    expect(headline(totals)).toEqual({ kind: "noIncome" });
  });
});

describe("incomeFlow", () => {
  it("splits the example's income into savings, spending and left over", () => {
    expect(incomeFlow(computeTotals(EXAMPLE_BUDGET))).toEqual({
      segments: [
        { kind: "savings", amount: 600 },
        { kind: "spending", amount: expect.closeTo(6195.17) },
        { kind: "leftOver", amount: expect.closeTo(1871.5) },
      ],
      max: expect.closeTo(8666.67),
      incomeMark: null,
    });
  });

  it("clips to income and marks the overflow when short", () => {
    const totals = computeTotals(
      budgetWith({
        income: [row("myNetIncome", 1000)],
        savings: [row("emergencyFund", 200)],
        home: [row("rent", 1200)],
      }),
    );
    expect(incomeFlow(totals)).toEqual({
      segments: [
        { kind: "savings", amount: 200 },
        { kind: "spending", amount: 800 },
        { kind: "over", amount: 400 },
      ],
      max: 1400,
      incomeMark: 1000,
    });
  });

  it("clips savings too when they alone exceed income", () => {
    const totals = computeTotals(
      budgetWith({
        income: [row("myNetIncome", 100)],
        savings: [row("emergencyFund", 300)],
      }),
    );
    expect(incomeFlow(totals)?.segments).toEqual([
      { kind: "savings", amount: 100 },
      { kind: "over", amount: 200 },
    ]);
  });

  it("shows what goes out unmarked without income", () => {
    const totals = computeTotals(budgetWith({ home: [row("rent", 1200)] }));
    expect(incomeFlow(totals)).toEqual({
      segments: [{ kind: "spending", amount: 1200 }],
      max: 1200,
      incomeMark: null,
    });
  });

  it("is null when nothing comes in or goes out", () => {
    expect(incomeFlow(computeTotals(emptyBudget()))).toBeNull();
  });
});

describe("topExpenses", () => {
  it("lists the example's top 5 with the rough total as one entry", () => {
    const { top, count, share } = topExpenses(EXAMPLE_BUDGET);
    expect(
      top.map((e) => (e.kind === "estimate" ? `~${e.bucket}` : e.row.id)),
    ).toEqual(["rent", "groceries", "~family", "carPayments", "restaurants"]);
    expect(count).toBe(21);
    expect(share).toBeCloseTo(4443.33 / 6195.17, 4);
  });

  it("excludes savings and zero or empty amounts", () => {
    const { top, count, share } = topExpenses(
      budgetWith({
        savings: [row("emergencyFund", 500)],
        home: [row("rent", 1000), row("electricity", 0), row("internet", null)],
      }),
    );
    expect(top.map((e) => e.kind === "row" && e.row.id)).toEqual(["rent"]);
    expect(count).toBe(1);
    expect(share).toBe(1);
  });

  it("skips an empty rough total", () => {
    const budget = budgetWith({ home: [row("rent", 1000)] });
    budget.estimates.home = { enabled: true, amount: null, frequency: "Monthly" };
    expect(topExpenses(budget)).toEqual({ top: [], count: 0, share: 0 });
  });
});

describe("nextSteps", () => {
  const stepsOf = (budget: Budget) => {
    const { totals, checks } = resultsOf(budget);
    return nextSteps(budget, totals, checks);
  };

  it("suggests a job for the surplus and itemizing in the example", () => {
    expect(stepsOf(EXAMPLE_BUDGET)).toEqual([
      { kind: "surplus", surplus: expect.closeTo(1871.5) },
      { kind: "itemize", buckets: ["family"] },
    ]);
  });

  it("starts an empty budget with income and an emergency fund", () => {
    expect(stepsOf(emptyBudget())).toEqual([
      { kind: "addIncome" },
      { kind: "emergencyFund" },
    ]);
  });

  it("closes a gap starting with the worst flagged category", () => {
    const steps = stepsOf(
      budgetWith({
        income: [row("myNetIncome", 1000)],
        savings: [row("emergencyFund", 100)],
        home: [row("rent", 1000), row("life", 50)],
        everyday: [row("groceries", 100), row("clothes", 10)],
      }),
    );
    expect(steps).toEqual([
      { kind: "closeGap", gap: 260, startWith: "housing" },
    ]);
  });

  it("closes a gap from the largest bucket when nothing is flagged", () => {
    const steps = stepsOf(budgetWith({ home: [row("rent", 500)] }));
    expect(steps).toContainEqual({ kind: "closeGap", gap: 500, startWith: null });
  });

  it("does not call a balance within half a cent a surplus", () => {
    const steps = stepsOf(
      budgetWith({
        income: [row("myNetIncome", 1000.5)],
        savings: [row("emergencyFund", 1000)],
      }),
    );
    expect(steps).toEqual([]);
  });

  it("lists every applicable step in priority order", () => {
    const budget = budgetWith({ home: [row("rent", 500)] });
    budget.estimates.around = { enabled: true, amount: 100, frequency: "Monthly" };
    expect(stepsOf(budget).map((s) => s.kind)).toEqual([
      "addIncome",
      "closeGap",
      "emergencyFund",
      "itemize",
    ]);
  });
});
