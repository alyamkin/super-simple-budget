import { readFileSync } from "node:fs";
import { join } from "node:path";
import { EXAMPLE_BUDGET } from "@/domain/__fixtures__/exampleBudget";
import { emptyBudget } from "@/domain/budget";
import type { ItemId } from "@/domain/catalog/items";
import {
  amountChanged,
  budgetReplaced,
  rowAdded,
} from "@/features/budget/budgetSlice";
import {
  showAllChipsToggled,
  stepChanged,
  toastShown,
  viewChanged,
} from "@/features/wizard/uiSlice";
import { en } from "@/i18n/dictionaries/en";
import { makeStore, type AppStore } from "./makeStore";
import {
  LEGACY_STORAGE_KEY,
  readUi,
  SAVE_DELAY_MS,
  startPersistence,
  STORAGE_KEY,
  type PersistenceOptions,
} from "./persistence";

const options: PersistenceOptions = {
  locale: "en",
  itemLabel: (id: ItemId) => en.items[id].label,
};

const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");

let cleanups: (() => void)[] = [];

function start(store: AppStore = makeStore(), opts = options) {
  const stop = startPersistence(store, opts);
  cleanups.push(stop);
  return { store, stop };
}

beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
});

afterEach(() => {
  cleanups.forEach((stop) => stop());
  cleanups = [];
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("hydration", () => {
  it("marks the store hydrated with an empty budget when nothing is stored", () => {
    const { store } = start();
    expect(store.getState().ui.hydrated).toBe(true);
    expect(store.getState().budget).toEqual(emptyBudget());
    expect(stored()).toBeNull();
  });

  it("restores the budget and persisted ui from the previous session", () => {
    const first = start();
    first.store.dispatch(budgetReplaced(EXAMPLE_BUDGET));
    first.store.dispatch(stepChanged(3));
    first.store.dispatch(viewChanged("year"));
    first.store.dispatch(showAllChipsToggled("home"));
    first.store.dispatch(rowAdded({ itemId: "parking" }));
    first.store.dispatch(toastShown({ key: "addedTo" }));
    first.stop();

    const { store } = start();
    const { budget, ui } = store.getState();
    expect(budget.rows.around.at(-1)?.id).toBe("parking");
    expect(budget.estimates).toEqual(EXAMPLE_BUDGET.estimates);
    expect(ui).toMatchObject({
      step: 3,
      view: "year",
      showAllChips: { home: true },
      changedAt: expect.any(Number),
      toast: null,
      hydrated: true,
    });
  });

  it("writes the budget in the file format without app and savedAt", () => {
    const { store, stop } = start();
    store.dispatch(rowAdded({ itemId: "rent" }));
    stop();
    expect(stored()).toEqual({
      schema: 2,
      budget: expect.objectContaining({
        version: 2,
        minReaderVersion: 2,
        locale: "en",
        view: "month",
        buckets: expect.objectContaining({
          home: {
            rows: [{ id: "rent", label: "Rent", amount: null, frequency: "Monthly" }],
          },
        }),
      }),
      ui: {
        step: 0,
        view: "month",
        showAllChips: {},
        lastFileSaveAt: null,
        changedAt: expect.any(Number),
        noticeSnoozedUntil: null,
      },
    });
    expect(stored().budget).not.toHaveProperty("app");
    expect(stored().budget).not.toHaveProperty("savedAt");
  });

  it.each([
    ["broken JSON", "{"],
    ["another shape", JSON.stringify([1, 2])],
    ["a newer budget", JSON.stringify({ schema: 9, budget: { version: 9, minReaderVersion: 9 } })],
  ])("starts empty when the stored state is %s", (_, value) => {
    localStorage.setItem(STORAGE_KEY, value);
    const { store } = start();
    expect(store.getState().budget).toEqual(emptyBudget());
    expect(store.getState().ui.hydrated).toBe(true);
  });

  it("starts empty when storage is blocked", () => {
    const { store, stop } = start(makeStore(), {
      ...options,
      storage: () => {
        throw new DOMException("denied", "SecurityError");
      },
    });
    expect(store.getState().ui.hydrated).toBe(true);
    store.dispatch(rowAdded({ itemId: "rent" }));
    stop();
    expect(jest.getTimerCount()).toBe(0);
  });
});

describe("legacy artifact state", () => {
  const artifactFile = JSON.parse(
    readFileSync(
      join(__dirname, "../features/files/__fixtures__/v1-artifact.json"),
      "utf8",
    ),
  );
  // The artifact's `S`: the data fields of its v1 file plus its ui fields.
  const { lang, view, picked, v, est, custom } = artifactFile;
  const artifactState = {
    lang,
    view,
    picked,
    v,
    est,
    custom,
    step: 7,
    isExample: false,
    more: { home: true, nope: true },
    lastBackup: 1_700_000_000_000,
    changedAt: 1_700_000_100_000,
    snooze: null,
  };

  it("imports it once through the v1 path, then removes it", () => {
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(artifactState));
    const { store } = start();

    expect(store.getState().budget).toEqual(EXAMPLE_BUDGET);
    expect(store.getState().ui).toMatchObject({
      step: 7,
      showAllChips: { home: true },
      lastFileSaveAt: 1_700_000_000_000,
      changedAt: 1_700_000_100_000,
      noticeSnoozedUntil: null,
    });
    expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
    expect(stored().budget.buckets.family.estimate).toEqual({
      enabled: true,
      amount: 450,
      frequency: "Monthly",
    });
  });

  it("ignores the artifact's demo budget", () => {
    localStorage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify({ ...artifactState, isExample: true }),
    );
    const { store } = start();
    expect(store.getState().budget).toEqual(emptyBudget());
    expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
    expect(stored()).toBeNull();
  });

  it("prefers the current key when both exist", () => {
    const first = start();
    first.store.dispatch(rowAdded({ itemId: "rent" }));
    first.stop();
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(artifactState));

    const { store } = start();
    expect(store.getState().budget.rows.home.map((row) => row.id)).toEqual(["rent"]);
    expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });
});

describe("writes", () => {
  it(`are debounced by ${SAVE_DELAY_MS} ms`, () => {
    const setItem = jest.spyOn(Storage.prototype, "setItem");
    const { store } = start();
    store.dispatch(rowAdded({ itemId: "rent" }));
    jest.advanceTimersByTime(SAVE_DELAY_MS - 100);
    store.dispatch(amountChanged({ bucket: "home", id: "rent", amount: 1500 }));
    jest.advanceTimersByTime(SAVE_DELAY_MS - 1);
    expect(setItem).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(stored().budget.buckets.home.rows[0].amount).toBe(1500);
    expect(jest.getTimerCount()).toBe(0);
  });

  it("skip changes to transient ui state", () => {
    const { store } = start();
    store.dispatch(toastShown({ key: "addedTo" }));
    expect(jest.getTimerCount()).toBe(0);
  });

  it("are flushed when the page is hidden", () => {
    const { store } = start();
    const visibility = jest.spyOn(document, "visibilityState", "get");

    store.dispatch(rowAdded({ itemId: "rent" }));
    visibility.mockReturnValue("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(stored()).toBeNull();

    visibility.mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(stored().budget.buckets.home.rows).toHaveLength(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it("are flushed on pagehide", () => {
    const { store } = start();
    store.dispatch(rowAdded({ itemId: "rent" }));
    window.dispatchEvent(new Event("pagehide"));
    expect(stored().budget.buckets.home.rows).toHaveLength(1);
  });

  it("are flushed by the cleanup, which then stops listening", () => {
    const { store, stop } = start();
    store.dispatch(rowAdded({ itemId: "rent" }));
    stop();
    expect(stored().budget.buckets.home.rows).toHaveLength(1);

    store.dispatch(rowAdded({ itemId: "gas" }));
    window.dispatchEvent(new Event("pagehide"));
    jest.runAllTimers();
    expect(stored().budget.buckets.around.rows).toHaveLength(0);
    expect(jest.getTimerCount()).toBe(0);
  });

  it("survive a full storage", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    const { store } = start();
    store.dispatch(rowAdded({ itemId: "rent" }));
    expect(() => jest.runAllTimers()).not.toThrow();
  });
});

describe("readUi", () => {
  it("keeps valid fields and repairs the rest", () => {
    expect(
      readUi({
        step: 42.7,
        view: "decade",
        showAllChips: { home: true, debt: false, nope: true },
        lastFileSaveAt: "yesterday",
        changedAt: 5,
        noticeSnoozedUntil: Infinity,
      }),
    ).toEqual({
      step: 7,
      view: "month",
      showAllChips: { home: true },
      lastFileSaveAt: null,
      changedAt: 5,
      noticeSnoozedUntil: null,
    });
  });

  it("returns nothing for anything but an object", () => {
    expect(readUi("ui")).toEqual({});
  });
});
