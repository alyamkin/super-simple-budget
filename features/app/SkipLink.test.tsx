import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MAIN_ID, SkipLink } from "./SkipLink";

describe("SkipLink", () => {
  it("is the first tab stop and points at main", async () => {
    render(
      <>
        <SkipLink label="Skip to main content" />
        <button>Other</button>
      </>,
    );
    await userEvent.tab();
    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link).toHaveFocus();
    expect(link).toHaveAttribute("href", `#${MAIN_ID}`);
  });
});
