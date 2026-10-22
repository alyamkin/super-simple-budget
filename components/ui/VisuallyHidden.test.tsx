import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { DownloadIcon, SearchIcon, SheetIcon, UploadIcon } from "./Icons";
import { VisuallyHidden } from "./VisuallyHidden";

describe("VisuallyHidden", () => {
  it("adds text to the accessible name of its parent", () => {
    render(
      <a href="https://example.com">
        Credit <VisuallyHidden>(opens in a new tab)</VisuallyHidden>
      </a>,
    );
    expect(
      screen.getByRole("link", { name: "Credit (opens in a new tab)" }),
    ).toBeInTheDocument();
  });
});

describe("Icons", () => {
  it("are hidden from assistive technology", async () => {
    const { container } = render(
      <button type="button">
        <DownloadIcon />
        <UploadIcon />
        <SheetIcon />
        <SearchIcon />
        Save budget
      </button>,
    );
    for (const svg of container.querySelectorAll("svg")) {
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(svg).toHaveAttribute("stroke", "currentColor");
    }
    expect(screen.getByRole("button", { name: "Save budget" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
