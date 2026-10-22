/**
 * @jest-environment node
 */
import { formatList, formatMoney, formatPercent } from "@/lib/format";

/** ICU versions differ on U+00A0 vs U+202F in fr-CA; compare with U+00A0 only. */
const nbsp = (text: string) => text.replace(/ /g, " ");

const NBSP = " ";

describe("formatMoney", () => {
  it("formats whole dollars by default", () => {
    expect(formatMoney(1234.5, "en")).toBe("$1,235");
    expect(nbsp(formatMoney(1234.5, "fr"))).toBe(`1${NBSP}235${NBSP}$`);
  });

  it("formats cents when asked", () => {
    expect(formatMoney(1234.5, "en", { decimals: 2 })).toBe("$1,234.50");
    expect(nbsp(formatMoney(1234.5, "fr", { decimals: 2 }))).toBe(
      `1${NBSP}234,50${NBSP}$`,
    );
  });

  it("keeps the sign of negative amounts", () => {
    expect(formatMoney(-50, "en")).toBe("-$50");
    expect(nbsp(formatMoney(-50, "fr"))).toBe(`-50${NBSP}$`);
  });

  it("never shows a negative zero", () => {
    expect(formatMoney(-0, "en")).toBe("$0");
    expect(formatMoney(-0.4, "en")).toBe("$0");
  });
});

describe("formatPercent", () => {
  it("formats a ratio as a whole percentage by default", () => {
    expect(formatPercent(0.255, "en")).toBe("26%");
    expect(nbsp(formatPercent(0.255, "fr"))).toBe(`26${NBSP}%`);
  });

  it("formats decimals when asked", () => {
    expect(formatPercent(0.1234, "en", { decimals: 1 })).toBe("12.3%");
    expect(nbsp(formatPercent(0.1234, "fr", { decimals: 1 }))).toBe(`12,3${NBSP}%`);
  });

  it("reuses formatters across calls", () => {
    const spy = jest.spyOn(Intl, "NumberFormat");
    formatMoney(1, "en", { decimals: 3 });
    formatMoney(2, "en", { decimals: 3 });
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});

describe("formatList", () => {
  it("joins names with the locale's conjunction", () => {
    expect(formatList(["Home and bills"], "en")).toBe("Home and bills");
    expect(formatList(["Home", "Getting around", "Giving"], "en")).toBe(
      "Home, Getting around and Giving",
    );
    expect(formatList(["Maison", "Transport"], "fr")).toBe("Maison et Transport");
  });
});
