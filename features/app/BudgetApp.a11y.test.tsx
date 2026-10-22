import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { STEPS } from "@/domain/catalog/buckets";
import fullBudget from "@/features/files/__fixtures__/v2-full.json";
import { locales, type Locale } from "@/i18n/config";
import { en } from "@/i18n/dictionaries/en";
import { fr } from "@/i18n/dictionaries/fr";
import { STORAGE_KEY } from "@/store/persistence";
import { StoreProvider } from "@/store/StoreProvider";
import { renderWithI18n } from "@/test/renderWithI18n";
import { BudgetApp } from "./BudgetApp";
import { Header } from "./Header";

/** Spec §12 / PLAN step 22: axe over every screen state in both locales. */
const DICTIONARIES = { en, fr };

const renderApp = (locale: Locale) =>
  renderWithI18n(
    <StoreProvider>
      <Header app={DICTIONARIES[locale].app} />
      <BudgetApp />
    </StoreProvider>,
    { locale },
  );

/** The fixture budget, edited an hour ago and never saved to a file. */
const seedFilled = () =>
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      budget: fullBudget,
      ui: { step: 0, changedAt: Date.now() - 3_600_000 },
    }),
  );

// Nine axe runs per test.
jest.setTimeout(30_000);

beforeEach(() => localStorage.clear());

describe.each(locales)("%s", (locale) => {
  const dict = DICTIONARIES[locale];

  async function visitEveryStep(container: HTMLElement) {
    const user = userEvent.setup();
    const progress = screen.getByRole("navigation", {
      name: dict.wizard.progress,
    });
    for (const step of STEPS.keys()) {
      await user.click(within(progress).getAllByRole("button")[step]);
      if (STEPS[step] === "results") {
        await screen.findByRole("heading", {
          level: 3,
          name: dict.results.next.title,
        });
      }
      expect(await axe(container)).toHaveNoViolations();
    }
    return user;
  }

  it("has no violations on any step of an empty budget", async () => {
    const { container } = renderApp(locale);
    await visitEveryStep(container);
  });

  it("has no violations on any step of a filled budget, with the File menu or a dialog open", async () => {
    seedFilled();
    const { container } = renderApp(locale);
    expect(screen.getByDisplayValue("Tutorat")).toBeInTheDocument();
    const user = await visitEveryStep(container);

    await user.click(
      screen.getByRole("button", { name: new RegExp(`^${dict.files.menu}`) }),
    );
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole("button", { name: dict.files.clear }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
