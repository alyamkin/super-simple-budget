import { screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { makeStore } from "@/store/makeStore";
import { renderWithI18n } from "@/test/renderWithI18n";
import { Progress } from "./Progress";

describe("Progress", () => {
  it("names every step button by its label and marks the current one", () => {
    renderWithI18n(
      <Provider store={makeStore()}>
        <Progress />
      </Provider>,
    );
    const nav = screen.getByRole("navigation", { name: "Progress" });
    const buttons = screen.getAllByRole("button");
    expect(nav).toContainElement(buttons[0]);
    expect(buttons).toHaveLength(8);
    expect(screen.getByRole("button", { name: "Income" })).toHaveAttribute(
      "aria-current",
      "step",
    );
  });

  it("hides the labels below the tablet breakpoint with sr-only", () => {
    renderWithI18n(
      <Provider store={makeStore()}>
        <Progress />
      </Provider>,
    );
    expect(screen.getByText("Income")).toHaveClass("max-tablet:sr-only");
  });
});
