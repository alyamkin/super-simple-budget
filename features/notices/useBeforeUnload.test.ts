import { renderHook } from "@testing-library/react";
import { useBeforeUnload } from "./useBeforeUnload";

const leave = () => {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event;
};

describe("useBeforeUnload", () => {
  let add: jest.SpyInstance;

  beforeEach(() => {
    add = jest.spyOn(window, "addEventListener");
  });

  afterEach(() => add.mockRestore());

  const registered = () =>
    add.mock.calls.filter(([type]) => type === "beforeunload").length;

  it("does nothing while nothing is unsaved", () => {
    renderHook(() => useBeforeUnload(false));
    expect(registered()).toBe(0);
    expect(leave().defaultPrevented).toBe(false);
  });

  it("asks before leaving while unsaved", () => {
    renderHook(() => useBeforeUnload(true));
    expect(registered()).toBe(1);
    expect(leave().defaultPrevented).toBe(true);
  });

  it("stops asking once saved", () => {
    const { rerender } = renderHook(({ when }) => useBeforeUnload(when), {
      initialProps: { when: true },
    });
    rerender({ when: false });
    expect(leave().defaultPrevented).toBe(false);
  });

  it("removes the listener on unmount", () => {
    const { unmount } = renderHook(() => useBeforeUnload(true));
    unmount();
    expect(leave().defaultPrevented).toBe(false);
  });
});
