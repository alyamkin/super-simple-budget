/**
 * @jest-environment node
 */
import { v1ToV2 } from "./v1ToV2";

describe("v1ToV2", () => {
  it("turns picked ids, values, rough totals and custom rows into v2 buckets", () => {
    const v2 = v1ToV2({
      app: "super-simple-budget",
      version: 1,
      savedAt: "2025-01-01T00:00:00.000Z",
      lang: "fr",
      view: "year",
      picked: { home: ["rent", "internet"] },
      v: {
        rent: { a: 1500, f: "Monthly" },
        internet: { a: "", f: "Monthly" },
        cabc123: { a: 40, f: "Weekly" },
      },
      est: { home: { on: 1, a: 1800, f: "Monthly" } },
      custom: { home: [{ id: "cabc123", l: "Cleaner" }] },
    });

    expect(v2).toEqual({
      app: "super-simple-budget",
      version: 2,
      minReaderVersion: 2,
      savedAt: "2025-01-01T00:00:00.000Z",
      locale: "fr",
      view: "year",
      buckets: {
        home: {
          rows: [
            { id: "rent", label: "", amount: 1500, frequency: "Monthly" },
            { id: "internet", label: "", amount: "", frequency: "Monthly" },
            {
              id: "cabc123",
              custom: true,
              label: "Cleaner",
              amount: 40,
              frequency: "Weekly",
            },
          ],
          estimate: { enabled: true, amount: 1800, frequency: "Monthly" },
        },
      },
    });
  });

  it("puts the custom rows of a bucket after its catalog rows", () => {
    const v2 = v1ToV2({
      custom: { debt: [{ id: "c1", l: "Loan from Mom" }] },
      picked: { debt: ["creditCard"] },
    });
    const { debt } = v2.buckets as Record<string, { rows: { id: string }[] }>;
    expect(debt.rows.map((row) => row.id)).toEqual(["creditCard", "c1"]);
  });

  it("skips malformed parts instead of throwing", () => {
    const v2 = v1ToV2({
      picked: { home: "rent", around: ["gas"] },
      v: "nope",
      est: { family: 3 },
      custom: { home: [null, "x"] },
    });
    expect(v2.buckets).toEqual({
      home: { rows: [] },
      around: {
        rows: [
          { id: "gas", label: "", amount: undefined, frequency: undefined },
        ],
      },
    });
  });
});
