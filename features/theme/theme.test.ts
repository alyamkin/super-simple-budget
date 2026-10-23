import {
  applyTheme,
  chooseTheme,
  currentTheme,
  storedTheme,
  THEME_STORAGE_KEY,
  themeScript,
} from "./theme";

function systemIsDark(dark: boolean) {
  window.matchMedia = jest.fn(
    (query: string) => ({ matches: dark, media: query }) as MediaQueryList,
  );
}

function addThemeColorMetas() {
  document.head.innerHTML = `
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f3f6f7">
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0e1a1d">`;
}

function themeColors() {
  return [
    ...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
  ].map((meta) => meta.content);
}

afterEach(() => {
  delete (window as Partial<Window>).matchMedia;
  delete document.documentElement.dataset.theme;
  document.head.innerHTML = "";
  localStorage.clear();
});

describe("currentTheme", () => {
  it("follows the system without an override", () => {
    expect(currentTheme()).toBe("light");
    systemIsDark(true);
    expect(currentTheme()).toBe("dark");
  });

  it("prefers data-theme", () => {
    systemIsDark(true);
    document.documentElement.dataset.theme = "light";
    expect(currentTheme()).toBe("light");
  });
});

describe("storedTheme", () => {
  it("ignores unknown values", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "sepia");
    expect(storedTheme()).toBeNull();
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    expect(storedTheme()).toBe("dark");
  });
});

describe("applyTheme", () => {
  it("points both theme-color metas at the forced theme", () => {
    addThemeColorMetas();
    applyTheme("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(themeColors()).toEqual(["#0e1a1d", "#0e1a1d"]);
  });

  it("restores them when the override goes", () => {
    addThemeColorMetas();
    applyTheme("dark");
    applyTheme(null);
    expect(document.documentElement).not.toHaveAttribute("data-theme");
    expect(themeColors()).toEqual(["#f3f6f7", "#0e1a1d"]);
  });
});

describe("chooseTheme", () => {
  it("remembers a theme that differs from the system's", () => {
    chooseTheme("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("goes back to following the system when choosing its theme", () => {
    chooseTheme("dark");
    chooseTheme("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(document.documentElement).not.toHaveAttribute("data-theme");
  });

  it("still switches when storage is blocked", () => {
    const setItem = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    chooseTheme("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    setItem.mockRestore();
  });
});

describe("themeScript", () => {
  it("applies the saved theme", () => {
    addThemeColorMetas();
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    new Function(themeScript)();
    expect(document.documentElement.dataset.theme).toBe("dark");
    document.dispatchEvent(new Event("DOMContentLoaded"));
    expect(themeColors()).toEqual(["#0e1a1d", "#0e1a1d"]);
  });

  it("does nothing without a valid saved theme", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "sepia");
    new Function(themeScript)();
    expect(document.documentElement).not.toHaveAttribute("data-theme");
  });
});
