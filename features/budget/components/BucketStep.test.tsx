import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Provider } from "react-redux";
import type { BucketId } from "@/domain/catalog/buckets";
import { viewChanged } from "@/features/wizard/uiSlice";
import type { Locale } from "@/i18n/config";
import { formatMoney } from "@/lib/format";
import { makeStore, type AppStore } from "@/store/makeStore";
import { renderWithI18n } from "@/test/renderWithI18n";
import {
  amountChanged,
  frequencyChanged,
  rowAdded,
} from "../budgetSlice";
import { BucketStep } from "./BucketStep";

function renderStep(
  bucket: BucketId,
  { locale = "en", store = makeStore() }: { locale?: Locale; store?: AppStore } = {},
) {
  const view = renderWithI18n(
    <Provider store={store}>
      <BucketStep bucket={bucket} />
    </Provider>,
    { locale },
  );
  return { store, ...view };
}

const pick = (label: string) =>
  userEvent.click(screen.getByRole("button", { name: `Add ${label}` }));

const panelHeading = () => screen.getAllByRole("heading", { level: 3 })[0];
const pickerHeading = () => screen.getAllByRole("heading", { level: 3 })[1];

describe("BucketStep", () => {
  it("starts empty with the popular chips", () => {
    renderStep("income");
    expect(panelHeading()).toHaveTextContent("Nothing added yet");
    expect(screen.getByText(/Tap the items below/)).toBeInTheDocument();
    expect(pickerHeading()).toHaveTextContent("Tap what applies");
    expect(screen.getByText("$0/mo")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /^Add / }).map((chip) => chip.textContent),
    ).toEqual([
      "+My net salary",
      "+Partner's net salary",
      "+Self-employment income",
      "+Side or gig income",
      "+Canada Child Benefit and other child benefits",
      "+EI benefits",
      "+Government pensions (OAS, CPP, GIS)",
    ]);
    expect(screen.getByRole("button", { name: "Show 9 more" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ Something else" })).toBeInTheDocument();
  });

  it("picking a chip adds its row and focuses the amount", async () => {
    renderStep("income");
    await pick("My net salary");

    const amount = screen.getByRole("textbox", { name: "My net salary amount" });
    expect(amount).toHaveFocus();
    expect(amount).toHaveValue("");
    expect(
      screen.getByRole("combobox", { name: "My net salary frequency" }),
    ).toHaveValue("Every2Weeks");
    expect(panelHeading()).toHaveTextContent("1 source of income");
    expect(pickerHeading()).toHaveTextContent("Anything else?");
    expect(
      screen.queryByRole("button", { name: "Add My net salary" }),
    ).not.toBeInTheDocument();
  });

  it("updates the step total as amounts and frequencies change", async () => {
    renderStep("income");
    await pick("My net salary");
    await userEvent.type(
      screen.getByRole("textbox", { name: "My net salary amount" }),
      "1000",
    );
    // Every 2 weeks: 1000 × 26 / 12.
    expect(screen.getByText("$2,167/mo")).toBeInTheDocument();

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "My net salary frequency" }),
      "Monthly",
    );
    expect(screen.getByText("$1,000/mo")).toBeInTheDocument();
  });

  it("follows the yearly view", () => {
    const store = makeStore();
    store.dispatch(rowAdded({ itemId: "rent" }));
    store.dispatch(amountChanged({ bucket: "home", id: "rent", amount: 1000 }));
    store.dispatch(viewChanged("year"));
    renderStep("home", { store });
    expect(screen.getByText("$12,000/yr")).toBeInTheDocument();
  });

  it("reads French amounts and formats the total in French", async () => {
    renderStep("home", { locale: "fr" });
    await userEvent.click(screen.getByRole("button", { name: "Ajouter : Loyer" }));
    const amount = screen.getByRole("textbox", { name: "Montant : Loyer" });
    expect(amount).toHaveFocus();
    await userEvent.type(amount, "1234,50");
    // Testing Library collapses the non-breaking spaces `Intl` puts in fr-CA.
    const total = `${formatMoney(1234.5, "fr")}/mois`.replace(/\s/g, " ");
    expect(screen.getByText(total)).toBeInTheDocument();
    expect(panelHeading()).toHaveTextContent("1 dépense ajoutée");
  });

  it("toggles an item's tip", async () => {
    renderStep("savings");
    await pick("Emergency fund");
    const toggle = screen.getByRole("button", { name: "Tip for Emergency fund" });
    const tip = screen.getByText(/small automatic transfer/);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", tip.parentElement!.id);
    expect(tip).not.toBeVisible();

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(tip).toBeVisible();
  });

  it("shows help text and the account type", async () => {
    renderStep("savings");
    await pick("Retirement savings");
    expect(screen.getByText("RRSP")).toBeInTheDocument();
    await pick("Emergency fund");
    expect(screen.getByText(/A cushion for surprise costs/)).toBeInTheDocument();
  });

  it("names the account type in French", async () => {
    renderStep("savings", { locale: "fr" });
    await userEvent.click(
      screen.getByRole("button", { name: "Ajouter : Épargne-retraite" }),
    );
    expect(screen.getByText("REER")).toBeInTheDocument();
  });

  it("moves focus to the next row, then the previous, then the picker heading", async () => {
    renderStep("income");
    await pick("My net salary");
    await pick("Partner's net salary");
    await pick("EI benefits");

    await userEvent.click(
      screen.getByRole("button", { name: "Remove Partner's net salary" }),
    );
    expect(screen.getByRole("button", { name: "Remove EI benefits" })).toHaveFocus();

    await userEvent.click(screen.getByRole("button", { name: "Remove EI benefits" }));
    expect(
      screen.getByRole("button", { name: "Remove My net salary" }),
    ).toHaveFocus();

    await userEvent.click(screen.getByRole("button", { name: "Remove My net salary" }));
    expect(pickerHeading()).toHaveFocus();
    expect(pickerHeading()).toHaveTextContent("Tap what applies");
    expect(panelHeading()).toHaveTextContent("Nothing added yet");
    expect(
      screen.getByRole("button", { name: "Add Partner's net salary" }),
    ).toBeInTheDocument();
  });

  it("adds a custom row, focuses its name and names its fields after it", async () => {
    renderStep("family");
    await userEvent.click(screen.getByRole("button", { name: "+ Something else" }));

    const name = screen.getByRole("textbox", { name: "Item name" });
    expect(name).toHaveFocus();
    expect(name).toHaveAttribute("placeholder", "Name this item");
    expect(name).toHaveAttribute("maxLength", "80");
    expect(screen.getByRole("textbox", { name: "Your item amount" })).toBeInTheDocument();

    await userEvent.type(name, "Piano lessons");
    expect(
      screen.getByRole("textbox", { name: "Piano lessons amount" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove Piano lessons" }),
    ).toBeInTheDocument();
    expect(panelHeading()).toHaveTextContent("You pay for 1 thing here");
  });

  it("shows the other items behind “Show more” and hides them again", async () => {
    const { store } = renderStep("debt");
    const toggle = screen.getByRole("button", { name: "Show 3 more" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getAllByRole("button", { name: /^Add / })).toHaveLength(4);

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveTextContent("Show fewer");
    expect(toggle).toHaveFocus();
    expect(screen.getAllByRole("button", { name: /^Add / })).toHaveLength(7);
    expect(store.getState().ui.showAllChips.debt).toBe(true);

    await userEvent.click(toggle);
    expect(screen.getAllByRole("button", { name: /^Add / })).toHaveLength(4);
  });

  describe("savings badge", () => {
    it("is hidden without income", () => {
      renderStep("savings");
      expect(screen.queryByText(/of income/)).not.toBeInTheDocument();
    });

    it("rates savings as a share of income", async () => {
      const store = makeStore();
      store.dispatch(rowAdded({ itemId: "myNetIncome" }));
      store.dispatch(
        frequencyChanged({ bucket: "income", id: "myNetIncome", frequency: "Monthly" }),
      );
      store.dispatch(
        amountChanged({ bucket: "income", id: "myNetIncome", amount: 4000 }),
      );
      renderStep("savings", { store });
      expect(screen.getByText("0.0% of income")).toBeInTheDocument();

      await pick("Emergency fund");
      await userEvent.type(
        screen.getByRole("textbox", { name: "Emergency fund amount" }),
        "200",
      );
      expect(screen.getByText("5.0% of income")).toBeInTheDocument();
    });
  });

  it.each(["en", "fr"] as const)("has no axe violations empty or filled (%s)", async (locale) => {
    const { container } = renderStep("savings", { locale });
    expect(await axe(container)).toHaveNoViolations();

    const chips = within(container).getAllByRole("button", { name: /\S/ });
    await userEvent.click(chips[0]);
    await userEvent.click(
      within(container).getByRole("button", { name: /Something else|Autre chose/ }),
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
