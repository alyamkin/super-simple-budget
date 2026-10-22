import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Button } from "./Button";

describe("Button", () => {
  it("is a non-submitting button by default", () => {
    render(<Button>Next</Button>);
    expect(screen.getByRole("button", { name: "Next" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it.each(["Enter", " "])("activates with %p", async (key) => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Next</Button>);
    await userEvent.tab();
    await userEvent.keyboard(key === " " ? "[Space]" : "{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("forwards native attributes and the ref", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(
      <Button ref={ref} variant="primary" disabled aria-describedby="hint">
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-describedby", "hint");
    expect(ref.current).toBe(button);
  });

  it("has no axe violations in every variant", async () => {
    const { container } = render(
      <>
        <Button>Default</Button>
        <Button variant="primary">Primary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
