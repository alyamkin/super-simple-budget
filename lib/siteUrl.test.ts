/**
 * @jest-environment node
 */
import { siteUrl } from "@/lib/siteUrl";

describe("siteUrl", () => {
  const original = {
    site: process.env.NEXT_PUBLIC_SITE_URL,
    vercel: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  };
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
  });
  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = original.site;
    process.env.VERCEL_PROJECT_PRODUCTION_URL = original.vercel;
  });

  it("reads NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://budget.example";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "budget.vercel.app";
    expect(siteUrl().href).toBe("https://budget.example/");
  });

  it("falls back to the Vercel production domain", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "budget.vercel.app";
    expect(siteUrl().href).toBe("https://budget.vercel.app/");
    process.env.NEXT_PUBLIC_SITE_URL = "";
    expect(siteUrl().href).toBe("https://budget.vercel.app/");
  });

  it("falls back to localhost when nothing is set", () => {
    expect(siteUrl().href).toBe("http://localhost:3000/");
    process.env.NEXT_PUBLIC_SITE_URL = "";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "";
    expect(siteUrl().href).toBe("http://localhost:3000/");
  });
});
