/**
 * @jest-environment node
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { compile } from "tailwindcss";

// Tailwind guesses what an arbitrary `text-[…]` value is: a bare number such
// as `text-[0]` compiles to `color: 0` instead of a font size, silently. Every
// such class in the source must produce a `font-size` (or carry a type hint).
// Variants don't change how the value is read, so only the utility is built.

const root = path.join(__dirname, "..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)
      ? [full]
      : [];
  });
}

const candidates = [
  ...new Set(
    ["app", "components", "features"]
      .flatMap((dir) => sourceFiles(path.join(root, dir)))
      .flatMap((file) =>
        [...readFileSync(file, "utf8").matchAll(/\btext-\[[^\]\s]+\]/g)].map(
          ([candidate]) => candidate,
        ),
      ),
  ),
];

const utilities = readFileSync(
  path.join(root, "node_modules/tailwindcss/utilities.css"),
  "utf8",
);

/** The CSS for one class; a fresh compiler, since `build` accumulates. */
async function cssFor(candidate: string): Promise<string> {
  const { build } = await compile('@import "tailwindcss/utilities";', {
    loadStylesheet: async (_id, base) => ({
      path: "",
      base,
      content: utilities,
    }),
  });
  return build([candidate]);
}

describe("arbitrary text-[…] classes", () => {
  it("finds some", () => {
    expect(candidates.length).toBeGreaterThan(0);
  });

  it.each(candidates)("%s compiles to a font size", async (candidate) => {
    expect(await cssFor(candidate)).toMatch(/font-size:/);
  });

  it("catches a bare number", async () => {
    expect(await cssFor("text-[0]")).not.toMatch(/font-size:/);
  });
});
