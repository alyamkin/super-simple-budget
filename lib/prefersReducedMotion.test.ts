import { prefersReducedMotion } from "./prefersReducedMotion";

const mockMatchMedia = (matches: boolean) =>
  jest.fn((query: string) => ({ matches, media: query }) as MediaQueryList);

afterEach(() => {
  // jsdom has no matchMedia; restore that.
  delete (window as Partial<Window>).matchMedia;
});

describe("prefersReducedMotion", () => {
  it("is false where matchMedia is missing", () => {
    expect(prefersReducedMotion()).toBe(false);
  });

  it.each([true, false])("follows the media query (%s)", (matches) => {
    window.matchMedia = mockMatchMedia(matches);
    expect(prefersReducedMotion()).toBe(matches);
    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });
});
