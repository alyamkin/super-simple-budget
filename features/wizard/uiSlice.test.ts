/**
 * @jest-environment node
 */
import { emptyBudget } from "@/domain/budget";
import {
  amountChanged,
  budgetReplaced,
  rowAdded,
} from "@/features/budget/budgetSlice";
import {
  fileOpened,
  fileSaved,
  NOTICE_SNOOZE_MS,
  noticeSnoozed,
  showAllChipsToggled,
  stepChanged,
  toastDismissed,
  toastShown,
  uiSlice,
  viewChanged,
  type UiState,
} from "@/features/wizard/uiSlice";
import { hydrated } from "@/store/hydrated";
import { makeStore } from "@/store/makeStore";

const { reducer } = uiSlice;
const initial = (): UiState => reducer(undefined, { type: "" });

afterEach(() => jest.restoreAllMocks());

describe("ui slice", () => {
  it("starts on step 1, monthly, with nothing unsaved", () => {
    expect(initial()).toEqual({
      step: 0,
      view: "month",
      showAllChips: {},
      lastFileSaveAt: null,
      changedAt: null,
      noticeSnoozedUntil: null,
      toast: null,
      hydrated: false,
    });
  });

  it("stepChanged clamps to an existing step", () => {
    expect(reducer(initial(), stepChanged(3)).step).toBe(3);
    expect(reducer(initial(), stepChanged(7)).step).toBe(7);
    expect(reducer(initial(), stepChanged(8)).step).toBe(7);
    expect(reducer(initial(), stepChanged(-1)).step).toBe(0);
    expect(reducer(initial(), stepChanged(2.7)).step).toBe(2);
    expect(reducer(initial(), stepChanged(NaN)).step).toBe(0);
  });

  it("viewChanged switches between monthly and yearly", () => {
    expect(reducer(initial(), viewChanged("year")).view).toBe("year");
  });

  it("showAllChipsToggled flips one bucket", () => {
    const once = reducer(initial(), showAllChipsToggled("home"));
    expect(once.showAllChips).toEqual({ home: true });
    expect(reducer(once, showAllChipsToggled("home")).showAllChips).toEqual({
      home: false,
    });
  });

  it("fileSaved records the time and clears changedAt", () => {
    jest.spyOn(Date, "now").mockReturnValue(500);
    const state = reducer(
      { ...initial(), changedAt: 100 },
      fileSaved(),
    );
    expect(state.lastFileSaveAt).toBe(500);
    expect(state.changedAt).toBeNull();
  });

  it("fileOpened shows the file's view and clears changedAt", () => {
    const state = reducer(
      { ...initial(), changedAt: 100, lastFileSaveAt: 50 },
      fileOpened("year"),
    );
    expect(state.view).toBe("year");
    expect(state.changedAt).toBeNull();
    expect(state.lastFileSaveAt).toBe(50);
  });

  it("noticeSnoozed hides the notice for an hour", () => {
    jest.spyOn(Date, "now").mockReturnValue(1000);
    expect(reducer(initial(), noticeSnoozed()).noticeSnoozedUntil).toBe(
      1000 + NOTICE_SNOOZE_MS,
    );
  });

  describe("toasts", () => {
    it("toastShown replaces the toast with a new id", () => {
      const first = reducer(
        initial(),
        toastShown({ key: "addedTo", params: { bucket: "buckets.home.title" } }),
      );
      const second = reducer(
        first,
        toastShown({ key: "addedTo", params: { bucket: "buckets.debt.title" } }),
      );
      expect(first.toast).toEqual({
        id: 1,
        key: "addedTo",
        params: { bucket: "buckets.home.title" },
      });
      expect(second.toast).toEqual({
        id: 2,
        key: "addedTo",
        params: { bucket: "buckets.debt.title" },
      });
    });

    it("toastDismissed hides only the toast it was set for", () => {
      const state = reducer(
        reducer(initial(), toastShown({ key: "addedTo" })),
        toastShown({ key: "addedTo" }),
      );
      expect(reducer(state, toastDismissed(1)).toast?.id).toBe(2);
      expect(reducer(state, toastDismissed(2)).toast).toBeNull();
    });
  });

  describe("changedAt", () => {
    it("is set by the first budget edit and kept by later ones", () => {
      const now = jest.spyOn(Date, "now").mockReturnValue(10);
      const first = reducer(initial(), rowAdded({ itemId: "rent" }));
      now.mockReturnValue(20);
      const second = reducer(
        first,
        amountChanged({ bucket: "home", id: "rent", amount: 5 }),
      );
      expect(first.changedAt).toBe(10);
      expect(second.changedAt).toBe(10);
    });

    it("is not set by budgetReplaced", () => {
      expect(
        reducer(initial(), budgetReplaced(emptyBudget())).changedAt,
      ).toBeNull();
    });
  });

  describe("hydrated", () => {
    it("restores the stored fields and marks the state hydrated", () => {
      const state = reducer(
        reducer(initial(), toastShown({ key: "addedTo" })),
        hydrated({ budget: null, ui: { step: 4, view: "year", changedAt: 9 } }),
      );
      expect(state).toMatchObject({
        step: 4,
        view: "year",
        changedAt: 9,
        lastFileSaveAt: null,
        hydrated: true,
      });
      expect(state.toast?.key).toBe("addedTo");
    });

    it("is not a budget edit", () => {
      expect(
        reducer(initial(), hydrated({ budget: emptyBudget(), ui: {} }))
          .changedAt,
      ).toBeNull();
    });
  });
});

describe("ui selectors", () => {
  const { selectIsNoticeShown, selectIsUnsaved, selectStepId } =
    uiSlice.selectors;

  it("selectStepId names the current step", () => {
    const store = makeStore();
    expect(selectStepId(store.getState())).toBe("income");
    store.dispatch(stepChanged(7));
    expect(selectStepId(store.getState())).toBe("results");
  });

  it("the notice shows while unsaved and not snoozed", () => {
    const store = makeStore();
    jest.spyOn(Date, "now").mockReturnValue(0);
    expect(selectIsNoticeShown(store.getState(), 0)).toBe(false);

    store.dispatch(rowAdded({ itemId: "rent" }));
    expect(selectIsUnsaved(store.getState())).toBe(true);
    expect(selectIsNoticeShown(store.getState(), 0)).toBe(true);

    store.dispatch(noticeSnoozed());
    expect(selectIsNoticeShown(store.getState(), NOTICE_SNOOZE_MS - 1)).toBe(
      false,
    );
    expect(selectIsNoticeShown(store.getState(), NOTICE_SNOOZE_MS)).toBe(true);

    store.dispatch(fileSaved());
    expect(selectIsUnsaved(store.getState())).toBe(false);
    expect(selectIsNoticeShown(store.getState(), NOTICE_SNOOZE_MS)).toBe(false);
  });
});
