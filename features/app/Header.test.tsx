import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Provider } from "react-redux";
import type { Locale } from "@/i18n/config";
import { en } from "@/i18n/dictionaries/en";
import { fr } from "@/i18n/dictionaries/fr";
import { makeStore } from "@/store/makeStore";
import { renderWithI18n } from "@/test/renderWithI18n";
import { Header } from "./Header";

// The File menu inside needs a store (its own tests are in FileMenu.test).
function renderHeader(locale: Locale = "en") {
  const user = userEvent.setup();
  const view = renderWithI18n(
    <Provider store={makeStore()}>
      <Header app={locale === "en" ? en.app : fr.app} />
    </Provider>,
    { locale },
  );
  return { user, ...view };
}

describe("Header", () => {
  it("shows the app name and links to French", () => {
    renderHeader();
    expect(
      screen.getByRole("heading", { level: 1, name: "Super Simple Budget" }),
    ).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Afficher en français" });
    expect(link).toHaveTextContent("Français");
    expect(link).toHaveAttribute("href", "/fr");
    expect(link).toHaveAttribute("lang", "fr-CA");
    expect(link).toHaveAttribute("hreflang", "fr-CA");
  });

  it("links to English from French", () => {
    renderHeader("fr");
    const link = screen.getByRole("link", { name: "Show in English" });
    expect(link).toHaveAttribute("href", "/en");
    expect(link).toHaveAttribute("lang", "en-CA");
  });

  it("remembers the chosen language for `/`", async () => {
    const { user } = renderHeader();
    const link = screen.getByRole("link", { name: "Afficher en français" });
    // Keep jsdom from attempting the navigation.
    link.addEventListener("click", (event) => event.preventDefault());
    await user.click(link);
    expect(document.cookie).toContain("NEXT_LOCALE=fr");
  });

  it("offers the File menu", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: "File" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it.each<Locale>(["en", "fr"])("has no axe violations (%s)", async (locale) => {
    const { container } = renderHeader(locale);
    expect(await axe(container)).toHaveNoViolations();
  });
});
