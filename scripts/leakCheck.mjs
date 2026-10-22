// Memory check (Spec §14, PLAN step 22): drives headless Chrome over the
// DevTools protocol through every step, Save and Open, several times per
// locale, and prints DOM/listener/heap counters after a forced GC per round.
// They must stay flat from round to round.
//
//   pnpm build && pnpm start -p 3123
//   node scripts/leakCheck.mjs [http://localhost:3123] [rounds=3]
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = process.argv[2] ?? "http://localhost:3123";
const ROUNDS = Number(process.argv[3] ?? 3);
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FIXTURE = path.resolve("features/files/__fixtures__/v2-full.json");
const PORT = 9333;

const profile = mkdtempSync(path.join(tmpdir(), "ssb-leak-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "about:blank",
]);

async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = targets.find((target) => target.type === "page");
      if (page) return new WebSocket(page.webSocketDebuggerUrl);
    } catch {}
    await sleep(200);
  }
  throw new Error("Chrome did not start");
}

const ws = await connect();
await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));
let nextId = 0;
const pending = new Map();
ws.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  const callback = pending.get(message.id);
  if (!callback) return;
  pending.delete(message.id);
  if (message.error) callback.reject(new Error(JSON.stringify(message.error)));
  else callback.resolve(message.result);
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

/** Runs `source` (an async function body) in the page. */
async function run(source) {
  const { result, exceptionDetails } = await send("Runtime.evaluate", {
    expression: `(async () => { ${source} })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description);
  return result.value;
}

const PAGE_HELPERS = `
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const until = async (test) => {
    for (let i = 0; i < 100; i++) { const v = test(); if (v) return v; await wait(50); }
    throw new Error("timed out: " + test);
  };
  const button = (text) => [...document.querySelectorAll("button")]
    .find((b) => b.textContent.trim() === text || b.getAttribute("aria-label") === text);
  const steps = () => document.querySelectorAll("nav[aria-label] ol button, nav[aria-label] button");
  const setValue = (input, value) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };
`;

/** One round: every step (adding a row and an amount on each bucket), Save, Open. */
async function round() {
  await run(`${PAGE_HELPERS}
    const count = steps().length;
    for (let i = 0; i < count; i++) {
      steps()[i].click();
      await wait(80);
      const chip = document.querySelector("main button[aria-label^='Add '], main button[aria-label^='Ajouter ']");
      if (chip) {
        chip.click();
        await wait(50);
        const amount = document.activeElement;
        if (amount instanceof HTMLInputElement) setValue(amount, "120");
      }
      await wait(80);
    }
    await until(() => document.querySelector("input[type=file]"));
  `);
  // Save from the File menu (the download is denied), then open the fixture
  // through the hidden input.
  await run(`${PAGE_HELPERS}
    document.querySelector("header button[aria-expanded]").click();
    await wait(50);
    [...document.querySelectorAll("header button")].find((b) => /Save budget|Enregistrer le budget/.test(b.textContent))?.click();
    await wait(100);
  `);
  const { root } = await send("DOM.getDocument", { depth: 0 });
  const { nodeId } = await send("DOM.querySelector", {
    nodeId: root.nodeId,
    selector: "input[type=file]",
  });
  await send("DOM.setFileInputFiles", { nodeId, files: [FIXTURE] });
  await run(`${PAGE_HELPERS} await wait(500);`);
}

async function counters() {
  await sleep(3000); // let toasts and the announcer time out
  await send("HeapProfiler.collectGarbage");
  await send("HeapProfiler.collectGarbage");
  const dom = await send("Memory.getDOMCounters");
  const heap = await send("Runtime.getHeapUsage");
  let detached = "n/a";
  try {
    detached = (await send("DOM.getDetachedDomNodes")).detachedNodes.length;
  } catch {}
  return {
    nodes: dom.nodes,
    listeners: dom.jsEventListeners,
    documents: dom.documents,
    detached,
    heapKB: Math.round(heap.usedSize / 1024),
  };
}

async function load(url) {
  await send("Page.navigate", { url });
  await run(`${PAGE_HELPERS} await until(() => document.querySelector("[aria-busy=false]"));`);
}

try {
  await send("Page.enable");
  await send("DOM.enable");
  await send("Browser.setDownloadBehavior", { behavior: "deny" });

  const report = [];
  for (const locale of ["en", "fr"]) {
    if (locale === "en") {
      await load(`${BASE}/en`);
    } else {
      // Switch language through the header link (a full page load).
      await run(`document.querySelector("a[hreflang='fr-CA']").click();`);
      await sleep(500);
      await run(`${PAGE_HELPERS} await until(() => location.pathname === "/fr" && document.querySelector("[aria-busy=false]"));`);
    }
    await round(); // warm-up: lazy chunks, caches, the first toast
    report.push({ locale, round: "warm-up", ...(await counters()) });
    for (let i = 1; i <= ROUNDS; i++) {
      await round();
      report.push({ locale, round: i, ...(await counters()) });
    }
  }
  console.table(report);
} finally {
  ws.close();
  chrome.kill();
  await sleep(300);
  rmSync(profile, { recursive: true, force: true });
}
