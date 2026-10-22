import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Pill } from "./Pill";
import { StatusBadge, type StatusLevel } from "./StatusBadge";

describe("StatusBadge", () => {
  it.each<[StatusLevel, string]>([
    ["green", "On track"],
    ["yellow", "A bit off"],
    ["red", "Needs attention"],
    ["none", "Not compared"],
  ])("pairs the %s colour with its text", (level, text) => {
    render(<StatusBadge level={level}>{text}</StatusBadge>);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <>
        <StatusBadge level="green">On track</StatusBadge>
        <StatusBadge level="red">Needs attention</StatusBadge>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Pill", () => {
  it("renders its text and forwards attributes", () => {
    render(
      <Pill tone="good" title="Saved to a file">
        Saved
      </Pill>,
    );
    expect(screen.getByText("Saved")).toHaveAttribute("title", "Saved to a file");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <>
        <Pill tone="good">Saved</Pill>
        <Pill tone="warn">Example</Pill>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
