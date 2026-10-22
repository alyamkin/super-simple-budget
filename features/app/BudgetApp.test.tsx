import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import type { Locale } from "@/i18n/config";
import { StoreProvider } from "@/store/StoreProvider";
import { renderWithI18n } from "@/test/renderWithI18n";
import { BudgetApp } from "./BudgetApp";

const renderApp = (locale: Locale = "en") =>
  renderWithI18n(
    <StoreProvider>
      <BudgetApp />
    </StoreProvider>,
    { locale },
  );

const progress = () => screen.getByRole("navigation", { name: "Progress" });

beforeEach(() => {
  localStorage.clear();
  document.title = "";
});

describe("BudgetApp", () => {
  it("starts on the income step with all 8 steps in the progress", () => {
    renderApp();
    const steps = within(progress()).getAllByRole("button");
    expect(steps.map((step) => step.textContent)).toEqual([
      "Income",
      "Savings",
      "Home and bills",
      "Getting around",
      "Everyday living",
      "Family, fun and giving",
      "Debt payments",
      "Results",
    ]);
    expect(steps[0]).toHaveAttribute("aria-current", "step");
    expect(steps.slice(1).every((step) => !step.hasAttribute("aria-current"))).toBe(true);
    expect(screen.getByText("Step 1 of 8 · Income")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "What money comes in?" }),
    ).toBeInTheDocument();
  });

  it("is marked busy until storage is read, then not", () => {
    const { container } = renderApp();
    expect(container.firstChild).toHaveAttribute("aria-busy", "false");
  });

  it("does not move focus or change the title on first render", () => {
    renderApp();
    expect(document.body).toHaveFocus();
    expect(document.title).toBe("");
  });

  it("clicking a step moves aria-current, focus and the title", async () => {
    renderApp();
    await userEvent.click(
      within(progress()).getByRole("button", { name: "Getting around" }),
    );
    expect(
      within(progress()).getByRole("button", { name: "Getting around" }),
    ).toHaveAttribute("aria-current", "step");
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("How do you get around?");
    expect(heading).toHaveFocus();
    expect(document.title).toBe("Getting around — Super Simple Budget");
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("labels Next/Back with the neighbouring steps", async () => {
    renderApp();
    expect(screen.queryByRole("button", { name: /Back/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Next: Savings →" }));
    expect(screen.getByRole("heading", { level: 2 })).toHaveFocus();
    expect(screen.getByRole("button", { name: "← Back" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next: Home and bills →" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "← Back" }));
    expect(screen.getByText("Step 1 of 8 · Income")).toBeInTheDocument();
  });

  it("offers “See my plan” on the last bucket and “Edit” on the results", async () => {
    renderApp();
    await userEvent.click(
      within(progress()).getByRole("button", { name: "Debt payments" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "See my plan →" }));
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Results");
    expect(document.title).toBe("Results — Super Simple Budget");

    await userEvent.click(screen.getByRole("button", { name: "← Edit" }));
    expect(screen.getByText("Step 7 of 8 · Debt payments")).toBeInTheDocument();
  });

  it("uses French labels", async () => {
    renderApp("fr");
    expect(screen.getByRole("navigation", { name: "Progression" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Suivant : Épargne →" }));
    expect(screen.getByRole("button", { name: "← Retour" })).toBeInTheDocument();
    expect(document.title).toBe("Épargne — Budget super simple");
  });

  it("has a running-total landmark", () => {
    renderApp();
    expect(
      screen.getByRole("complementary", { name: "Running total" }),
    ).toBeInTheDocument();
  });

  it.each(["en", "fr"] as const)("has no axe violations (%s)", async (locale) => {
    const { container } = renderApp(locale);
    expect(await axe(container)).toHaveNoViolations();
  });
});
