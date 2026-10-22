/**
 * @jest-environment node
 */
import { EXAMPLE_BUDGET } from "@/domain/__fixtures__/exampleBudget";
import {
  computeChecks,
  headline,
  nextSteps,
  roughBuckets,
  topExpenses,
} from "@/domain/results";
import { computeTotals } from "@/domain/totals";
import {
  amountChanged,
  budgetReplaced,
  customLabelChanged,
  customRowAdded,
  estimateToggled,
  frequencyChanged,
  rowAdded,
  rowRemoved,
} from "@/features/budget/budgetSlice";
import {
  selectBalance,
  selectBucketTotal,
  selectChecks,
  selectChips,
  selectFlaggedChecks,
  selectHeadline,
  selectIncome,
  selectNextSteps,
  selectPickedItemIds,
  selectRoughBuckets,
  selectRow,
  selectRowIds,
  selectSavingsRate,
  selectTopExpenses,
  selectTotals,
} from "@/features/budget/selectors";
import { stepChanged } from "@/features/wizard/uiSlice";
import { makeStore } from "@/store/makeStore";

const exampleStore = () => {
  const store = makeStore();
  store.dispatch(budgetReplaced(EXAMPLE_BUDGET));
  return store;
};

describe("totals selectors", () => {
  it("equal the domain results", () => {
    const state = exampleStore().getState();
    const totals = computeTotals(EXAMPLE_BUDGET);
    const checks = computeChecks(EXAMPLE_BUDGET, totals);
    expect(selectTotals(state)).toEqual(totals);
    expect(selectIncome(state)).toBe(totals.income);
    expect(selectBalance(state)).toBe(totals.balance);
    expect(selectBucketTotal(state, "income")).toBe(totals.income);
    expect(selectBucketTotal(state, "family")).toBe(450);
    expect(selectChecks(state)).toEqual(checks);
    expect(selectFlaggedChecks(state)).toEqual(
      checks.filter((c) => c.level !== "green"),
    );
    expect(selectHeadline(state)).toEqual(headline(totals));
    expect(selectTopExpenses(state)).toEqual(topExpenses(EXAMPLE_BUDGET));
    expect(selectRoughBuckets(state)).toEqual(roughBuckets(EXAMPLE_BUDGET));
    expect(selectNextSteps(state)).toEqual(
      nextSteps(EXAMPLE_BUDGET, totals, checks),
    );
  });

  it("rate savings against income", () => {
    const state = exampleStore().getState();
    expect(selectSavingsRate(state)).toEqual({
      level: "green",
      share: 600 / selectIncome(state),
    });
  });

  it("return the same reference for the same budget", () => {
    const store = exampleStore();
    const before = store.getState();
    store.dispatch(stepChanged(3));
    const after = store.getState();
    expect(after).not.toBe(before);
    for (const select of [
      selectTotals,
      selectChecks,
      selectHeadline,
      selectTopExpenses,
      selectNextSteps,
      selectSavingsRate,
    ]) {
      expect(select(after)).toBe(select(before));
    }
  });

  it("recompute once the budget changes", () => {
    const store = exampleStore();
    const before = selectTotals(store.getState());
    store.dispatch(amountChanged({ bucket: "home", id: "rent", amount: 2400 }));
    const after = selectTotals(store.getState());
    expect(after).not.toBe(before);
    expect(after.byBucket.home).toBeCloseTo(before.byBucket.home + 50);
  });
});

describe("stable results while typing", () => {
  it("keep row ids, picks and chips while amounts, frequencies and labels change", () => {
    const store = exampleStore();
    const custom = customRowAdded({ bucket: "home" });
    store.dispatch(custom);
    const before = store.getState();

    store.dispatch(amountChanged({ bucket: "home", id: "rent", amount: 1 }));
    store.dispatch(
      frequencyChanged({ bucket: "home", id: "rent", frequency: "Weekly" }),
    );
    store.dispatch(
      customLabelChanged({ bucket: "home", id: custom.payload.id, label: "x" }),
    );
    const after = store.getState();

    expect(after.budget.rows.home).not.toBe(before.budget.rows.home);
    expect(selectRowIds(after, "home")).toBe(selectRowIds(before, "home"));
    expect(selectPickedItemIds(after)).toBe(selectPickedItemIds(before));
    expect(selectChips(after, "home")).toBe(selectChips(before, "home"));
    expect(selectChips(after, "around")).toBe(selectChips(before, "around"));
  });

  it("keep each bucket's cache when buckets are read alternately", () => {
    const state = exampleStore().getState();
    const home = selectRowIds(state, "home");
    const around = selectRowIds(state, "around");
    expect(selectRowIds(state, "home")).toBe(home);
    expect(selectRowIds(state, "around")).toBe(around);
  });

  it("keep the headline while the balance is unchanged", () => {
    const store = exampleStore();
    const before = selectHeadline(store.getState());
    // Same monthly amount, different frequency: 2350/mo = 28200/yr.
    store.dispatch(amountChanged({ bucket: "home", id: "rent", amount: 28200 }));
    store.dispatch(
      frequencyChanged({ bucket: "home", id: "rent", frequency: "Annually" }),
    );
    expect(selectHeadline(store.getState())).toBe(before);
  });

  it("keep the rough buckets until an estimate is toggled", () => {
    const store = exampleStore();
    const before = selectRoughBuckets(store.getState());
    store.dispatch(amountChanged({ bucket: "home", id: "rent", amount: 1 }));
    expect(selectRoughBuckets(store.getState())).toBe(before);
    store.dispatch(estimateToggled({ bucket: "home", enabled: true }));
    expect(selectRoughBuckets(store.getState())).toEqual(["home", "family"]);
  });
});

describe("row and chip selectors", () => {
  it("selectRow finds a row by bucket and id", () => {
    const state = exampleStore().getState();
    expect(selectRow(state, "around", "gas")).toEqual({
      kind: "catalog",
      id: "gas",
      amount: 60,
      frequency: "Weekly",
    });
    expect(selectRow(state, "home", "gas")).toBeUndefined();
  });

  it("selectRowIds lists ids in display order", () => {
    const state = exampleStore().getState();
    expect(selectRowIds(state, "debt")).toEqual(["creditCard", "studentLoan"]);
  });

  it("selectChips leaves out picked items and splits popular from the rest", () => {
    const store = makeStore();
    const { popular, more } = selectChips(store.getState(), "debt");
    expect(popular).toEqual([
      "creditCard",
      "lineOfCredit",
      "studentLoan",
      "personalLoan",
    ]);
    expect(more).not.toEqual(expect.arrayContaining(popular));

    store.dispatch(rowAdded({ itemId: "studentLoan" }));
    expect(selectChips(store.getState(), "debt").popular).toEqual([
      "creditCard",
      "lineOfCredit",
      "personalLoan",
    ]);
    expect(selectPickedItemIds(store.getState())).toEqual(
      new Set(["studentLoan"]),
    );

    store.dispatch(rowRemoved({ bucket: "debt", id: "studentLoan" }));
    expect(selectChips(store.getState(), "debt").popular).toContain(
      "studentLoan",
    );
  });
});
