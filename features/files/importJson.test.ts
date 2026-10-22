/**
 * @jest-environment node
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { EXAMPLE_BUDGET } from "@/domain/__fixtures__/exampleBudget";
import { CUSTOM_ID_PATTERN } from "@/lib/customId";
import { parseBudgetFile, readBudgetData, readBudgetFile } from "./importJson";
import { MAX_FILE_BYTES } from "./schema";

/** Golden fixtures are append-only: never edit one, add a new file instead. */
const fixture = (name: string) =>
  readFileSync(join(__dirname, "__fixtures__", name), "utf8");

const customIdLike = expect.stringMatching(CUSTOM_ID_PATTERN);

describe("parseBudgetFile", () => {
  it("opens the artifact's v1 export of the example as the example budget", () => {
    expect(parseBudgetFile(fixture("v1-artifact.json"))).toEqual({
      ok: true,
      budget: EXAMPLE_BUDGET,
      view: "month",
    });
  });

  it("opens a full v2 file", () => {
    const result = parseBudgetFile(fixture("v2-full.json"));
    if (!result.ok) throw new Error(result.error);
    const { rows, estimates } = result.budget;

    expect(result.view).toBe("year");
    expect(rows.income).toEqual([
      { kind: "catalog", id: "myNetIncome", amount: 2150, frequency: "Every2Weeks" },
      { kind: "catalog", id: "spouseNetIncome", amount: 1850, frequency: "Every2Weeks" },
      { kind: "custom", id: "c_k3j9x0aa1b", label: "Tutorat", amount: 200, frequency: "Monthly" },
    ]);
    expect(rows.savings[1]).toEqual({
      kind: "catalog",
      id: "tfsa",
      amount: null,
      frequency: "Monthly",
    });
    expect(rows.debt).toEqual([
      { kind: "catalog", id: "creditCard", amount: 0, frequency: "Monthly" },
    ]);
    expect(estimates).toEqual({
      home: { enabled: false, amount: 2600, frequency: "Monthly" },
      family: { enabled: true, amount: 900, frequency: "Monthly" },
    });
    expect(Object.values(rows).flat()).toHaveLength(15);
  });

  it("repairs unknown ids, buckets and values", () => {
    const result = parseBudgetFile(fixture("v2-unknown-ids.json"));
    if (!result.ok) throw new Error(result.error);
    const { rows, estimates } = result.budget;

    expect(result.view).toBe("month");
    expect(rows.income).toEqual([
      { kind: "catalog", id: "myNetIncome", amount: 3000.46, frequency: "Every2Weeks" },
    ]);
    expect(rows.home).toEqual([
      { kind: "catalog", id: "rent", amount: 2000, frequency: "Monthly" },
      { kind: "custom", id: customIdLike, label: "Hoverboard lease", amount: 99, frequency: "Monthly" },
      { kind: "custom", id: customIdLike, label: "", amount: 5, frequency: "Monthly" },
      { kind: "custom", id: customIdLike, label: "Window cleaning", amount: 30, frequency: "Monthly" },
      { kind: "custom", id: "c_kq2x9", label: "Snow removal", amount: 120.5, frequency: "TwiceMonthly" },
      { kind: "catalog", id: "electricity", amount: null, frequency: "Monthly" },
      { kind: "catalog", id: "internet", amount: null, frequency: "Monthly" },
      { kind: "catalog", id: "telephone", amount: null, frequency: "Monthly" },
    ]);
    expect(rows.everyday).toEqual([
      { kind: "catalog", id: "groceries", amount: 150, frequency: "Weekly" },
    ]);
    expect(rows.family).toEqual([
      { kind: "catalog", id: "petFood", amount: 80, frequency: "Monthly" },
    ]);
    expect(rows.debt).toEqual([]);
    expect(estimates).toEqual({
      home: { enabled: false, amount: 2500, frequency: "Monthly" },
    });
  });

  it("refuses a file from a newer version that old readers cannot read", () => {
    expect(parseBudgetFile(fixture("v2-future-version.json"))).toEqual({
      ok: false,
      error: "newerVersion",
    });
  });

  it("refuses text that is not JSON", () => {
    expect(parseBudgetFile(fixture("garbage.json"))).toEqual({
      ok: false,
      error: "notBudgetFile",
    });
  });

  it("refuses text over 1 MB before parsing it", () => {
    const parse = jest.spyOn(JSON, "parse");
    expect(parseBudgetFile(" ".repeat(MAX_FILE_BYTES + 1))).toEqual({
      ok: false,
      error: "tooLarge",
    });
    expect(parse).not.toHaveBeenCalled();
    parse.mockRestore();
  });
});

describe("readBudgetFile", () => {
  it("reads a chosen file", async () => {
    const file = new Blob([fixture("v1-artifact.json")]);
    await expect(readBudgetFile(file)).resolves.toEqual({
      ok: true,
      budget: EXAMPLE_BUDGET,
      view: "month",
    });
  });

  it("refuses a file over 1 MB without reading it", async () => {
    const file = new Blob([" ".repeat(MAX_FILE_BYTES + 1)]);
    const text = jest.spyOn(file, "text");
    await expect(readBudgetFile(file)).resolves.toEqual({
      ok: false,
      error: "tooLarge",
    });
    expect(text).not.toHaveBeenCalled();
  });

  it("reports a file that can't be read", async () => {
    const file = new Blob(["{}"]);
    jest.spyOn(file, "text").mockRejectedValue(new Error("gone"));
    await expect(readBudgetFile(file)).resolves.toEqual({
      ok: false,
      error: "notBudgetFile",
    });
  });
});

describe("readBudgetData", () => {
  const file = (fields: Record<string, unknown>) => ({
    app: "super-simple-budget",
    version: 2,
    minReaderVersion: 2,
    buckets: { home: { rows: [{ id: "rent", amount: 1 }] } },
    ...fields,
  });

  it.each([null, [], "file", { version: 2 }, file({ app: "other-app" })])(
    "refuses %p as not a budget file",
    (data) => {
      expect(readBudgetData(data)).toEqual({ ok: false, error: "notBudgetFile" });
    },
  );

  it.each([undefined, "2", 0, 1.5])("refuses version %p", (version) => {
    expect(readBudgetData(file({ version }))).toEqual({
      ok: false,
      error: "notBudgetFile",
    });
  });

  it("reads a newer file that still declares this version as its minimum reader", () => {
    const result = readBudgetData(file({ version: 3, minReaderVersion: 2, extra: 1 }));
    expect(result).toMatchObject({ ok: true });
    if (result.ok) expect(result.budget.rows.home).toHaveLength(1);
  });

  it("refuses a newer file without a minimum reader version", () => {
    expect(readBudgetData(file({ version: 3, minReaderVersion: undefined }))).toEqual({
      ok: false,
      error: "newerVersion",
    });
  });
});
