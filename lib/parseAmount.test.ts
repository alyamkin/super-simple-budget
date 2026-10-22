/**
 * @jest-environment node
 */
import { normalizeAmount, parseAmount } from "@/lib/parseAmount";

describe("parseAmount", () => {
  it.each([
    ["1,234.50", 1234.5],
    ["1234", 1234],
    ["$1,234", 1234],
    [" 42 ", 42],
    ["12,", 12],
    ["12.", 12],
    [".5", 0.5],
    ["0", 0],
    ["1.999", 1.99],
  ])("en %j → %p", (input, expected) => {
    expect(parseAmount(input, "en")).toBe(expected);
  });

  it.each([
    ["1 234,50", 1234.5],
    ["1 234,50", 1234.5],
    ["1 234,50", 1234.5],
    ["1 234,50 $", 1234.5],
    ["12,", 12],
    ["12,5", 12.5],
    ["12.5", 12.5],
    ["0,075", 0.07],
  ])("fr %j → %p", (input, expected) => {
    expect(parseAmount(input, "fr")).toBe(expected);
  });

  it.each(["", "   ", "abc", "12abc", "1e12", "-5", "$", ",", ".", "1.2.3"])(
    "%j is not an amount",
    (input) => {
      expect(parseAmount(input, "en")).toBeNull();
      expect(parseAmount(input, "fr")).toBeNull();
    },
  );

  it("clamps below one billion", () => {
    expect(parseAmount("999999999.99", "en")).toBe(999_999_999.99);
    expect(parseAmount("1000000000", "en")).toBe(999_999_999.99);
    expect(parseAmount("123456789012", "fr")).toBeLessThan(1e9);
  });
});

describe("normalizeAmount", () => {
  it("keeps an empty field empty", () => {
    expect(normalizeAmount(null)).toBeNull();
    expect(normalizeAmount(NaN)).toBeNull();
    expect(normalizeAmount(Infinity)).toBeNull();
  });

  it("rounds to 2 decimals and stays within bounds", () => {
    expect(normalizeAmount(12.345)).toBe(12.35);
    expect(normalizeAmount(0)).toBe(0);
    expect(normalizeAmount(-5)).toBe(0);
    expect(normalizeAmount(5e9)).toBe(999_999_999.99);
  });
});
