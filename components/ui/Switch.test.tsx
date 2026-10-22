import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { useState } from "react";
import { Switch } from "./Switch";

function RoughTotal() {
  const [on, setOn] = useState(false);
  return (
    <Switch checked={on} onChange={(event) => setOn(event.target.checked)}>
      Give a rough total instead
    </Switch>
  );
}

describe("Switch", () => {
  it("is a switch named by its label", () => {
    render(<RoughTotal />);
    expect(
      screen.getByRole("switch", { name: "Give a rough total instead" }),
    ).not.toBeChecked();
  });

  it("toggles with a click on the label", async () => {
    render(<RoughTotal />);
    await userEvent.click(screen.getByText("Give a rough total instead"));
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("toggles with Space", async () => {
    render(<RoughTotal />);
    await userEvent.tab();
    await userEvent.keyboard("[Space]");
    expect(screen.getByRole("switch")).toBeChecked();
    await userEvent.keyboard("[Space]");
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("has no axe violations", async () => {
    const { container } = render(<RoughTotal />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
