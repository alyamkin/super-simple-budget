import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithI18n } from "@/test/renderWithI18n";
import { THEME_STORAGE_KEY } from "./theme";
import { ThemeToggle } from "./ThemeToggle";

afterEach(() => {
  delete document.documentElement.dataset.theme;
  localStorage.clear();
});

describe("ThemeToggle", () => {
  it("toggles the dark theme and remembers it", async () => {
    const user = userEvent.setup();
    renderWithI18n(<ThemeToggle />);
    const toggle = screen.getByRole("button", { name: "Dark theme" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement).not.toHaveAttribute("data-theme");
  });

  it("follows a choice made in another tab", async () => {
    renderWithI18n(<ThemeToggle />);
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    // The MutationObserver callback is a microtask.
    await act(async () => {
      fireEvent(window, new StorageEvent("storage", { key: THEME_STORAGE_KEY }));
    });
    expect(screen.getByRole("button", { name: "Dark theme" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("is named in French", async () => {
    const { container } = renderWithI18n(<ThemeToggle />, { locale: "fr" });
    expect(
      screen.getByRole("button", { name: "Thème sombre" }),
    ).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
