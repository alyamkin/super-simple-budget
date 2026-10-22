import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { useState } from "react";
import { SegmentedControl } from "./SegmentedControl";

const OPTIONS = [
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
] as const;

function View({ onChange = () => {} }: { onChange?: (v: string) => void }) {
  const [view, setView] = useState<"month" | "year">("month");
  return (
    <SegmentedControl
      label="Show amounts"
      options={OPTIONS}
      value={view}
      onValueChange={(value) => {
        setView(value);
        onChange(value);
      }}
    />
  );
}

describe("SegmentedControl", () => {
  it("is a named group of pressed/unpressed buttons", () => {
    render(<View />);
    expect(screen.getByRole("group", { name: "Show amounts" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Monthly" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Yearly" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("selects an option with the keyboard", async () => {
    const onChange = jest.fn();
    render(<View onChange={onChange} />);
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("year");
    expect(screen.getByRole("button", { name: "Yearly" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Monthly" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(<View />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
