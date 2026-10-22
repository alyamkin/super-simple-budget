import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import type { Frequency } from "@/domain/frequency";
import { renderWithI18n } from "@/test/renderWithI18n";
import { FrequencySelect } from "./FrequencySelect";

describe("FrequencySelect", () => {
  it("lists the 8 frequencies with the selected one chosen", () => {
    renderWithI18n(
      <FrequencySelect
        aria-label="Rent frequency"
        value="Monthly"
        onValueChange={() => {}}
      />,
    );
    const select = screen.getByRole("combobox", { name: "Rent frequency" });
    expect(within(select).getAllByRole("option")).toHaveLength(8);
    expect(select).toHaveDisplayValue("Monthly");
  });

  it("names the options in French", () => {
    renderWithI18n(
      <FrequencySelect
        aria-label="Fréquence du loyer"
        value="Annually"
        onValueChange={() => {}}
      />,
      { locale: "fr" },
    );
    expect(screen.getByRole("combobox")).toHaveDisplayValue("Chaque année");
  });

  it("reports the chosen frequency", async () => {
    const onValueChange = jest.fn<void, [Frequency]>();
    renderWithI18n(
      <FrequencySelect
        aria-label="Rent frequency"
        value="Monthly"
        onValueChange={onValueChange}
      />,
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Every 2 weeks");
    expect(onValueChange).toHaveBeenCalledWith("Every2Weeks");
  });

  it("has no axe violations", async () => {
    const { container } = renderWithI18n(
      <FrequencySelect
        aria-label="Rent frequency"
        value="Weekly"
        onValueChange={() => {}}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
