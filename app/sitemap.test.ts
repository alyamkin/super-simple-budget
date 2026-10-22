/**
 * @jest-environment node
 */
import robots from "./robots";
import sitemap from "./sitemap";

beforeEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://budget.example";
});
afterEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
});

const languages = {
  "en-CA": "https://budget.example/en",
  "fr-CA": "https://budget.example/fr",
  "x-default": "https://budget.example/en",
};

describe("sitemap", () => {
  it("lists both locale pages with their language alternates", () => {
    expect(sitemap()).toEqual([
      expect.objectContaining({
        url: "https://budget.example/en",
        alternates: { languages },
      }),
      expect.objectContaining({
        url: "https://budget.example/fr",
        alternates: { languages },
      }),
    ]);
  });
});

describe("robots", () => {
  it("allows everything and points to the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://budget.example/sitemap.xml",
    });
  });
});
