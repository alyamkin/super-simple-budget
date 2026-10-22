import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { rowAdded } from "@/features/budget/budgetSlice";
import { selectPickedCount } from "@/features/budget/selectors";
import { en } from "@/i18n/dictionaries/en";
import { I18nProvider } from "@/i18n/I18nProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { STORAGE_KEY } from "@/store/persistence";
import { StoreProvider } from "@/store/StoreProvider";

function Probe() {
  const count = useAppSelector((state) => selectPickedCount(state, "home"));
  const hydrated = useAppSelector((state) => state.ui.hydrated);
  const dispatch = useAppDispatch();
  return (
    <button
      aria-busy={!hydrated}
      onClick={() => dispatch(rowAdded({ itemId: "rent" }))}
    >
      {count} picked
    </button>
  );
}

const withStore = (children: ReactNode) => (
  <I18nProvider locale="en" dictionary={en}>
    {children}
  </I18nProvider>
);

const renderProbe = () =>
  render(
    withStore(
      <StoreProvider>
        <Probe />
      </StoreProvider>,
    ),
  );

beforeEach(() => localStorage.clear());

describe("StoreProvider", () => {
  it("provides a store that starts empty and is hydrated after mount", async () => {
    renderProbe();
    const button = screen.getByRole("button", { name: "0 picked" });
    expect(button).toHaveAttribute("aria-busy", "false");
    await userEvent.click(button);
    expect(button).toHaveTextContent("1 picked");
  });

  it("gives every provider its own store", async () => {
    render(
      withStore(
        <>
          <StoreProvider>
            <Probe />
          </StoreProvider>
          <StoreProvider>
            <Probe />
          </StoreProvider>
        </>,
      ),
    );
    const [first, second] = screen.getAllByRole("button");
    await userEvent.click(first);
    expect(first).toHaveTextContent("1 picked");
    expect(second).toHaveTextContent("0 picked");
  });

  it("restores the budget saved by a previous mount", async () => {
    const { unmount } = renderProbe();
    await userEvent.click(screen.getByRole("button"));
    unmount();
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    renderProbe();
    expect(screen.getByRole("button")).toHaveTextContent("1 picked");
  });

  it("leaves no listeners or timers behind after 50 mounts", () => {
    jest.useFakeTimers();
    const spies = [window, document].map((target) =>
      jest.spyOn(target, "addEventListener"),
    );

    for (let i = 0; i < 50; i++) {
      const { unmount } = renderProbe();
      act(() => screen.getByRole("button").click());
      unmount();
    }

    // Every listener is added with a signal, and every signal was aborted.
    const signals = spies
      .flatMap((spy) => spy.mock.calls)
      .map(([, , options]) =>
        typeof options === "object" ? options.signal : undefined,
      );
    expect(signals.length).toBeGreaterThanOrEqual(100);
    expect(signals.every((signal) => signal?.aborted)).toBe(true);
    expect(jest.getTimerCount()).toBe(0);
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
});
