import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { IconButton } from "./IconButton";
import { CloseIcon, TipIcon } from "./Icons";

describe("IconButton", () => {
  it("is named by its label, not its icon", () => {
    render(
      <IconButton label="Remove Rent">
        <CloseIcon />
      </IconButton>,
    );
    expect(
      screen.getByRole("button", { name: "Remove Rent" }),
    ).toBeInTheDocument();
  });

  it("exposes a disclosure state", async () => {
    function Tip() {
      return (
        <IconButton
          label="Tip for Rent"
          aria-expanded={false}
          aria-controls="tip-rent"
          onClick={(event) =>
            event.currentTarget.setAttribute("aria-expanded", "true")
          }
        >
          <TipIcon />
        </IconButton>
      );
    }
    render(<Tip />);
    const button = screen.getByRole("button", { name: "Tip for Rent" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <IconButton label="Remove Rent">
        <CloseIcon />
      </IconButton>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
