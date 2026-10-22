import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { renderWithI18n } from "@/test/renderWithI18n";
import { MoneyInput } from "./MoneyInput";

function Amount({
  initial = null,
  onChange = () => {},
}: {
  initial?: number | null;
  onChange?: (amount: number | null) => void;
}) {
  const [amount, setAmount] = useState(initial);
  return (
    <>
      <MoneyInput
        aria-label="Rent amount"
        value={amount}
        onValueChange={(next) => {
          setAmount(next);
          onChange(next);
        }}
      />
      <output>{String(amount)}</output>
    </>
  );
}

const setup = (locale: Locale, initial: number | null = null) => {
  const onChange = jest.fn();
  renderWithI18n(<Amount initial={initial} onChange={onChange} />, { locale });
  return { input: screen.getByRole("textbox", { name: "Rent amount" }), onChange };
};

describe("MoneyInput", () => {
  it("is a decimal text field with a placeholder", () => {
    const { input } = setup("en");
    expect(input).toHaveAttribute("inputmode", "decimal");
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveAttribute("placeholder", "0");
    expect(input).toHaveValue("");
  });

  it("shows the stored amount with the locale's decimal mark", () => {
    expect(setup("fr", 12.5).input).toHaveValue("12,5");
  });

  it("reports parsed amounts while typing in English", async () => {
    const { input, onChange } = setup("en");
    await userEvent.type(input, "1,234.5");
    expect(input).toHaveValue("1,234.5");
    expect(onChange).toHaveBeenLastCalledWith(1234.5);
    await userEvent.tab();
    expect(input).toHaveValue("1234.5");
  });

  it("keeps a trailing French comma while focused", async () => {
    const { input, onChange } = setup("fr");
    await userEvent.type(input, "12,");
    expect(input).toHaveValue("12,");
    expect(screen.getByRole("status")).toHaveTextContent("12");
    await userEvent.type(input, "50");
    expect(input).toHaveValue("12,50");
    expect(onChange).toHaveBeenLastCalledWith(12.5);
    await userEvent.tab();
    expect(input).toHaveValue("12,5");
  });

  it("does not report an unchanged amount", async () => {
    const { input, onChange } = setup("fr", 12);
    await userEvent.type(input, ",");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reports an empty field as no amount", async () => {
    const { input, onChange } = setup("en", 40);
    await userEvent.clear(input);
    expect(onChange).toHaveBeenLastCalledWith(null);
    await userEvent.tab();
    expect(input).toHaveValue("");
  });

  it("forwards focus and blur handlers", async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    renderWithI18n(
      <MoneyInput
        aria-label="Rent amount"
        value={null}
        onValueChange={() => {}}
        onFocus={onFocus}
        onBlur={onBlur}
      />,
    );
    await userEvent.tab();
    await userEvent.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it.each<Locale>(["en", "fr"])("has no axe violations (%s)", async (locale) => {
    const { container } = renderWithI18n(
      <MoneyInput aria-label="Rent amount" value={2350} onValueChange={() => {}} />,
      { locale },
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
