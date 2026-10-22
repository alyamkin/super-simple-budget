import { readFileSync } from "node:fs";
import { join } from "node:path";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Provider } from "react-redux";
import { EXAMPLE_BUDGET } from "@/domain/__fixtures__/exampleBudget";
import { STEPS } from "@/domain/catalog/buckets";
import { emptyBudget } from "@/domain/budget";
import { amountChanged, budgetReplaced } from "@/features/budget/budgetSlice";
import { Toaster } from "@/features/notices/components/Toaster";
import { stepChanged } from "@/features/wizard/uiSlice";
import type { Locale } from "@/i18n/config";
import { makeStore } from "@/store/makeStore";
import { renderWithI18n } from "@/test/renderWithI18n";
import { MAX_FILE_BYTES } from "../schema";
import { FileMenu } from "./FileMenu";

const fixture = (name: string) =>
  readFileSync(join(__dirname, "..", "__fixtures__", name), "utf8");

const jsonFile = (content: string, name = "budget.json") =>
  new File([content], name, { type: "application/json" });

function renderMenu(locale: Locale = "en", { unsaved = true } = {}) {
  const store = makeStore();
  store.dispatch(budgetReplaced(EXAMPLE_BUDGET));
  // An edit, so there is something unsaved.
  if (unsaved) {
    store.dispatch(amountChanged({ bucket: "home", id: "rent", amount: 2400 }));
  }
  const user = userEvent.setup();
  const view = renderWithI18n(
    <Provider store={store}>
      <FileMenu />
      <button type="button">Elsewhere</button>
      <Toaster />
    </Provider>,
    { locale },
  );
  const input = view.container.querySelector<HTMLInputElement>(
    'input[type="file"]',
  )!;
  const toggle = () => screen.getByRole("button", { name: /^(File|Fichier)/ });
  /** Opens the panel and clicks the item named `name`. */
  const choose = async (name: string) => {
    await user.click(toggle());
    await user.click(screen.getByRole("button", { name }));
  };
  return { store, user, input, toggle, choose, ...view };
}

const toast = () => screen.getByRole("status");

describe("FileMenu", () => {
  let createObjectURL: jest.Mock;
  let revokeObjectURL: jest.Mock;
  let click: jest.SpyInstance;

  beforeEach(() => {
    createObjectURL = jest.fn(() => "blob:budget");
    revokeObjectURL = jest.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    click = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
  });

  afterEach(() => click.mockRestore());

  /** The file most recently handed to the download link. */
  const downloaded = () => {
    const blob: Blob = createObjectURL.mock.lastCall[0];
    const link = click.mock.contexts.at(-1) as HTMLAnchorElement;
    return { blob, name: link.download };
  };

  describe("panel", () => {
    it("discloses save, open, export and clear, each named by its title", async () => {
      const { user, toggle, container } = renderMenu();
      expect(toggle()).toHaveAttribute("aria-expanded", "false");
      expect(
        screen.queryByRole("button", { name: "Save budget" }),
      ).not.toBeInTheDocument();

      await user.click(toggle());

      expect(toggle()).toHaveAttribute("aria-expanded", "true");
      const panel = document.getElementById(toggle().getAttribute("aria-controls")!);
      expect(panel).toBeVisible();
      expect(panel).toHaveTextContent("Not saved to a file yet");
      expect(
        screen.getByRole("button", { name: "Save budget" }),
      ).toHaveAccessibleDescription(".json file you can open again later");
      expect(screen.getByRole("button", { name: "Open budget" })).toBeVisible();
      expect(
        screen.getByRole("button", { name: "Export to spreadsheet" }),
      ).toHaveAccessibleDescription(
        ".csv file for Excel or Numbers, for viewing only",
      );
      expect(screen.getByRole("button", { name: "Clear budget" })).toBeVisible();
      expect(await axe(container)).toHaveNoViolations();
    });

    it("names unsaved changes on the button", () => {
      const { toggle } = renderMenu("fr");
      expect(toggle()).toHaveAccessibleName("Fichier, modifications non enregistrées");
    });

    it("has a plain name once everything is saved", () => {
      const { toggle } = renderMenu("en", { unsaved: false });
      expect(toggle()).toHaveAccessibleName("File");
    });

    it("closes on Esc and returns focus to the button", async () => {
      const { user, toggle } = renderMenu();
      await user.click(toggle());
      await user.tab();
      expect(screen.getByRole("button", { name: "Save budget" })).toHaveFocus();

      await user.keyboard("{Escape}");

      expect(toggle()).toHaveAttribute("aria-expanded", "false");
      expect(toggle()).toHaveFocus();
    });

    it("closes on a click outside", async () => {
      const { user, toggle } = renderMenu();
      await user.click(toggle());
      await user.click(screen.getByRole("button", { name: "Elsewhere" }));
      expect(toggle()).toHaveAttribute("aria-expanded", "false");
    });

    it("closes when focus leaves it", async () => {
      const { user, toggle } = renderMenu();
      await user.click(toggle());
      // Toggle, four items, then out.
      for (let i = 0; i < 5; i++) await user.tab();
      expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus();
      expect(toggle()).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("saves the budget as a JSON backup", async () => {
    const { store, choose, toggle } = renderMenu();

    await choose("Save budget");

    const { blob, name } = downloaded();
    expect(name).toMatch(/^my-budget-\d{4}-\d{2}-\d{2}\.json$/);
    expect(blob.type).toBe("application/json");
    const file = JSON.parse(await blob.text());
    expect(file).toMatchObject({ app: "super-simple-budget", version: 2, locale: "en" });
    expect(file.buckets.home.rows[0]).toEqual({
      id: "rent",
      label: "Rent",
      amount: 2400,
      frequency: "Monthly",
    });

    expect(toast()).toHaveTextContent("Budget saved");
    expect(store.getState().ui.changedAt).toBeNull();
    expect(store.getState().ui.lastFileSaveAt).not.toBeNull();
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    expect(toggle()).toHaveFocus();
    expect(toggle()).toHaveAccessibleName("File");
    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith("blob:budget"));
  });

  it("says when the budget was last saved", async () => {
    const { user, choose, toggle } = renderMenu();
    await choose("Save budget");
    await user.click(toggle());
    expect(screen.getByText("Last saved to a file: today")).toBeVisible();
  });

  it("exports a spreadsheet without counting it as saved", async () => {
    const { store, choose } = renderMenu("fr");

    await choose("Exporter vers un tableur");

    const { blob, name } = downloaded();
    expect(name).toMatch(/^mon-budget-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(blob.type).toBe("text/csv;charset=utf-8");
    expect(await blob.text()).toContain("Maison et factures;Loyer;2400,00;");
    expect(toast()).toHaveTextContent("Fichier CSV enregistré");
    expect(store.getState().ui.changedAt).not.toBeNull();
    expect(store.getState().ui.lastFileSaveAt).toBeNull();
    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalled());
  });

  it("says when downloads aren't available", async () => {
    createObjectURL.mockImplementation(() => {
      throw new Error("blocked");
    });
    const { store, choose } = renderMenu();

    await choose("Save budget");

    expect(toast()).toHaveTextContent("Downloads aren't available here.");
    expect(store.getState().ui.changedAt).not.toBeNull();
    expect(store.getState().ui.lastFileSaveAt).toBeNull();
  });

  it("opens a file from a real button", async () => {
    const { input, choose } = renderMenu("en", { unsaved: false });
    const pick = jest.spyOn(input, "click");

    await choose("Open budget");

    expect(pick).toHaveBeenCalled();
    expect(input).toHaveAttribute("accept", ".json,application/json");
  });

  it("replaces the budget with an opened file and shows its results", async () => {
    const { store, user, input } = renderMenu();

    await user.upload(input, jsonFile(fixture("v2-full.json")));

    await waitFor(() => expect(toast()).toHaveTextContent("Budget opened"));
    const { budget, ui } = store.getState();
    expect(budget.rows.income.map((row) => row.id)).toEqual([
      "myNetIncome",
      "spouseNetIncome",
      "c_k3j9x0aa1b",
    ]);
    expect(ui.step).toBe(STEPS.length - 1);
    expect(ui.view).toBe("year");
    expect(ui.changedAt).toBeNull();
    // Cleared, so choosing the same file again opens it again.
    expect(input.value).toBe("");
  });

  it.each([
    ["isn't a budget", jsonFile(fixture("garbage.json")), "This file isn't a Super Simple Budget file."],
    ["isn't JSON", jsonFile("not json"), "This file isn't a Super Simple Budget file."],
    [
      "comes from a newer app",
      jsonFile(fixture("v2-future-version.json")),
      "This file was made by a newer version of Super Simple Budget.",
    ],
    [
      "is over 1 MB",
      jsonFile(" ".repeat(MAX_FILE_BYTES + 1)),
      "This file is too large to be a Super Simple Budget file.",
    ],
  ])("keeps the budget when the file %s", async (_case, file, message) => {
    const { store, user, input } = renderMenu();
    const before = store.getState();

    await user.upload(input, file);

    await waitFor(() => expect(toast()).toHaveTextContent(message));
    expect(store.getState().budget).toBe(before.budget);
    expect(store.getState().ui.step).toBe(before.ui.step);
    expect(input.value).toBe("");
  });

  describe("Clear budget", () => {
    it("starts a blank budget straight away when everything is saved", async () => {
      const { store, choose } = renderMenu("en", { unsaved: false });
      store.dispatch(stepChanged(STEPS.length - 1));

      await choose("Clear budget");

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(store.getState().budget).toEqual(emptyBudget());
      expect(store.getState().ui).toMatchObject({ step: 0, changedAt: null });
      expect(toast()).toHaveTextContent("Started a blank budget");
    });

    it("asks first while changes are unsaved", async () => {
      const { store, choose, container } = renderMenu();
      const before = store.getState().budget;

      await choose("Clear budget");

      const dialog = screen.getByRole("dialog", { name: "Clear your budget?" });
      expect(dialog).toHaveAccessibleDescription(
        "Changes you made since you last saved your budget will be lost. Save your budget first to keep them.",
      );
      expect(
        screen.getByRole("button", { name: "Save budget first" }),
      ).toHaveFocus();
      expect(store.getState().budget).toBe(before);
      expect(await axe(container)).toHaveNoViolations();
    });

    it("clears without saving when asked to", async () => {
      const { store, user, choose } = renderMenu();

      await choose("Clear budget");
      await user.click(
        screen.getByRole("button", { name: "Continue without saving" }),
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(store.getState().budget).toEqual(emptyBudget());
      expect(store.getState().ui.changedAt).toBeNull();
      expect(store.getState().ui.lastFileSaveAt).toBeNull();
      expect(createObjectURL).not.toHaveBeenCalled();
    });

    it("saves first, then offers to clear", async () => {
      const { store, user, choose } = renderMenu("fr");

      await choose("Effacer le budget");
      await user.click(
        screen.getByRole("button", { name: "Enregistrer d’abord le budget" }),
      );

      const dialog = screen.getByRole("dialog", { name: "Effacer votre budget?" });
      expect(dialog).toHaveAccessibleDescription(
        "Budget enregistré. Vous pouvez continuer sans risque.",
      );
      expect(downloaded().name).toMatch(/\.json$/);
      expect(store.getState().ui.changedAt).toBeNull();
      const proceed = screen.getByRole("button", { name: "Effacer mon budget" });
      expect(proceed).toHaveFocus();
      expect(
        screen.queryByRole("button", { name: "Continuer sans enregistrer" }),
      ).not.toBeInTheDocument();

      await user.click(proceed);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(store.getState().budget).toEqual(emptyBudget());
      expect(toast()).toHaveTextContent("Nouveau budget vierge");
    });

    it("stays asking when the save fails", async () => {
      createObjectURL.mockImplementation(() => {
        throw new Error("blocked");
      });
      const { user, choose } = renderMenu();

      await choose("Clear budget");
      await user.click(screen.getByRole("button", { name: "Save budget first" }));

      expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
        /will be lost/,
      );
      expect(
        screen.getByRole("button", { name: "Continue without saving" }),
      ).toBeInTheDocument();
    });

    it.each([
      ["Cancel", (user: ReturnType<typeof userEvent.setup>) =>
        user.click(screen.getByRole("button", { name: "Cancel" }))],
      ["Esc", (user: ReturnType<typeof userEvent.setup>) =>
        user.keyboard("{Escape}")],
    ])("closes on %s and returns focus to the File button", async (_how, close) => {
      const { store, user, choose, toggle } = renderMenu();
      const before = store.getState().budget;

      await choose("Clear budget");
      await close(user);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(toggle()).toHaveFocus();
      expect(store.getState().budget).toBe(before);
    });
  });

  describe("Open budget while unsaved", () => {
    it("asks to replace the budget before choosing a file", async () => {
      const { user, input, choose, toggle } = renderMenu();
      const pick = jest.spyOn(input, "click");

      await choose("Open budget");

      expect(
        screen.getByRole("dialog", { name: "Replace your current budget?" }),
      ).toBeInTheDocument();
      expect(pick).not.toHaveBeenCalled();

      await user.click(
        screen.getByRole("button", { name: "Continue without saving" }),
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(pick).toHaveBeenCalledTimes(1);
      expect(toggle()).toHaveFocus();
    });

    it("saves first, then offers to choose a file", async () => {
      const { user, input, choose } = renderMenu();
      const pick = jest.spyOn(input, "click");

      await choose("Open budget");
      await user.click(screen.getByRole("button", { name: "Save budget first" }));
      await user.click(
        screen.getByRole("button", { name: "Choose a file to open" }),
      );

      expect(pick).toHaveBeenCalledTimes(1);
    });
  });
});
