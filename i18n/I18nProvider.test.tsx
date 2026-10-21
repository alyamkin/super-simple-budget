import { render, screen } from "@testing-library/react";
import { en } from "@/i18n/dictionaries/en";
import { fr } from "@/i18n/dictionaries/fr";
import { I18nProvider, useT } from "@/i18n/I18nProvider";

function AppName() {
  const { t, locale } = useT();
  return <p lang={locale}>{t("app.name")}</p>;
}

describe("I18nProvider", () => {
  it("gives client components the active dictionary", () => {
    render(
      <I18nProvider locale="fr" dictionary={fr}>
        <AppName />
      </I18nProvider>,
    );
    expect(screen.getByText("Budget super simple")).toHaveAttribute(
      "lang",
      "fr",
    );
  });

  it("switches with the locale prop", () => {
    const { rerender } = render(
      <I18nProvider locale="fr" dictionary={fr}>
        <AppName />
      </I18nProvider>,
    );
    rerender(
      <I18nProvider locale="en" dictionary={en}>
        <AppName />
      </I18nProvider>,
    );
    expect(screen.getByText("Super Simple Budget")).toBeInTheDocument();
  });

  it("throws outside a provider", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<AppName />)).toThrow(/I18nProvider/);
    jest.restoreAllMocks();
  });
});
