/**
 * @jest-environment node
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { contrastRatio } from "@/lib/contrast";

/** Spec §12: text ≥ 4.5:1, UI boundaries and focus ≥ 3:1, in both themes. */
const css = readFileSync(path.join(__dirname, "globals.css"), "utf8");

function tokensIn(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  const block = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries(
    [...block.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6});/g)].map(
      ([, name, value]) => [name, value],
    ),
  );
}

const light = tokensIn(":root");
const themes = {
  light,
  dark: { ...light, ...tokensIn(':root[data-theme="dark"]') },
};

type Pair = [foreground: string, background: string];

/** Text colours on the surfaces they are used on. */
const TEXT: Pair[] = [
  ["ink", "bg"],
  ["ink", "surface"],
  ["ink", "accent-soft"],
  ["ink", "warn-soft"],
  ["muted", "bg"],
  ["muted", "surface"],
  ["muted", "accent-soft"], // estimate hint
  ["muted", "warn-soft"],
  ["accent", "bg"],
  ["accent", "surface"],
  ["accent", "accent-soft"], // even balance, custom tag
  ["good", "surface"],
  ["good", "good-soft"],
  ["warn", "surface"],
  ["warn", "warn-soft"],
  ["bad", "surface"],
  ["bad", "bad-soft"],
  ["surface", "accent"], // primary button, pressed segment
  ["bg", "ink"], // toast
];

/** Focus rings, control boundaries and states. */
const UI: Pair[] = [
  ["accent", "bg"],
  ["accent", "surface"],
  ["accent", "accent-soft"],
  ["line-strong", "bg"], // field border
  ["line-strong", "surface"],
  ["line-strong", "accent-soft"], // switch track (off)
  ["surface", "line-strong"], // switch knob (off)
  ["surface", "accent"], // switch knob (on)
];

describe.each(Object.entries(themes))("%s theme", (_, tokens) => {
  it("defines every token used below", () => {
    for (const name of [...TEXT, ...UI].flat()) {
      expect(tokens[name]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it.each(TEXT)("text %s on %s is at least 4.5:1", (fg, bg) => {
    expect(contrastRatio(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(UI)("UI %s against %s is at least 3:1", (fg, bg) => {
    expect(contrastRatio(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(3);
  });
});

it("keeps the media-query dark theme in sync with data-theme", () => {
  expect(tokensIn(':root:not([data-theme="light"])')).toEqual(
    tokensIn(':root[data-theme="dark"]'),
  );
});
