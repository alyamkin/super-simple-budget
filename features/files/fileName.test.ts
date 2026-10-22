/** @jest-environment node */
import { fileName } from "./fileName";

describe("fileName", () => {
  it("adds the local date and the extension", () => {
    expect(fileName("my-budget", "json", new Date(2026, 0, 5, 23, 59))).toBe(
      "my-budget-2026-01-05.json",
    );
    expect(fileName("mon-budget", "csv", new Date(2026, 11, 31))).toBe(
      "mon-budget-2026-12-31.csv",
    );
  });
});
