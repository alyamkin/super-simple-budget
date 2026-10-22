/**
 * @jest-environment node
 */
import { EXAMPLE_BUDGET } from "@/domain/__fixtures__/exampleBudget";
import { emptyBudget, type Budget } from "@/domain/budget";
import {
  amountChanged,
  budgetReplaced,
  budgetSlice,
  customLabelChanged,
  customRowAdded,
  estimateAmountChanged,
  estimateFrequencyChanged,
  estimateToggled,
  frequencyChanged,
  isBudgetEdit,
  MAX_LABEL_LENGTH,
  rowAdded,
  rowRemoved,
} from "@/features/budget/budgetSlice";
import { hydrated } from "@/store/hydrated";

const { reducer } = budgetSlice;
const start = (budget: Budget = emptyBudget()) => reducer(budget, { type: "" });

describe("budget slice", () => {
  it("starts empty", () => {
    expect(reducer(undefined, { type: "" })).toEqual(emptyBudget());
  });

  describe("rowAdded", () => {
    it("adds the item to its own bucket with an empty amount and its default frequency", () => {
      const state = reducer(start(), rowAdded({ itemId: "gas" }));
      expect(state.rows.around).toEqual([
        { kind: "catalog", id: "gas", amount: null, frequency: "Weekly" },
      ]);
    });

    it("ignores an item that is already picked", () => {
      const once = reducer(start(), rowAdded({ itemId: "rent" }));
      expect(reducer(once, rowAdded({ itemId: "rent" }))).toBe(once);
    });
  });

  describe("customRowAdded", () => {
    it("adds an unnamed monthly row with a generated id", () => {
      const action = customRowAdded({ bucket: "home" });
      expect(action.payload.id).toMatch(/^c_[0-9a-z]{10}$/);
      const state = reducer(start(), action);
      expect(state.rows.home).toEqual([
        {
          kind: "custom",
          id: action.payload.id,
          label: "",
          amount: null,
          frequency: "Monthly",
        },
      ]);
    });

    it("generates a new id for every row", () => {
      const a = customRowAdded({ bucket: "home" });
      const b = customRowAdded({ bucket: "home" });
      expect(a.payload.id).not.toBe(b.payload.id);
    });
  });

  it("rowRemoved deletes the row and its amount", () => {
    const state = reducer(
      start(EXAMPLE_BUDGET),
      rowRemoved({ bucket: "home", id: "internet" }),
    );
    expect(state.rows.home.map((row) => row.id)).not.toContain("internet");
    expect(state.rows.home).toHaveLength(EXAMPLE_BUDGET.rows.home.length - 1);
  });

  describe("amountChanged", () => {
    const set = (amount: number | null) =>
      reducer(
        start(EXAMPLE_BUDGET),
        amountChanged({ bucket: "home", id: "rent", amount }),
      ).rows.home[0].amount;

    it("sets, clears and bounds the amount", () => {
      expect(set(1999.999)).toBe(2000);
      expect(set(null)).toBeNull();
      expect(set(-1)).toBe(0);
      expect(set(2e9)).toBe(999_999_999.99);
    });

    it("leaves other rows untouched (same references)", () => {
      const before = start(EXAMPLE_BUDGET);
      const after = reducer(
        before,
        amountChanged({ bucket: "home", id: "rent", amount: 1 }),
      );
      expect(after.rows.home[1]).toBe(before.rows.home[1]);
      expect(after.rows.around).toBe(before.rows.around);
    });

    it("ignores an unknown row", () => {
      const before = start(EXAMPLE_BUDGET);
      expect(
        reducer(before, amountChanged({ bucket: "home", id: "gas", amount: 1 })),
      ).toBe(before);
    });
  });

  it("frequencyChanged sets the frequency", () => {
    const state = reducer(
      start(EXAMPLE_BUDGET),
      frequencyChanged({ bucket: "around", id: "gas", frequency: "Monthly" }),
    );
    expect(state.rows.around.find((r) => r.id === "gas")?.frequency).toBe(
      "Monthly",
    );
  });

  describe("customLabelChanged", () => {
    it("names a custom row, up to 80 characters", () => {
      const add = customRowAdded({ bucket: "family" });
      const { id } = add.payload;
      let state = reducer(start(), add);
      state = reducer(
        state,
        customLabelChanged({ bucket: "family", id, label: "x".repeat(100) }),
      );
      expect(state.rows.family[0]).toMatchObject({
        label: "x".repeat(MAX_LABEL_LENGTH),
      });
    });

    it("ignores catalog rows", () => {
      const before = start(EXAMPLE_BUDGET);
      const after = reducer(
        before,
        customLabelChanged({ bucket: "home", id: "rent", label: "Flat" }),
      );
      expect(after).toBe(before);
    });
  });

  describe("estimates", () => {
    it("estimateToggled creates a monthly estimate and keeps rows", () => {
      const state = reducer(
        start(EXAMPLE_BUDGET),
        estimateToggled({ bucket: "home", enabled: true }),
      );
      expect(state.estimates.home).toEqual({
        enabled: true,
        amount: null,
        frequency: "Monthly",
      });
      expect(state.rows.home).toEqual(EXAMPLE_BUDGET.rows.home);
    });

    it("estimateToggled off keeps the amount for next time", () => {
      const state = reducer(
        start(EXAMPLE_BUDGET),
        estimateToggled({ bucket: "family", enabled: false }),
      );
      expect(state.estimates.family).toEqual({
        enabled: false,
        amount: 450,
        frequency: "Monthly",
      });
    });

    it("estimateToggled off without an estimate does nothing", () => {
      const before = start();
      expect(
        reducer(before, estimateToggled({ bucket: "home", enabled: false })),
      ).toBe(before);
    });

    it("sets the estimate's amount (bounded) and frequency", () => {
      let state = reducer(
        start(EXAMPLE_BUDGET),
        estimateAmountChanged({ bucket: "family", amount: 12.345 }),
      );
      state = reducer(
        state,
        estimateFrequencyChanged({ bucket: "family", frequency: "Annually" }),
      );
      expect(state.estimates.family).toMatchObject({
        amount: 12.35,
        frequency: "Annually",
      });
    });

    it("ignores amount changes for a bucket without an estimate", () => {
      const before = start();
      expect(
        reducer(before, estimateAmountChanged({ bucket: "home", amount: 5 })),
      ).toBe(before);
    });
  });

  it("budgetReplaced swaps the whole budget", () => {
    expect(reducer(start(), budgetReplaced(EXAMPLE_BUDGET))).toBe(
      EXAMPLE_BUDGET,
    );
  });

  describe("hydrated", () => {
    it("takes the stored budget", () => {
      expect(
        reducer(start(), hydrated({ budget: EXAMPLE_BUDGET, ui: {} })),
      ).toBe(EXAMPLE_BUDGET);
    });

    it("keeps the current budget when nothing was stored", () => {
      const state = start();
      expect(reducer(state, hydrated({ budget: null, ui: {} }))).toBe(state);
    });
  });

  describe("isBudgetEdit", () => {
    it("matches data edits, stamped with the time of the edit", () => {
      jest.spyOn(Date, "now").mockReturnValue(1234);
      const action = amountChanged({ bucket: "home", id: "rent", amount: 1 });
      expect(isBudgetEdit(action)).toBe(true);
      expect(action.meta.at).toBe(1234);
      expect(isBudgetEdit(rowAdded({ itemId: "rent" }))).toBe(true);
      expect(isBudgetEdit(customRowAdded({ bucket: "home" }))).toBe(true);
      jest.restoreAllMocks();
    });

    it("does not match budgetReplaced", () => {
      expect(isBudgetEdit(budgetReplaced(emptyBudget()))).toBe(false);
    });
  });
});
