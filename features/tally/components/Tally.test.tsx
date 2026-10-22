import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Provider } from "react-redux";
import {
  amountChanged,
  estimateAmountChanged,
  estimateToggled,
  rowAdded,
} from "@/features/budget/budgetSlice";
import { fileSaved, uiSlice } from "@/features/wizard/uiSlice";
import type { Locale } from "@/i18n/config";
import { makeStore, type AppStore } from "@/store/makeStore";
import { renderWithI18n } from "@/test/renderWithI18n";
import { Tally } from "./Tally";

function renderTally(
  { locale = "en", store = makeStore() }: { locale?: Locale; store?: AppStore } = {},
) {
  const view = renderWithI18n(
    <Provider store={store}>
      <Tally />
    </Provider>,
    { locale },
  );
  return { store, ...view };
}

/** Income and rent, both monthly. */
function budget(income: number, rent: number) {
  const store = makeStore();
  store.dispatch(rowAdded({ itemId: "rentalIncome" }));
  store.dispatch(amountChanged({ bucket: "income", id: "rentalIncome", amount: income }));
  store.dispatch(rowAdded({ itemId: "rent" }));
  store.dispatch(amountChanged({ bucket: "home", id: "rent", amount: rent }));
  return store;
}

const tally = () => screen.getByRole("complementary", { name: "Running total" });

/** The `dd` next to the `dt` whose text is `term`. */
const amountOf = (term: string) =>
  within(tally())
    .getAllByRole("term")
    .find((dt) => dt.textContent === term)?.nextElementSibling;

const balanceBox = () => tally().querySelector("[data-level]");

describe("Tally", () => {
  it("lists income and every outgoing bucket per month", () => {
    renderTally({ store: budget(3000, 1000) });
    expect(
      within(tally()).getByRole("heading", { level: 3, name: "Your plan" }),
    ).toBeInTheDocument();
    expect(
      within(tally())
        .getAllByRole("term")
        .map((term) => term.textContent),
    ).toEqual([
      "Income",
      "Savings",
      "Home and bills",
      "Getting around",
      "Everyday living",
      "Family, fun and giving",
      "Debt payments",
    ]);
    expect(amountOf("Income")).toHaveTextContent("$3,000");
    expect(amountOf("Home and bills")).toHaveTextContent("$1,000");
    expect(amountOf("Savings")).toHaveTextContent("$0");
  });

  it("shows yearly amounts (×12) when Yearly is pressed", async () => {
    const { store } = renderTally({ store: budget(3000, 1000) });
    const group = screen.getByRole("group", { name: "Show amounts" });
    const monthly = within(group).getByRole("button", { name: "Monthly" });
    const yearly = within(group).getByRole("button", { name: "Yearly" });
    expect(monthly).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(yearly);
    expect(yearly).toHaveAttribute("aria-pressed", "true");
    expect(monthly).toHaveAttribute("aria-pressed", "false");
    expect(uiSlice.selectors.selectView(store.getState())).toBe("year");
    expect(amountOf("Income")).toHaveTextContent("$36,000");
    expect(amountOf("Home and bills")).toHaveTextContent("$12,000");
    expect(balanceBox()).toHaveTextContent("$24,000");
  });

  it("shows what is left over in green", () => {
    renderTally({ store: budget(3000, 1000) });
    expect(balanceBox()).toHaveTextContent("Left over$2,000");
    expect(balanceBox()).toHaveAttribute("data-level", "leftOver");
    expect(balanceBox()).toHaveClass("bg-good-soft", "text-good");
  });

  it("shows a shortfall in red", () => {
    renderTally({ store: budget(1000, 1500) });
    expect(balanceBox()).toHaveTextContent("Shortfall-$500");
    expect(balanceBox()).toHaveAttribute("data-level", "shortfall");
    expect(balanceBox()).toHaveClass("bg-bad-soft", "text-bad");
  });

  it("treats less than 50¢ either way as even", () => {
    renderTally({ store: budget(1000, 1000.4) });
    expect(balanceBox()).toHaveTextContent("Left over$0");
    expect(balanceBox()).toHaveAttribute("data-level", "even");
    expect(balanceBox()).toHaveClass("bg-accent-soft", "text-accent");
  });

  it("marks buckets given as a rough total", () => {
    const store = budget(3000, 1000);
    store.dispatch(estimateToggled({ bucket: "home", enabled: true }));
    store.dispatch(estimateAmountChanged({ bucket: "home", amount: 1800 }));
    renderTally({ store });
    expect(amountOf("Home and bills rough")).toHaveTextContent("$1,800");
    expect(within(tally()).getAllByText("rough")).toHaveLength(1);
  });

  it("says when the budget was last saved to a file", () => {
    const store = budget(1000, 500);
    renderTally({ store });
    expect(tally()).toHaveTextContent("Not saved to a file yet");

    act(() => {
      store.dispatch(fileSaved());
    });
    expect(tally()).toHaveTextContent("Last saved to a file: today");
  });

  it("saves and exports from its links", async () => {
    const user = userEvent.setup();
    const createObjectURL = jest.fn(() => "blob:budget");
    Object.assign(URL, { createObjectURL, revokeObjectURL: jest.fn() });
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const { store } = renderTally({ store: budget(1000, 500) });

    await user.click(within(tally()).getByRole("button", { name: "Export to spreadsheet" }));
    expect(store.getState().ui.lastFileSaveAt).toBeNull();
    await user.click(within(tally()).getByRole("button", { name: "Save budget" }));
    expect(store.getState().ui.lastFileSaveAt).not.toBeNull();

    expect(click.mock.contexts.map((link) => (link as HTMLAnchorElement).download)).toEqual([
      expect.stringMatching(/\.csv$/),
      expect.stringMatching(/\.json$/),
    ]);
    click.mockRestore();
  });

  it("speaks French", () => {
    renderTally({ locale: "fr", store: budget(1000, 1500) });
    expect(
      screen.getByRole("complementary", { name: "Total courant" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Afficher les montants" })).toBeInTheDocument();
    expect(screen.getByText("Manque")).toBeInTheDocument();
  });

  it.each(["en", "fr"] as const)("has no axe violations (%s)", async (locale) => {
    const { container } = renderTally({ locale, store: budget(3000, 1000) });
    expect(await axe(container)).toHaveNoViolations();
  });
});
