/**
 * @jest-environment node
 */
import { contrastRatio } from "./contrast";

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for equal colours", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21);
    expect(contrastRatio("#5a6f75", "#5a6f75")).toBe(1);
  });

  it("does not depend on the order", () => {
    expect(contrastRatio("#ffffff", "#767676")).toBeCloseTo(
      contrastRatio("#767676", "#ffffff"),
    );
  });

  it("matches known WCAG values", () => {
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
    expect(contrastRatio("#949494", "#ffffff")).toBeCloseTo(3.03, 2);
  });
});
