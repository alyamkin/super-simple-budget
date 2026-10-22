/**
 * @jest-environment node
 */
import { classNames } from "@/lib/classNames";

describe("classNames", () => {
  it("joins class names with a space", () => {
    expect(classNames("a", "b", "c")).toBe("a b c");
  });

  it("skips falsy values", () => {
    expect(classNames("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("returns an empty string when nothing is truthy", () => {
    expect(classNames(false, null, undefined)).toBe("");
  });
});
