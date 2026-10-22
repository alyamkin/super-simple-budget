import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Provider } from "react-redux";
import type { BucketId } from "@/domain/catalog/buckets";
import { Toaster } from "@/features/notices/components/Toaster";
import type { Locale } from "@/i18n/config";
import { makeStore, type AppStore } from "@/store/makeStore";
import { renderWithI18n } from "@/test/renderWithI18n";
import { rowAdded } from "../budgetSlice";
import { MAX_SEARCH_RESULTS } from "../itemSearch";
import { BucketStep } from "./BucketStep";

function renderStep(
  bucket: BucketId,
  { locale = "en", store = makeStore() }: { locale?: Locale; store?: AppStore } = {},
) {
  const view = renderWithI18n(
    <Provider store={store}>
      <BucketStep bucket={bucket} />
      <Toaster />
    </Provider>,
    { locale },
  );
  return { store, ...view };
}

const searchBox = () => screen.getByRole("searchbox");
const results = () =>
  document.getElementById(searchBox().getAttribute("aria-controls")!)!;
const hits = () => within(results()).queryAllByRole("button");
const search = (text: string) => userEvent.type(searchBox(), text);

describe("ItemSearch", () => {
  it("is labelled and shows nothing until something is typed", () => {
    renderStep("home");
    expect(searchBox()).toHaveAccessibleName("Search all items");
    expect(searchBox()).toHaveAttribute(
      "placeholder",
      "Search all items, e.g. gym, daycare, parking",
    );
    expect(hits()).toHaveLength(0);
  });

  it("finds items from every bucket and names their bucket", async () => {
    renderStep("home");
    await search("daycare");
    expect(
      within(results()).getByRole("button", {
        name: "Add Daycare and childcare · Family, fun and giving",
      }),
    ).toHaveTextContent("· Family, fun and giving");
  });

  it("does not name the current bucket", async () => {
    renderStep("home");
    await search("rent");
    expect(
      within(results()).getByRole("button", { name: "Add Rent" }),
    ).not.toHaveTextContent("·");
  });

  it("ignores accents and case in French", async () => {
    renderStep("home", { locale: "fr" });
    await search("garderie");
    expect(
      within(results()).getByRole("button", {
        name: /^Ajouter\s:\sGarderie et services de garde · /,
      }),
    ).toBeInTheDocument();

    await userEvent.clear(searchBox());
    await search("EPICERIE");
    expect(
      within(results()).getByRole("button", { name: /^Ajouter\s:\sÉpicerie · / }),
    ).toBeInTheDocument();
  });

  it(`shows at most ${MAX_SEARCH_RESULTS} results and announces the count`, async () => {
    renderStep("home");
    await search("e");
    expect(hits()).toHaveLength(MAX_SEARCH_RESULTS);
    expect(screen.getByText(`${MAX_SEARCH_RESULTS} results`)).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("leaves out items already picked", async () => {
    const store = makeStore();
    store.dispatch(rowAdded({ itemId: "daycare" }));
    renderStep("home", { store });
    await search("daycare");
    expect(
      within(results()).queryByRole("button", { name: /Daycare and childcare/ }),
    ).not.toBeInTheDocument();
  });

  it("says when nothing matches", async () => {
    renderStep("home");
    await search("zzzz");
    expect(hits()).toHaveLength(0);
    expect(
      within(results()).getByText("No match. Use “Something else” to add your own."),
    ).toBeInTheDocument();
  });

  it("adds a hit from this bucket, clears the search and focuses its amount", async () => {
    const { store } = renderStep("home");
    await search("rent");
    await userEvent.click(within(results()).getByRole("button", { name: "Add Rent" }));

    expect(screen.getByRole("textbox", { name: "Rent amount" })).toHaveFocus();
    expect(searchBox()).toHaveValue("");
    expect(hits()).toHaveLength(0);
    expect(store.getState().budget.rows.home.map((row) => row.id)).toEqual(["rent"]);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("adds a hit from another bucket, stays here and shows a toast", async () => {
    const { store } = renderStep("home");
    await search("daycare");
    await userEvent.click(
      within(results()).getByRole("button", { name: /^Add Daycare and childcare/ }),
    );

    expect(store.getState().budget.rows.family.map((row) => row.id)).toEqual([
      "daycare",
    ]);
    expect(store.getState().budget.rows.home).toEqual([]);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Added to Family, fun and giving",
    );
    expect(searchBox()).toHaveValue("daycare");
    expect(searchBox()).toHaveFocus();
    expect(
      within(results()).queryByRole("button", { name: /Daycare and childcare/ }),
    ).not.toBeInTheDocument();
  });

  it.each(["en", "fr"] as const)("has no axe violations with results (%s)", async (locale) => {
    const { container } = renderStep("home", { locale });
    await search("a");
    expect(await axe(container)).toHaveNoViolations();
  });
});
