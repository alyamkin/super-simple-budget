/**
 * @jest-environment node
 */
import { EXAMPLE_BUDGET } from "@/domain/__fixtures__/exampleBudget";
import { emptyBudget, type Budget } from "@/domain/budget";
import { computeTotals, monthly } from "@/domain/totals";
import { formatMoney } from "@/lib/format";

const money = (n: number) => formatMoney(n, "en", { decimals: 2 });

describe("monthly", () => {
  it("converts by frequency and treats an empty amount as zero", () => {
    expect(monthly({ amount: 120, frequency: "Annually" })).toBe(10);
    expect(monthly({ amount: null, frequency: "Weekly" })).toBe(0);
  });
});

describe("computeTotals", () => {
  it("matches the example vector (Spec §7.5)", () => {
    const t = computeTotals(EXAMPLE_BUDGET);
    expect(money(t.income)).toBe("$8,666.67");
    expect(money(t.byBucket.home)).toBe("$2,717.50");
    expect(money(t.byBucket.around)).toBe("$1,031.00");
    expect(money(t.byBucket.everyday)).toBe("$1,456.67");
    expect(money(t.byBucket.family)).toBe("$450.00");
    expect(money(t.byBucket.debt)).toBe("$540.00");
    expect(money(t.savings)).toBe("$600.00");
    expect(money(t.debt)).toBe("$540.00");
    expect(money(t.outgoing)).toBe("$6,795.17");
    expect(money(t.spending)).toBe("$6,195.17");
    expect(money(t.balance)).toBe("$1,871.50");
    expect(formatMoney(t.balance, "en")).toBe("$1,872");
  });

  it("is all zeros for an empty budget", () => {
    const t = computeTotals(emptyBudget());
    expect(t).toMatchObject({
      income: 0,
      savings: 0,
      outgoing: 0,
      spending: 0,
      balance: 0,
    });
    expect(Object.values(t.byCategory).every((v) => v === 0)).toBe(true);
  });

  it("adds itemized rows to their categories", () => {
    const t = computeTotals(EXAMPLE_BUDGET);
    expect(t.byCategory.housing).toBeCloseTo(2473);
    expect(t.byCategory.fees).toBeCloseTo(29.5);
    expect(t.byCategory.insurance).toBe(0);
    expect(t.byCategory.savings).toBe(600);
    expect(t.byCategory.debt).toBe(540);
  });

  it("uses the rough total for an estimated bucket, with no category contribution", () => {
    const t = computeTotals(EXAMPLE_BUDGET);
    expect(t.byBucket.family).toBe(450);
    expect(t.byCategory.recreation).toBe(0);
    expect(t.byCategory.giftsDonations).toBe(0);
  });

  it("uses the rows again once the estimate is turned off", () => {
    const budget: Budget = {
      ...EXAMPLE_BUDGET,
      estimates: {
        family: { enabled: false, amount: 450, frequency: "Monthly" },
      },
    };
    const t = computeTotals(budget);
    expect(t.byBucket.family).toBe(425); // (3000 + 1200 + 900) / 12
    expect(t.byCategory.recreation).toBe(325);
    expect(t.byCategory.giftsDonations).toBe(100);
  });

  it("counts an empty rough total as zero", () => {
    const budget = emptyBudget();
    budget.rows.home.push({
      kind: "catalog",
      id: "rent",
      amount: 1000,
      frequency: "Monthly",
    });
    budget.estimates.home = { enabled: true, amount: null, frequency: "Monthly" };
    expect(computeTotals(budget).byBucket.home).toBe(0);
  });

  it("adds custom rows to savings and debt only", () => {
    const budget = emptyBudget();
    for (const bucket of ["savings", "home", "debt"] as const) {
      budget.rows[bucket].push({
        kind: "custom",
        id: `c_${bucket}`,
        label: "Mine",
        amount: 100,
        frequency: "Monthly",
      });
    }
    const t = computeTotals(budget);
    expect(t.byCategory.savings).toBe(100);
    expect(t.byCategory.debt).toBe(100);
    expect(t.byCategory.housing).toBe(0);
    expect(t.byBucket.home).toBe(100);
    expect(t.outgoing).toBe(300);
    expect(t.spending).toBe(200);
    expect(t.balance).toBe(-300);
  });
});
