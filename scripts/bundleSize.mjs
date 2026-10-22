// Gzip sizes of the JS a locale page loads, measured from `.next` after
// `pnpm build` (Spec §14 budgets). Run: `node scripts/bundleSize.mjs`.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const NEXT = ".next";
const CHUNKS = path.join(NEXT, "static", "chunks");
const BUDGET = { firstLoad: 120, results: 140 };

const kB = (bytes) => (bytes / 1000).toFixed(1);
const gzip = (file) =>
  gzipSync(readFileSync(path.join(CHUNKS, file)), { level: 9 }).length;

/** Script chunks in a prerendered page, skipping `noModule` polyfills. */
function pageChunks(html) {
  return [...html.matchAll(/<script\b[^>]*>/g)]
    .map(([tag]) => tag)
    .filter((tag) => !/\bnoModule\b/i.test(tag))
    .map((tag) => /src="\/_next\/static\/chunks\/([^"]+\.js)"/.exec(tag)?.[1])
    .filter(Boolean);
}

const readPage = (name) =>
  pageChunks(readFileSync(path.join(NEXT, "server", "app", `${name}.html`), "utf8"));
const sizeOf = (chunks) => chunks.reduce((sum, chunk) => sum + gzip(chunk), 0);

// Next's own 404 page: the framework runtime every page pays for.
const framework = readPage("_not-found");

let failed = false;
const initial = new Set();
for (const locale of ["en", "fr"]) {
  const chunks = readPage(locale);
  chunks.forEach((chunk) => initial.add(chunk));
  const total = sizeOf(chunks);
  const app = sizeOf(chunks.filter((chunk) => !framework.includes(chunk)));
  failed ||= total / 1000 > BUDGET.firstLoad;
  console.log(
    `/${locale} first-load JS: ${kB(total)} kB gzip (budget ${BUDGET.firstLoad} kB)` +
      ` = framework ${kB(total - app)} kB + app ${kB(app)} kB`,
  );
}

// The results chunk is the on-demand chunk that carries Recharts.
const results = readdirSync(CHUNKS).filter(
  (file) =>
    file.endsWith(".js") &&
    !initial.has(file) &&
    readFileSync(path.join(CHUNKS, file), "utf8").includes("recharts-wrapper"),
);
const resultsSize = sizeOf(results);
failed ||= resultsSize / 1000 > BUDGET.results;
console.log(
  `results chunk (${results.join(", ")}): ${kB(resultsSize)} kB gzip (budget ${BUDGET.results} kB)`,
);

console.log("\nfirst-load chunks, largest first:");
[...initial]
  .map((chunk) => [chunk, gzip(chunk)])
  .sort(([, a], [, b]) => b - a)
  .forEach(([chunk, size]) => console.log(`  ${kB(size).padStart(6)} kB  ${chunk}`));

process.exitCode = failed ? 1 : 0;
