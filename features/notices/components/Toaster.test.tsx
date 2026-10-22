import { act, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Provider } from "react-redux";
import { toastShown } from "@/features/wizard/uiSlice";
import type { Locale } from "@/i18n/config";
import { makeStore } from "@/store/makeStore";
import { renderWithI18n } from "@/test/renderWithI18n";
import { TOAST_MS, Toaster } from "./Toaster";

function renderToaster(locale: Locale = "en") {
  const store = makeStore();
  const view = renderWithI18n(
    <Provider store={store}>
      <Toaster />
    </Provider>,
    { locale },
  );
  const show = (bucket: "home" | "debt") =>
    act(() => {
      store.dispatch(
        toastShown({ key: "addedTo", params: { bucket: `buckets.${bucket}.title` } }),
      );
    });
  return { store, show, ...view };
}

describe("Toaster", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("keeps an empty live region in the DOM", () => {
    renderToaster();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("shows the message, then hides it after 2.4 s", () => {
    const { show, store } = renderToaster();
    show("home");
    expect(screen.getByRole("status")).toHaveTextContent("Added to Home and bills");

    act(() => jest.advanceTimersByTime(TOAST_MS - 1));
    expect(screen.getByRole("status")).toHaveTextContent("Added to Home and bills");
    act(() => jest.advanceTimersByTime(1));
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(store.getState().ui.toast).toBeNull();
  });

  it("replaces the message and restarts the timer", () => {
    const { show } = renderToaster();
    show("home");
    act(() => jest.advanceTimersByTime(2000));
    show("debt");
    expect(screen.getByRole("status")).toHaveTextContent("Added to Debt payments");

    act(() => jest.advanceTimersByTime(2000));
    expect(screen.getByRole("status")).toHaveTextContent("Added to Debt payments");
    act(() => jest.advanceTimersByTime(TOAST_MS - 2000));
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("translates the message and its params", () => {
    const { show } = renderToaster("fr");
    show("home");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Ajouté à l’étape « Maison et factures »",
    );
  });

  it("leaves no timer behind when unmounted", () => {
    const { show, unmount } = renderToaster();
    show("home");
    expect(jest.getTimerCount()).toBe(1);
    unmount();
    expect(jest.getTimerCount()).toBe(0);
  });

  it("has no axe violations", async () => {
    jest.useRealTimers();
    const { show, container } = renderToaster();
    show("home");
    expect(await axe(container)).toHaveNoViolations();
  });
});
