import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Provider } from "react-redux";
import type { BucketId } from "@/domain/catalog/buckets";
import type { Locale } from "@/i18n/config";
import { makeStore, type AppStore } from "@/store/makeStore";
import { renderWithI18n } from "@/test/renderWithI18n";
import { amountChanged, frequencyChanged, rowAdded } from "../budgetSlice";
import { selectTotals } from "../selectors";
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

/** A home budget with rent at $1,000/mo. */
function homeWithRent() {
  const store = makeStore();
  store.dispatch(rowAdded({ itemId: "rent" }));
  store.dispatch(amountChanged({ bucket: "home", id: "rent", amount: 1000 }));
  return store;
}

const toggle = () =>
  screen.getByRole("switch", { name: "Give a rough total instead" });

describe("EstimateToggle", () => {
  it("is a named switch, off by default, described by its hint", () => {
    renderStep("home");
    expect(toggle()).not.toBeChecked();
    expect(toggle()).toHaveAccessibleDescription(
      "Short on time? One ballpark number is enough to start. You can itemize later.",
    );
  });

  it.each(["income", "savings", "debt"] as const)("is not offered on %s", (bucket) => {
    renderStep(bucket);
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("swaps the rows for one rough total and brings them back", async () => {
    const { store } = renderStep("home", { store: homeWithRent() });
    expect(screen.getByRole("textbox", { name: "Rent amount" })).toHaveValue("1000");

    await userEvent.click(toggle());
    expect(toggle()).toBeChecked();
    expect(toggle()).toHaveFocus();
    expect(
      screen.queryByRole("textbox", { name: "Rent amount" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "About how much on home and bills?" }),
    ).toHaveValue("");
    expect(
      screen.getByRole("combobox", { name: "Rough total frequency" }),
    ).toHaveValue("Monthly");

    await userEvent.click(toggle());
    expect(toggle()).not.toBeChecked();
    expect(screen.getByRole("textbox", { name: "Rent amount" })).toHaveValue("1000");
    expect(store.getState().budget.rows.home).toHaveLength(1);
  });

  it("totals use the rough total while it is on", async () => {
    const { store } = renderStep("home", { store: homeWithRent() });
    await userEvent.click(toggle());
    expect(selectTotals(store.getState()).byBucket.home).toBe(0);

    await userEvent.type(
      screen.getByRole("textbox", { name: "About how much on home and bills?" }),
      "300",
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Rough total frequency" }),
      "Weekly",
    );
    // 300 × 52 / 12.
    expect(selectTotals(store.getState()).byBucket.home).toBeCloseTo(1300);

    await userEvent.click(toggle());
    expect(selectTotals(store.getState()).byBucket.home).toBe(1000);
  });

  it("keeps the rough total when switched off and on again", async () => {
    const store = homeWithRent();
    renderStep("home", { store });
    await userEvent.click(toggle());
    await userEvent.type(
      screen.getByRole("textbox", { name: "About how much on home and bills?" }),
      "250",
    );
    await userEvent.click(toggle());
    await userEvent.click(toggle());
    expect(
      screen.getByRole("textbox", { name: "About how much on home and bills?" }),
    ).toHaveValue("250");
  });

  it("reads in French", async () => {
    const store = makeStore();
    store.dispatch(rowAdded({ itemId: "groceries" }));
    store.dispatch(
      frequencyChanged({ bucket: "everyday", id: "groceries", frequency: "Monthly" }),
    );
    renderStep("everyday", { locale: "fr", store });
    await userEvent.click(
      screen.getByRole("switch", { name: "Donner plutôt un total approximatif" }),
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Environ combien au total?" }),
      "412,50",
    );
    expect(selectTotals(store.getState()).byBucket.everyday).toBe(412.5);
  });

  it.each(["en", "fr"] as const)("has no axe violations on and off (%s)", async (locale) => {
    const { container } = renderStep("family", { locale });
    expect(await axe(container)).toHaveNoViolations();
    await userEvent.click(screen.getByRole("switch"));
    expect(await axe(container)).toHaveNoViolations();
  });
});
