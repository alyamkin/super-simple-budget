/**
 * @jest-environment node
 */
import { EXAMPLE_BUDGET } from "@/domain/__fixtures__/exampleBudget";
import { emptyBudget, type Budget } from "@/domain/budget";
import type { ItemId } from "@/domain/catalog/items";
import { en } from "@/i18n/dictionaries/en";
import { serializeBudget, toBudgetFile, type ExportOptions } from "./exportJson";
import { parseBudgetFile } from "./importJson";

const options: ExportOptions = {
  locale: "en",
  view: "year",
  itemLabel: (id: ItemId) => en.items[id].label,
  savedAt: new Date("2026-10-21T14:03:00.000Z"),
};

const withCustomRows: Budget = {
  ...EXAMPLE_BUDGET,
  rows: {
    ...EXAMPLE_BUDGET.rows,
    income: [
      ...EXAMPLE_BUDGET.rows.income,
      { kind: "custom", id: "c_k3j9x0aa1b", label: "Tutoring", amount: 200, frequency: "Monthly" },
      { kind: "custom", id: "c_0000000001", label: "", amount: null, frequency: "Weekly" },
    ],
  },
  estimates: {
    ...EXAMPLE_BUDGET.estimates,
    home: { enabled: false, amount: null, frequency: "Monthly" },
  },
};

describe("toBudgetFile", () => {
  it("writes the v2 header", () => {
    expect(toBudgetFile(emptyBudget(), options)).toMatchObject({
      app: "super-simple-budget",
      version: 2,
      minReaderVersion: 2,
      savedAt: "2026-10-21T14:03:00.000Z",
      locale: "en",
      view: "year",
    });
  });

  it("writes every bucket in step order, with estimates only where set", () => {
    const { buckets } = toBudgetFile(withCustomRows, options);
    expect(Object.keys(buckets)).toEqual([
      "income",
      "savings",
      "home",
      "around",
      "everyday",
      "family",
      "debt",
    ]);
    expect(buckets.family?.estimate).toEqual({
      enabled: true,
      amount: 450,
      frequency: "Monthly",
    });
    expect(buckets.around).not.toHaveProperty("estimate");
  });

  it("writes a label for every row and flags custom rows", () => {
    const { buckets } = toBudgetFile(withCustomRows, options);
    expect(buckets.income?.rows).toEqual([
      { id: "myNetIncome", label: "My net salary", amount: 2150, frequency: "Every2Weeks" },
      { id: "spouseNetIncome", label: "Partner's net salary", amount: 1850, frequency: "Every2Weeks" },
      { id: "c_k3j9x0aa1b", custom: true, label: "Tutoring", amount: 200, frequency: "Monthly" },
      { id: "c_0000000001", custom: true, label: "", amount: null, frequency: "Weekly" },
    ]);
  });
});

describe("serializeBudget", () => {
  it("pretty-prints the file", () => {
    expect(serializeBudget(emptyBudget(), options)).toMatch(
      /^\{\n {2}"app": "super-simple-budget",\n/,
    );
  });

  it.each([
    ["the example", EXAMPLE_BUDGET],
    ["custom rows and estimates", withCustomRows],
    ["an empty budget", emptyBudget()],
  ])("round-trips %s through parseBudgetFile", (_, budget) => {
    expect(parseBudgetFile(serializeBudget(budget, options))).toEqual({
      ok: true,
      budget,
      view: "year",
    });
  });
});
