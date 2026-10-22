import { act, renderHook } from "@testing-library/react";
import { usePrefetchResults } from "./LazyResultsView";

const mockLoaded = jest.fn();
jest.mock("./ResultsView", () => {
  mockLoaded();
  return { ResultsView: () => null };
});

beforeEach(() => {
  jest.useFakeTimers();
  mockLoaded.mockClear();
});
afterEach(() => jest.useRealTimers());

describe("usePrefetchResults", () => {
  it("does nothing while not asked to", () => {
    renderHook(() => usePrefetchResults(false));
    act(() => jest.runAllTimers());
    expect(mockLoaded).not.toHaveBeenCalled();
  });

  it("fetches the results view when idle", async () => {
    renderHook(() => usePrefetchResults(true));
    expect(mockLoaded).not.toHaveBeenCalled();
    await act(async () => jest.runAllTimers());
    expect(mockLoaded).toHaveBeenCalledTimes(1);
  });

  it("cancels the fetch when unmounted first", () => {
    const { unmount } = renderHook(() => usePrefetchResults(true));
    unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});
