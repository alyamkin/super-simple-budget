/**
 * @jest-environment node
 */
import { siteUrl } from "@/lib/siteUrl";

describe("siteUrl", () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL;
  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = original;
  });

  it("reads NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://budget.example";
    expect(siteUrl().href).toBe("https://budget.example/");
  });

  it("falls back to localhost when unset or empty", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(siteUrl().href).toBe("http://localhost:3000/");
    process.env.NEXT_PUBLIC_SITE_URL = "";
    expect(siteUrl().href).toBe("http://localhost:3000/");
  });
});
