/**
 * @jest-environment node
 */
import { fr } from "@/i18n/dictionaries/fr";
import { serializeJsonLd, webApplicationJsonLd } from "./jsonLd";

describe("webApplicationJsonLd", () => {
  it("describes the localised web application", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://budget.example";
    expect(webApplicationJsonLd("fr", fr)).toMatchObject({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Budget super simple",
      url: "https://budget.example/fr",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      inLanguage: "fr-CA",
      offers: { "@type": "Offer", price: 0 },
    });
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so the data cannot close the script tag", () => {
    const json = serializeJsonLd({ name: "</script><b>" });
    expect(json).not.toContain("<");
    expect(JSON.parse(json)).toEqual({ name: "</script><b>" });
  });
});
