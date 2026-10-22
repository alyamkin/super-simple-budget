/**
 * @jest-environment node
 */
import { normalizeSearch } from "./normalizeSearch";

describe("normalizeSearch", () => {
  it("lower-cases", () => {
    expect(normalizeSearch("Daycare GYM")).toBe("daycare gym");
  });

  it("strips accents", () => {
    expect(normalizeSearch("Épicerie")).toBe("epicerie");
    expect(normalizeSearch("Fréquence à l’été, ça")).toBe("frequence a l’ete, ca");
  });

  it("folds precomposed and decomposed forms alike", () => {
    expect(normalizeSearch("é")).toBe(normalizeSearch("é"));
  });

  it("keeps other characters", () => {
    expect(normalizeSearch("  RRSP / REER  ")).toBe("  rrsp / reer  ");
  });
});
