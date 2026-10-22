import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Chip } from "./Chip";

describe("Chip", () => {
  it("shows a decorative + on add chips", () => {
    render(<Chip aria-label="Add Rent">Rent</Chip>);
    const chip = screen.getByRole("button", { name: "Add Rent" });
    expect(chip).toHaveTextContent("+Rent");
  });

  it("has no + on more chips", () => {
    render(<Chip variant="more">Show 4 more</Chip>);
    expect(screen.getByRole("button", { name: "Show 4 more" })).toHaveTextContent(
      /^Show 4 more$/,
    );
  });

  it("activates from the keyboard", async () => {
    const onClick = jest.fn();
    render(
      <Chip aria-label="Add Rent" onClick={onClick}>
        Rent
      </Chip>,
    );
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <>
        <Chip aria-label="Add Rent">Rent</Chip>
        <Chip variant="more" aria-expanded={false}>
          Show 4 more
        </Chip>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
