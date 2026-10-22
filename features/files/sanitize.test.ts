/**
 * @jest-environment node
 */
import { CUSTOM_ID_PATTERN } from "@/lib/customId";
import {
  MAX_ROWS_PER_BUCKET,
  sanitizeAmount,
  sanitizeBuckets,
  sanitizeFrequency,
  sanitizeLabel,
  sanitizeView,
} from "./sanitize";

const customIdLike = expect.stringMatching(CUSTOM_ID_PATTERN);

describe("sanitizeAmount", () => {
  it.each([
    [0, 0],
    [12.345, 12.35],
    [999_999_999.99, 999_999_999.99],
    ["1234.5", 1234.5],
    [" 80 ", 80],
  ])("keeps %p as %p", (value, expected) => {
    expect(sanitizeAmount(value)).toBe(expected);
  });

  it.each([null, undefined, "", "  ", "abc", -0.01, 1e9, 999_999_999.999, NaN, Infinity, true, {}])(
    "turns %p into an empty field",
    (value) => {
      expect(sanitizeAmount(value)).toBeNull();
    },
  );
});

describe("sanitizeFrequency", () => {
  it("keeps known frequencies", () => {
    expect(sanitizeFrequency("Quarterly")).toBe("Quarterly");
  });

  it("renames the legacy SemiMonthly", () => {
    expect(sanitizeFrequency("SemiMonthly")).toBe("TwiceMonthly");
  });

  it("falls back for unknown values", () => {
    expect(sanitizeFrequency("Fortnightly")).toBe("Monthly");
    expect(sanitizeFrequency(12, "Weekly")).toBe("Weekly");
    expect(sanitizeFrequency("toString")).toBe("Monthly");
  });
});

describe("sanitizeLabel", () => {
  it("trims and caps at 80 characters", () => {
    expect(sanitizeLabel("  Tutoring  ")).toBe("Tutoring");
    expect(sanitizeLabel("x".repeat(100))).toHaveLength(80);
  });

  it("turns non-strings into an empty label", () => {
    expect(sanitizeLabel(42)).toBe("");
  });
});

describe("sanitizeView", () => {
  it("accepts year, else month", () => {
    expect(sanitizeView("year")).toBe("year");
    expect(sanitizeView("month")).toBe("month");
    expect(sanitizeView("week")).toBe("month");
  });
});

describe("sanitizeBuckets", () => {
  const rowsOf = (buckets: unknown) => sanitizeBuckets(buckets).rows;

  it("returns an empty budget for anything but an object", () => {
    for (const value of [null, [], "buckets", 3]) {
      expect(sanitizeBuckets(value)).toEqual({
        rows: expect.objectContaining({ income: [], debt: [] }),
        estimates: {},
      });
    }
  });

  it("moves a catalog item in the wrong bucket to its own bucket", () => {
    const rows = rowsOf({
      home: { rows: [{ id: "groceries", amount: 150, frequency: "Weekly" }] },
    });
    expect(rows.home).toEqual([]);
    expect(rows.everyday).toEqual([
      { kind: "catalog", id: "groceries", amount: 150, frequency: "Weekly" },
    ]);
  });

  it("moves catalog rows out of an unknown bucket and drops its custom rows", () => {
    const rows = rowsOf({
      pets: {
        rows: [
          { id: "petFood", amount: 80, frequency: "Monthly" },
          { id: "c_aaaaaaaaaa", custom: true, label: "Sitter", amount: 1 },
        ],
      },
    });
    expect(rows.family).toEqual([
      { kind: "catalog", id: "petFood", amount: 80, frequency: "Monthly" },
    ]);
    expect(Object.values(rows).flat()).toHaveLength(1);
  });

  it("turns an unknown id into a custom row with the file's label", () => {
    const rows = rowsOf({
      home: {
        rows: [{ id: "hoverboard", label: " Hoverboard ", amount: 9, frequency: "Weekly" }],
      },
    });
    expect(rows.home).toEqual([
      {
        kind: "custom",
        id: customIdLike,
        label: "Hoverboard",
        amount: 9,
        frequency: "Weekly",
      },
    ]);
  });

  it("replaces retired ids, or makes them custom rows when there is no replacement", () => {
    const { rows } = sanitizeBuckets(
      {
        home: {
          rows: [
            { id: "landline", label: "Landline", amount: 30, frequency: "Monthly" },
            { id: "fax", label: "Fax", amount: 5, frequency: "Monthly" },
          ],
        },
      },
      { retired: { landline: "telephone", fax: null } },
    );
    expect(rows.home).toEqual([
      { kind: "catalog", id: "telephone", amount: 30, frequency: "Monthly" },
      { kind: "custom", id: customIdLike, label: "Fax", amount: 5, frequency: "Monthly" },
    ]);
  });

  it("keeps the first of duplicate ids, across buckets too", () => {
    const rows = rowsOf({
      home: {
        rows: [
          { id: "rent", amount: 1 },
          { id: "rent", amount: 2 },
          { id: "c_abc", custom: true, label: "A", amount: 3 },
        ],
      },
      around: {
        rows: [{ id: "c_abc", custom: true, label: "B", amount: 4 }],
      },
    });
    expect(rows.home.map((row) => row.amount)).toEqual([1, 3]);
    expect(rows.around).toEqual([]);
  });

  it(`keeps at most ${MAX_ROWS_PER_BUCKET} rows per bucket`, () => {
    const many = Array.from({ length: MAX_ROWS_PER_BUCKET + 5 }, (_, i) => ({
      id: `c_${i.toString(36)}`,
      custom: true,
      label: `Row ${i}`,
    }));
    expect(rowsOf({ home: { rows: many } }).home).toHaveLength(MAX_ROWS_PER_BUCKET);
  });

  it("converts artifact custom ids to v2 and replaces invalid ones", () => {
    const rows = rowsOf({
      home: {
        rows: [
          { id: "ckq2x9", custom: true, label: "Artifact" },
          { id: "c_k3j9x0aa1b", custom: true, label: "Current" },
          { id: "C_UPPER", custom: true, label: "Bad" },
          { id: "c_" + "a".repeat(17), custom: true, label: "Too long" },
          { custom: true, label: "Missing" },
        ],
      },
    });
    const [artifact, current, ...replaced] = rows.home;
    expect(artifact.id).toBe("c_kq2x9");
    expect(current.id).toBe("c_k3j9x0aa1b");
    expect(replaced.map((row) => row.id)).toEqual([
      customIdLike,
      customIdLike,
      customIdLike,
    ]);
  });

  it("defaults unknown frequencies to the item's default, or Monthly for custom rows", () => {
    const rows = rowsOf({
      income: {
        rows: [
          { id: "myNetIncome", amount: 1, frequency: "Hourly" },
          { id: "c_x", custom: true, label: "Gig", amount: 1, frequency: "Hourly" },
        ],
      },
    });
    expect(rows.income.map((row) => row.frequency)).toEqual(["Every2Weeks", "Monthly"]);
  });

  it("keeps estimates only for estimable buckets", () => {
    const { estimates } = sanitizeBuckets({
      income: { rows: [], estimate: { enabled: true, amount: 1 } },
      debt: { rows: [], estimate: { enabled: true, amount: 1 } },
      family: { estimate: { enabled: true, amount: "450", frequency: "Monthly" } },
      home: { estimate: { enabled: "yes", amount: -1, frequency: "Nope" } },
      around: { estimate: "on" },
    });
    expect(estimates).toEqual({
      family: { enabled: true, amount: 450, frequency: "Monthly" },
      home: { enabled: false, amount: null, frequency: "Monthly" },
    });
  });

  it("ignores rows that are not objects", () => {
    expect(rowsOf({ home: { rows: [null, "rent", 3, ["rent"]] } }).home).toEqual([]);
    expect(rowsOf({ home: { rows: "rent" } }).home).toEqual([]);
  });
});
