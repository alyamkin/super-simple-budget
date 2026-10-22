import { act } from "@testing-library/react";
import { Provider } from "react-redux";
import { amountChanged, rowAdded } from "@/features/budget/budgetSlice";
import type { Locale } from "@/i18n/config";
import { hydrated } from "@/store/hydrated";
import { makeStore, type AppStore } from "@/store/makeStore";
import { renderWithI18n } from "@/test/renderWithI18n";
import { ANNOUNCE_DELAY_MS, BalanceAnnouncer } from "./BalanceAnnouncer";

/** A hydrated store with $3,000/mo income and an empty rent row. */
function setUp(locale: Locale = "en") {
  const store = makeStore();
  store.dispatch(hydrated({ budget: null, ui: {} }));
  store.dispatch(rowAdded({ itemId: "rentalIncome" }));
  store.dispatch(amountChanged({ bucket: "income", id: "rentalIncome", amount: 3000 }));
  store.dispatch(rowAdded({ itemId: "rent" }));
  const view = renderWithI18n(
    <Provider store={store}>
      <BalanceAnnouncer />
    </Provider>,
    { locale },
  );
  const region = view.container.querySelector("[aria-live]")!;
  return { store, region, ...view };
}

/** Types `amounts` into rent one keystroke at a time, 200 ms apart. */
function typeRent(store: AppStore, amounts: number[]) {
  for (const amount of amounts) {
    act(() => {
      store.dispatch(amountChanged({ bucket: "home", id: "rent", amount }));
    });
    act(() => jest.advanceTimersByTime(200));
  }
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe("BalanceAnnouncer", () => {
  it("is a polite, atomic live region, silent at first", () => {
    const { region } = setUp();
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveAttribute("aria-atomic", "true");
    expect(region).toBeEmptyDOMElement();
    act(() => jest.advanceTimersByTime(ANNOUNCE_DELAY_MS * 2));
    expect(region).toBeEmptyDOMElement();
  });

  it("announces once, 1 s after typing stops", () => {
    const { store, region } = setUp();
    const changes = new MutationObserver(() => {});
    changes.observe(region, { childList: true, characterData: true, subtree: true });

    typeRent(store, [1, 12, 120, 1200]);
    expect(region).toBeEmptyDOMElement();
    act(() => jest.advanceTimersByTime(ANNOUNCE_DELAY_MS - 201));
    expect(region).toBeEmptyDOMElement();
    act(() => jest.advanceTimersByTime(1));
    expect(region).toHaveTextContent("Left over $1,800 per month");
    act(() => jest.advanceTimersByTime(ANNOUNCE_DELAY_MS * 5));
    expect(changes.takeRecords()).toHaveLength(1);
    expect(region).toHaveTextContent("Left over $1,800 per month");
  });

  it("announces a shortfall as a positive amount", () => {
    const { store, region } = setUp();
    typeRent(store, [3500]);
    act(() => jest.advanceTimersByTime(ANNOUNCE_DELAY_MS));
    expect(region).toHaveTextContent("Shortfall $500 per month");
  });

  it("speaks French", () => {
    const { store, region } = setUp("fr");
    typeRent(store, [3500]);
    act(() => jest.advanceTimersByTime(ANNOUNCE_DELAY_MS));
    expect(region.textContent).toBe("Manque 500 $ par mois");
  });

  it("stays silent before storage is read", () => {
    const store = makeStore();
    const { container } = renderWithI18n(
      <Provider store={store}>
        <BalanceAnnouncer />
      </Provider>,
    );
    act(() => {
      store.dispatch(rowAdded({ itemId: "rentalIncome" }));
      store.dispatch(amountChanged({ bucket: "income", id: "rentalIncome", amount: 10 }));
    });
    act(() => jest.advanceTimersByTime(ANNOUNCE_DELAY_MS));
    expect(container.querySelector("[aria-live]")).toBeEmptyDOMElement();
  });

  it("leaves no timer behind when unmounted mid-typing", () => {
    const { store, unmount } = setUp();
    typeRent(store, [1, 12]);
    expect(jest.getTimerCount()).toBe(1);
    unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});
