import { act, renderHook } from "@testing-library/react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/** A controllable `matchMedia` that counts its `change` listeners. */
function fakeMatchMedia(initial: boolean) {
  let matches = initial;
  const listeners = new Set<() => void>();
  window.matchMedia = jest.fn(
    (query: string) =>
      ({
        get matches() {
          return matches;
        },
        media: query,
        addEventListener: (_type: string, listener: () => void) =>
          listeners.add(listener),
        removeEventListener: (_type: string, listener: () => void) =>
          listeners.delete(listener),
      }) as unknown as MediaQueryList,
  );
  return {
    listeners,
    set(value: boolean) {
      matches = value;
      listeners.forEach((listener) => listener());
    },
  };
}

afterEach(() => {
  delete (window as Partial<Window>).matchMedia;
});

describe("usePrefersReducedMotion", () => {
  it("is false where matchMedia is missing", () => {
    const { result } = renderHook(usePrefersReducedMotion);
    expect(result.current).toBe(false);
  });

  it("follows the media query as it changes", () => {
    const media = fakeMatchMedia(false);
    const { result } = renderHook(usePrefersReducedMotion);
    expect(result.current).toBe(false);
    act(() => media.set(true));
    expect(result.current).toBe(true);
  });

  it("stops listening on unmount", () => {
    const media = fakeMatchMedia(true);
    const { unmount } = renderHook(usePrefersReducedMotion);
    expect(media.listeners.size).toBe(1);
    unmount();
    expect(media.listeners.size).toBe(0);
  });
});
