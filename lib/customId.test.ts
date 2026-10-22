/**
 * @jest-environment node
 */
import { customId, isCustomId } from "@/lib/customId";

describe("customId", () => {
  it("is c_ plus 10 base-36 characters", () => {
    for (let i = 0; i < 100; i++) expect(customId()).toMatch(/^c_[0-9a-z]{10}$/);
  });

  it("does not repeat", () => {
    const ids = new Set(Array.from({ length: 1000 }, customId));
    expect(ids.size).toBe(1000);
  });
});

describe("isCustomId", () => {
  it("accepts only the custom id format", () => {
    expect(isCustomId("c_0123456789")).toBe(true);
    expect(isCustomId("c_abcdefghij")).toBe(true);
    expect(isCustomId("c_ABCDEFGHIJ")).toBe(false);
    expect(isCustomId("c_123")).toBe(false);
    expect(isCustomId("rent")).toBe(false);
    expect(isCustomId(42)).toBe(false);
  });
});
