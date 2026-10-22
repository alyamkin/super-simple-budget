import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Provider } from "react-redux";
import { amountChanged, rowAdded } from "@/features/budget/budgetSlice";
import type { Locale } from "@/i18n/config";
import { makeStore, type AppStore } from "@/store/makeStore";
import { renderWithI18n } from "@/test/renderWithI18n";
import { MobileBar } from "./MobileBar";

function renderBar(
  { locale = "en", store = makeStore() }: { locale?: Locale; store?: AppStore } = {},
) {
  return renderWithI18n(
    <Provider store={store}>
      <MobileBar />
    </Provider>,
    { locale },
  );
}

/** Monthly income and rent. */
function budget(income: number, rent: number) {
  const store = makeStore();
  store.dispatch(rowAdded({ itemId: "rentalIncome" }));
  store.dispatch(amountChanged({ bucket: "income", id: "rentalIncome", amount: income }));
  store.dispatch(rowAdded({ itemId: "rent" }));
  store.dispatch(amountChanged({ bucket: "home", id: "rent", amount: rent }));
  return store;
}

/** The value shown under a label. */
const valueOf = (term: string) =>
  screen.getByText(term, { selector: "dt" }).nextElementSibling;

describe("MobileBar", () => {
  it("shows income, planned and what is left", () => {
    renderBar({ store: budget(3000, 1000) });
    expect(valueOf("Income")).toHaveTextContent("$3,000");
    expect(valueOf("Planned")).toHaveTextContent("$1,000");
    expect(valueOf("Left")).toHaveTextContent("$2,000");
    expect(valueOf("Left")).toHaveClass("text-good");
  });

  it("shows a shortfall in red", () => {
    renderBar({ store: budget(1000, 1500) });
    expect(screen.queryByText("Left")).not.toBeInTheDocument();
    expect(valueOf("Short")).toHaveTextContent("-$500");
    expect(valueOf("Short")).toHaveClass("text-bad");
  });

  it("toggles between monthly and yearly amounts", async () => {
    renderBar({ store: budget(3000, 1000) });
    await userEvent.click(screen.getByRole("button", { name: "/mo Show yearly amounts" }));
    expect(valueOf("Income")).toHaveTextContent("$36,000");
    expect(valueOf("Planned")).toHaveTextContent("$12,000");
    expect(valueOf("Left")).toHaveTextContent("$24,000");

    await userEvent.click(screen.getByRole("button", { name: "/yr Show monthly amounts" }));
    expect(valueOf("Income")).toHaveTextContent("$3,000");
  });

  it("speaks French", () => {
    renderBar({ locale: "fr", store: budget(1000, 1500) });
    expect(valueOf("Revenu")).toHaveTextContent("1 000 $");
    expect(valueOf("Prévu")).toBeInTheDocument();
    expect(valueOf("Manque")).toHaveClass("text-bad");
    expect(
      screen.getByRole("button", { name: "/mois Afficher les montants annuels" }),
    ).toBeInTheDocument();
  });

  it.each(["en", "fr"] as const)("has no axe violations (%s)", async (locale) => {
    const { container } = renderBar({ locale, store: budget(3000, 1000) });
    expect(await axe(container)).toHaveNoViolations();
  });
});
