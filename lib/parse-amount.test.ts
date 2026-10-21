/**
 * @jest-environment node
 */
import { parseAmount } from "@/lib/parse-amount";

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
    ["1.2.3", 1.23],
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

  it.each(["", "   ", "abc", "12abc", "1e12", "-5", "$", ",", "."])(
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
