import { render } from "@testing-library/react";
import { THEME_STORAGE_KEY } from "./theme";
import { ThemeSync } from "./ThemeSync";

afterEach(() => {
  delete document.documentElement.dataset.theme;
  localStorage.clear();
});

describe("ThemeSync", () => {
  it("restores the saved theme after <html> lost its attributes", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    render(<ThemeSync />);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("leaves the system theme alone without a saved choice", () => {
    render(<ThemeSync />);
    expect(document.documentElement).not.toHaveAttribute("data-theme");
  });
});
