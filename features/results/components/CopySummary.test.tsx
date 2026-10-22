import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Provider } from "react-redux";
import { EXAMPLE_BUDGET } from "@/domain/__fixtures__/exampleBudget";
import { emptyBudget, type Budget } from "@/domain/budget";
import { budgetReplaced } from "@/features/budget/budgetSlice";
import { Toaster } from "@/features/notices/components/Toaster";
import type { Locale } from "@/i18n/config";
import { makeStore } from "@/store/makeStore";
import { renderWithI18n } from "@/test/renderWithI18n";
import { CopySummary } from "./CopySummary";

const NB = " ";

function renderCopy(budget: Budget, locale: Locale = "en") {
  const store = makeStore();
  store.dispatch(budgetReplaced(budget));
  return renderWithI18n(
    <Provider store={store}>
      <CopySummary />
      <Toaster />
    </Provider>,
    { locale },
  );
}

/** Replaces `navigator.clipboard` after user-event has installed its own. */
function mockClipboard(clipboard: Partial<Clipboard> | undefined) {
  Object.defineProperty(navigator, "clipboard", {
    value: clipboard,
    configurable: true,
  });
}

describe("CopySummary", () => {
  it("copies the example's monthly summary", async () => {
    const user = userEvent.setup();
    const writeText = jest.fn().mockResolvedValue(undefined);
    mockClipboard({ writeText });
    renderCopy(EXAMPLE_BUDGET);

    await user.click(screen.getByRole("button", { name: "Copy summary" }));

    expect(writeText).toHaveBeenCalledWith(
      [
        "My budget plan (monthly)",
        "Income: $8,666.67",
        "Savings: $600.00",
        "Home and bills: $2,717.50",
        "Getting around: $1,031.00",
        "Everyday living: $1,456.67",
        "Family, fun and giving: $450.00 (rough)",
        "Debt payments: $540.00",
        "Left over: $1,871.50",
      ].join("\n"),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Summary copied");
  });

  it("copies a French summary with the shortfall", async () => {
    const user = userEvent.setup();
    const writeText = jest.fn().mockResolvedValue(undefined);
    mockClipboard({ writeText });
    const budget = emptyBudget();
    budget.rows.home = [
      { kind: "catalog", id: "rent", amount: 1200, frequency: "Monthly" },
    ];
    renderCopy(budget, "fr");

    await user.click(screen.getByRole("button", { name: "Copier le résumé" }));

    expect(writeText).toHaveBeenCalledWith(
      [
        "Mon plan budgétaire (mensuel)",
        `Revenu${NB}: 0,00${NB}$`,
        `Épargne${NB}: 0,00${NB}$`,
        `Maison et factures${NB}: 1${NB}200,00${NB}$`,
        `Déplacements${NB}: 0,00${NB}$`,
        `Vie quotidienne${NB}: 0,00${NB}$`,
        `Famille, loisirs et dons${NB}: 0,00${NB}$`,
        `Paiements de dettes${NB}: 0,00${NB}$`,
        `Manque${NB}: -1${NB}200,00${NB}$`,
      ].join("\n"),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Résumé copié");
  });

  it("says when the clipboard refuses", async () => {
    const user = userEvent.setup();
    mockClipboard({ writeText: jest.fn().mockRejectedValue(new Error("denied")) });
    renderCopy(EXAMPLE_BUDGET);

    await user.click(screen.getByRole("button", { name: "Copy summary" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Copy isn't available here.",
    );
  });

  it("says when there is no clipboard", async () => {
    const user = userEvent.setup();
    mockClipboard(undefined);
    renderCopy(EXAMPLE_BUDGET);

    await user.click(screen.getByRole("button", { name: "Copy summary" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Copy isn't available here.",
    );
  });

  it("has no axe violations", async () => {
    const { container } = renderCopy(EXAMPLE_BUDGET);
    expect(await axe(container)).toHaveNoViolations();
  });
});
