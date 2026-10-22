import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Provider } from "react-redux";
import { amountChanged, rowAdded } from "@/features/budget/budgetSlice";
import { StepHeading } from "@/features/wizard/components/StepHeading";
import { NOTICE_SNOOZE_MS, viewChanged } from "@/features/wizard/uiSlice";
import type { Locale } from "@/i18n/config";
import { makeStore } from "@/store/makeStore";
import { renderWithI18n } from "@/test/renderWithI18n";
import { UnsavedNotice } from "./UnsavedNotice";

function renderNotice(locale: Locale = "en") {
  const store = makeStore();
  const user = userEvent.setup();
  const view = renderWithI18n(
    <Provider store={store}>
      <UnsavedNotice />
      <StepHeading eyebrow="Step 3 of 8" title="Home and bills" />
    </Provider>,
    { locale },
  );
  const edit = () =>
    act(() => {
      store.dispatch(rowAdded({ itemId: "rent" }));
    });
  return { store, user, edit, ...view };
}

const notice = (name = "Changes not saved to a file") =>
  screen.queryByRole("region", { name });

describe("UnsavedNotice", () => {
  beforeEach(() => {
    Object.assign(URL, {
      createObjectURL: jest.fn(() => "blob:budget"),
      revokeObjectURL: jest.fn(),
    });
    jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it("is hidden while nothing is unsaved", () => {
    renderNotice();
    expect(notice()).not.toBeInTheDocument();
  });

  it("appears after an edit", async () => {
    const { container, edit } = renderNotice();
    edit();
    expect(notice()).toHaveTextContent(
      "Your budget is kept in this browser, but your latest changes aren't saved to a file yet.",
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("is translated", () => {
    const { edit } = renderNotice("fr");
    edit();
    expect(
      notice("Modifications non enregistrées dans un fichier"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Plus tard" })).toBeVisible();
  });

  it("saves the budget and goes away", async () => {
    const { store, user, edit } = renderNotice();
    edit();

    await user.click(screen.getByRole("button", { name: "Save budget" }));

    expect(notice()).not.toBeInTheDocument();
    expect(store.getState().ui.changedAt).toBeNull();
    expect(screen.getByRole("heading", { name: "Home and bills" })).toHaveFocus();
  });

  it("stays when the download isn't available", async () => {
    jest.mocked(URL.createObjectURL).mockImplementation(() => {
      throw new Error("blocked");
    });
    const { user, edit } = renderNotice();
    edit();

    await user.click(screen.getByRole("button", { name: "Save budget" }));

    expect(notice()).toBeInTheDocument();
  });

  it("hides for an hour on Later", async () => {
    const now = jest.spyOn(Date, "now").mockReturnValue(1_000);
    const { store, user, edit } = renderNotice();
    edit();

    await user.click(screen.getByRole("button", { name: "Later" }));

    expect(notice()).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Home and bills" })).toHaveFocus();

    // Later edits don't bring it back within the hour…
    act(() => {
      store.dispatch(amountChanged({ bucket: "home", id: "rent", amount: 5 }));
    });
    expect(notice()).not.toBeInTheDocument();

    // …but the next change after it runs out does.
    now.mockReturnValue(1_000 + NOTICE_SNOOZE_MS);
    act(() => {
      store.dispatch(viewChanged("year"));
    });
    expect(notice()).toBeInTheDocument();
  });
});
