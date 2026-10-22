import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { en } from "@/i18n/dictionaries/en";
import { fr } from "@/i18n/dictionaries/fr";
import { renderWithI18n } from "@/test/renderWithI18n";
import { Header } from "./Header";

describe("Header", () => {
  it("shows the app name and links to French", () => {
    renderWithI18n(<Header app={en.app} />);
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
    renderWithI18n(<Header app={fr.app} />, { locale: "fr" });
    const link = screen.getByRole("link", { name: "Show in English" });
    expect(link).toHaveAttribute("href", "/en");
    expect(link).toHaveAttribute("lang", "en-CA");
  });

  it("remembers the chosen language for `/`", async () => {
    renderWithI18n(<Header app={en.app} />);
    const link = screen.getByRole("link", { name: "Afficher en français" });
    // Keep jsdom from attempting the navigation.
    link.addEventListener("click", (event) => event.preventDefault());
    await userEvent.click(link);
    expect(document.cookie).toContain("NEXT_LOCALE=fr");
  });

  it("has no axe violations", async () => {
    const { container } = renderWithI18n(<Header app={en.app} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
