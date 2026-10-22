import { readFileSync } from "node:fs";
import { join } from "node:path";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Provider } from "react-redux";
import { EXAMPLE_BUDGET } from "@/domain/__fixtures__/exampleBudget";
import { STEPS } from "@/domain/catalog/buckets";
import { amountChanged, budgetReplaced } from "@/features/budget/budgetSlice";
import { Toaster } from "@/features/notices/components/Toaster";
import type { Locale } from "@/i18n/config";
import { makeStore } from "@/store/makeStore";
import { renderWithI18n } from "@/test/renderWithI18n";
import { MAX_FILE_BYTES } from "../schema";
import { FileBox } from "./FileBox";

const fixture = (name: string) =>
  readFileSync(join(__dirname, "..", "__fixtures__", name), "utf8");

const jsonFile = (content: string, name = "budget.json") =>
  new File([content], name, { type: "application/json" });

function renderBox(locale: Locale = "en") {
  const store = makeStore();
  store.dispatch(budgetReplaced(EXAMPLE_BUDGET));
  // An edit, so there is something unsaved.
  store.dispatch(amountChanged({ bucket: "home", id: "rent", amount: 2400 }));
  const user = userEvent.setup();
  const view = renderWithI18n(
    <Provider store={store}>
      <FileBox />
      <Toaster />
    </Provider>,
    { locale },
  );
  const input = view.container.querySelector<HTMLInputElement>(
    'input[type="file"]',
  )!;
  return { store, user, input, ...view };
}

const toast = () => screen.getByRole("status");

describe("FileBox", () => {
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

  it("offers save, open and export, each named by its title", async () => {
    const { container } = renderBox();

    expect(
      screen.getByRole("region", { name: "Keep your budget" }),
    ).toHaveTextContent("Not saved to a file yet");
    expect(
      screen.getByRole("button", { name: "Save budget" }),
    ).toHaveAccessibleDescription(".json file you can open again later");
    expect(screen.getByRole("button", { name: "Open budget" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Export to spreadsheet" }),
    ).toHaveAccessibleDescription(
      ".csv file for Excel or Numbers, for viewing only",
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("saves the budget as a JSON backup", async () => {
    const { store, user } = renderBox();

    await user.click(screen.getByRole("button", { name: "Save budget" }));

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
    expect(
      screen.getByText("Last saved to a file: today"),
    ).toBeInTheDocument();
    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith("blob:budget"));
  });

  it("exports a spreadsheet without counting it as saved", async () => {
    const { store, user } = renderBox("fr");

    await user.click(
      screen.getByRole("button", { name: "Exporter vers un tableur" }),
    );

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
    const { store, user } = renderBox();

    await user.click(screen.getByRole("button", { name: "Save budget" }));

    expect(toast()).toHaveTextContent("Downloads aren't available here.");
    expect(store.getState().ui.changedAt).not.toBeNull();
    expect(store.getState().ui.lastFileSaveAt).toBeNull();
  });

  it("opens a file from a real button", async () => {
    const { user, input } = renderBox();
    const choose = jest.spyOn(input, "click");

    await user.click(screen.getByRole("button", { name: "Open budget" }));

    expect(choose).toHaveBeenCalled();
    expect(input).toHaveAttribute("accept", ".json,application/json");
  });

  it("replaces the budget with an opened file and shows its results", async () => {
    const { store, user, input } = renderBox();

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
    const { store, user, input } = renderBox();
    const before = store.getState();

    await user.upload(input, file);

    await waitFor(() => expect(toast()).toHaveTextContent(message));
    expect(store.getState().budget).toBe(before.budget);
    expect(store.getState().ui.step).toBe(before.ui.step);
    expect(input.value).toBe("");
  });
});
