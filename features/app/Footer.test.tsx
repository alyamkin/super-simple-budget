import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { en } from "@/i18n/dictionaries/en";
import { fr } from "@/i18n/dictionaries/fr";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("credits the FCAC planner in a new tab", () => {
    render(<Footer footer={en.footer} year={2026} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "About this tool" }),
    ).toBeInTheDocument();
    const link = screen.getByRole("link", {
      name: "FCAC Budget Planner (opens in a new tab)",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://itools-ioutils.fcac-acfc.gc.ca/BP-PB/budget-planner",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });

  it("links to the French planner in French", () => {
    render(<Footer footer={fr.footer} year={2026} />);
    expect(
      screen.getByRole("link", { name: /Planificateur budgétaire/ }),
    ).toHaveAttribute(
      "href",
      "https://itools-ioutils.fcac-acfc.gc.ca/BP-PB/planificateur-budgetaire",
    );
  });

  it("shows the year, the author and the source in a new tab", () => {
    render(<Footer footer={en.footer} year={2026} />);
    expect(
      screen.getByText(/© 2026 · Made by Andrey Lyamkin/),
    ).toBeInTheDocument();
    const link = screen.getByRole("link", {
      name: "Source on GitHub (opens in a new tab)",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/alyamkin/super-simple-budget",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Footer footer={en.footer} year={2026} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
