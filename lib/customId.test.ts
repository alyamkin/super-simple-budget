/**
 * @jest-environment node
 */
import { CUSTOM_ID_PATTERN, customId } from "@/lib/customId";

describe("customId", () => {
  it("is c_ plus 10 base-36 characters", () => {
    for (let i = 0; i < 100; i++) expect(customId()).toMatch(CUSTOM_ID_PATTERN);
  });

  it("does not repeat", () => {
    const ids = new Set(Array.from({ length: 1000 }, customId));
    expect(ids.size).toBe(1000);
  });
});
