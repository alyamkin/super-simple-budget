import { screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { Provider } from "react-redux";
import { EXAMPLE_BUDGET } from "@/domain/__fixtures__/exampleBudget";
import { emptyBudget, type Budget, type Row } from "@/domain/budget";
import type { ItemId } from "@/domain/catalog/items";
import { budgetReplaced } from "@/features/budget/budgetSlice";
import { viewChanged } from "@/features/wizard/uiSlice";
import type { Locale } from "@/i18n/config";
import { makeStore } from "@/store/makeStore";
import { renderWithI18n } from "@/test/renderWithI18n";
import { ResultsHeading } from "./ResultsHeading";
import { ResultsView } from "./ResultsView";

const row = (id: ItemId, amount: number): Row => ({
  kind: "catalog",
  id,
  amount,
  frequency: "Monthly",
});

function budgetWith(rows: Partial<Budget["rows"]>): Budget {
  const budget = emptyBudget();
  Object.assign(budget.rows, rows);
  return budget;
}

function renderResults(
  budget: Budget,
  { locale = "en", yearly = false }: { locale?: Locale; yearly?: boolean } = {},
) {
  const store = makeStore();
  store.dispatch(budgetReplaced(budget));
  if (yearly) store.dispatch(viewChanged("year"));
  return renderWithI18n(
    <Provider store={store}>
      <main>
        <ResultsHeading />
        <ResultsView />
      </main>
    </Provider>,
    { locale },
  );
}

const figure = (name: string) => screen.getByRole("figure", { name });

/** The key entries of the income flow, as their text. */
const flowKey = () =>
  within(figure("Where your income goes"))
    .getAllByRole("listitem")
    .map((item) => item.textContent);

describe("Results headline and lede", () => {
  it("reports the example's monthly balance and flagged count", () => {
    renderResults(EXAMPLE_BUDGET);
    expect(
      screen.getByRole("heading", { level: 2, name: "You have $1,872 left each month" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Of the $8,667 that comes in each month, you plan to spend $6,195 and save $600, which is 7% of your income. 1 category is outside the usual range for Canadians.",
      ),
    ).toBeInTheDocument();
  });

  it("asks for income when there is none", () => {
    renderResults(budgetWith({ home: [row("rent", 1200)] }));
    expect(
      screen.getByRole("heading", { level: 2, name: "Add your income to see your plan" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your plan needs income to compare against."),
    ).toBeInTheDocument();
  });

  it("says when every itemized category is within range", () => {
    renderResults(
      budgetWith({
        income: [row("myNetIncome", 5000)],
        savings: [row("emergencyFund", 500)],
        home: [row("rent", 1500), row("medical", 30)],
        everyday: [row("groceries", 600), row("clothes", 100)],
      }),
    );
    expect(
      screen.getByText(/Every category you itemized is within the usual range/),
    ).toBeInTheDocument();
  });

  it("reports a shortfall in French", () => {
    renderResults(
      budgetWith({ income: [row("myNetIncome", 1000)], home: [row("rent", 1200)] }),
      { locale: "fr" },
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      /^Il vous manque 200\s\$ chaque mois$/,
    );
  });
});

describe("Where your income goes", () => {
  it("lists savings, spending and what is left over with shares of income", () => {
    renderResults(EXAMPLE_BUDGET);
    expect(
      within(figure("Where your income goes")).getByText("Income $8,667/mo"),
    ).toBeInTheDocument();
    expect(flowKey()).toEqual([
      "Savings$6007% of income",
      "Spending$6,19571% of income",
      "Left over$1,87222% of income",
    ]);
  });

  it("adds a shortfall entry when short", () => {
    renderResults(
      budgetWith({ income: [row("myNetIncome", 1000)], home: [row("rent", 1200)] }),
    );
    expect(flowKey()).toEqual([
      "Savings$00% of income",
      "Spending$1,200120% of income",
      "Shortfall$20020% of income",
    ]);
  });

  it("follows the yearly view", () => {
    renderResults(EXAMPLE_BUDGET, { yearly: true });
    expect(
      within(figure("Where your income goes")).getByText("Income $104,000/yr"),
    ).toBeInTheDocument();
  });

  it("is not shown when nothing comes in or goes out", () => {
    renderResults(emptyBudget());
    expect(screen.queryByRole("figure")).not.toBeInTheDocument();
  });
});

describe("Your biggest expenses", () => {
  it("lists the top 5 with the subtitle and share sentence", () => {
    renderResults(EXAMPLE_BUDGET);
    const top = figure("Your biggest expenses");
    expect(within(top).getByText("5 of 21 items")).toBeInTheDocument();
    expect(
      within(top).getByText(
        "These 5 make up 72% of your spending. They're usually the best place to look for savings.",
      ),
    ).toBeInTheDocument();
    const items = within(within(top).getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Rent$2,350/mo27.1% of income",
      "Groceries$910/mo10.5% of income",
      "Family, fun and giving (rough total)$450/mo5.2% of income",
      "Car payments$430/mo5.0% of income",
      "Eating out and takeout$303/mo3.5% of income",
    ]);
  });

  it("explains the order when every expense is shown", () => {
    renderResults(budgetWith({ home: [row("rent", 1200), row("internet", 80)] }));
    const top = figure("Your biggest expenses");
    expect(within(top).getByText("2 of 2 items")).toBeInTheDocument();
    expect(
      within(top).getByText("Your largest costs, from highest to lowest."),
    ).toBeInTheDocument();
    // No income: no share of it.
    expect(within(top).queryByText(/of income/)).not.toBeInTheDocument();
  });

  it("is not shown without expenses", () => {
    renderResults(budgetWith({ income: [row("myNetIncome", 1000)] }));
    expect(
      screen.queryByRole("figure", { name: "Your biggest expenses" }),
    ).not.toBeInTheDocument();
  });
});

describe("charts", () => {
  it("are hidden from assistive technology", () => {
    const { container } = renderResults(EXAMPLE_BUDGET);
    const charts = container.querySelectorAll(".recharts-responsive-container");
    expect(charts.length).toBeGreaterThan(0);
    charts.forEach((chart) =>
      expect(chart.closest('[aria-hidden="true"]')).not.toBeNull(),
    );
  });
});

describe("accessibility", () => {
  it.each<[string, Budget, Locale]>([
    ["example", EXAMPLE_BUDGET, "en"],
    ["example (fr)", EXAMPLE_BUDGET, "fr"],
    ["no income", budgetWith({ home: [row("rent", 1200)] }), "en"],
  ])("has no axe violations: %s", async (_name, budget, locale) => {
    const { container } = renderResults(budget, { locale });
    expect(await axe(container)).toHaveNoViolations();
  });
});
