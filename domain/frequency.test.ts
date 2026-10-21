/**
 * @jest-environment node
 */
import { FREQUENCIES, TIMES_PER_YEAR, toMonthly } from "@/domain/frequency";

describe("frequency", () => {
  it("lists every frequency, most to least frequent", () => {
    expect(FREQUENCIES).toEqual([
      "Daily",
      "Weekly",
      "Every2Weeks",
      "TwiceMonthly",
      "Monthly",
      "Quarterly",
      "Every6Months",
      "Annually",
    ]);
  });

  it.each([
    ["Daily", 365],
    ["Weekly", 52],
    ["Every2Weeks", 26],
    ["TwiceMonthly", 24],
    ["Monthly", 12],
    ["Quarterly", 4],
    ["Every6Months", 2],
    ["Annually", 1],
  ] as const)("%s happens %d times a year", (frequency, times) => {
    expect(TIMES_PER_YEAR[frequency]).toBe(times);
    expect(toMonthly(1200, frequency)).toBeCloseTo(times * 100);
  });

  it("keeps zero at zero", () => {
    expect(toMonthly(0, "Weekly")).toBe(0);
  });
});
