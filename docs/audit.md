# Audit — accessibility, performance and memory

PLAN step 22 · Spec §12, §14, §17 · run on 2026-10-22 against a production build (`pnpm build && pnpm start`), Next.js 16.4.2, React 19.3.0, Chrome 155.

Re-run:

```sh
pnpm build && pnpm start -p 3123        # in one terminal
node scripts/bundleSize.mjs            # bundle sizes vs the §14 budgets (exit 1 when over)
npx lighthouse@13.5.0 http://localhost:3123/en --chrome-flags="--headless=new" --view
node scripts/leakCheck.mjs http://localhost:3123 3
pnpm test features/app/BudgetApp.a11y app/contrast
```

## Summary

| Check | Target | Result |
| --- | --- | --- |
| axe, every screen state, both locales | 0 violations | **Pass** (jest-axe, plus Lighthouse Accessibility 100) |
| Contrast, all token pairs, light + dark | text ≥ 4.5:1, UI ≥ 3:1 | **Pass** after two token fixes |
| First-load JS `/en`, `/fr` | ≤ 120 kB gzip | **179.9 kB: over budget.** The framework alone is 136.1 kB, see below |
| Results chunk (Recharts) | ≤ 140 kB gzip | **Pass**: 100.2 kB, loaded on demand and prefetched on the last bucket step |
| Lighthouse mobile SEO / A11y / Best Practices | 100 / 100 / 100 | **Pass**: 100 / 100 / 100 on both locales |
| Lighthouse mobile Performance | ≥ 95 | **Not met**: 71–85 (see below) |
| CLS | < 0.02 | **Pass**: 0 |
| LCP (Lighthouse, simulated) | < 2.0 s | **Not met**: 2.2–3.7 s simulated; 0.3–0.65 s observed |
| Memory: steps ×3, language switch, save/open | no growth in DOM nodes / listeners | **Pass**: flat; 0 detached nodes |

## Accessibility

**Automated.** `features/app/BudgetApp.a11y.test.tsx` runs axe on every step (1–7 and results) of an empty budget and of a filled one (the `v2-full` fixture: custom rows, rough totals, unsaved changes), plus the Clear-budget confirm dialog, in English and French. That makes 34 axe runs, all with 0 violations. Component tests already cover the remaining states with axe: search results, toasts, tally views, the unsaved notice, copy summary and file actions. jsdom has no layout, so axe skips colour contrast there. Lighthouse's axe run in Chrome checks contrast and scored Accessibility 100 on `/en` and `/fr`.

**Contrast.** `app/contrast.test.ts` reads the tokens from `app/globals.css` and checks every text/background pair the components use, plus focus rings and control boundaries, in both themes. It also checks that the `prefers-color-scheme` dark block and the `data-theme="dark"` block stay identical. Two of the artifact's tokens failed:

| Finding | Fix |
| --- | --- |
| Light `--muted` #5a6f75 on `--accent-soft` (estimate hint) was 4.45:1 | `--muted` → #566b71 (4.72:1; 5.17:1 on `--bg`) |
| Field borders and the switch's off-state track used `--line`: 1.21:1 on `--bg`, 1.32:1 on `--surface` (WCAG 1.4.11 needs 3:1 to identify a control) | New token `--line-strong` (light #74888d, dark #6b8989) for the `field` utility border and the `Switch` track; `--line` stays for dividers and card borders |

| Kind | Pair | Light | Dark |
| --- | --- | --- | --- |
| text | `ink` on `bg` | 13.80 | 15.02 |
| text | `ink` on `surface` | 14.98 | 13.37 |
| text | `ink` on `accent-soft` | 12.58 | 10.70 |
| text | `ink` on `warn-soft` | 13.16 | 11.47 |
| text | `muted` on `bg` | 5.17 | 7.40 |
| text | `muted` on `surface` | 5.62 | 6.59 |
| text | `muted` on `accent-soft` | 4.72 | 5.27 |
| text | `muted` on `warn-soft` | 4.94 | 5.66 |
| text | `accent` on `bg` | 5.74 | 8.17 |
| text | `accent` on `surface` | 6.24 | 7.27 |
| text | `accent` on `accent-soft` | 5.24 | 5.81 |
| text | `good` on `surface` | 5.35 | 8.08 |
| text | `good` on `good-soft` | 4.64 | 6.82 |
| text | `warn` on `surface` | 5.43 | 8.50 |
| text | `warn` on `warn-soft` | 4.77 | 7.29 |
| text | `bad` on `surface` | 6.54 | 6.92 |
| text | `bad` on `bad-soft` | 5.38 | 6.56 |
| text | `surface` on `accent` (primary button) | 6.24 | 7.27 |
| text | `bg` on `ink` (toast) | 13.80 | 15.02 |
| UI | `accent` (focus ring) on `bg` / `surface` / `accent-soft` | 5.74 / 6.24 / 5.24 | 8.17 / 7.27 / 5.81 |
| UI | `line-strong` on `bg` / `surface` / `accent-soft` | 3.42 / 3.72 / 3.12 | 4.70 / 4.18 / 3.35 |
| UI | switch knob `surface` on `line-strong` / `accent` | 3.72 / 6.24 | 4.18 / 7.27 |

Bucket colours (`--b-*`) only appear in decorative, `aria-hidden` graphics: the stack bar, chart segments and legend dots. Their values are always given as text next to them, so they are not held to 1.4.11. `--b-everyday` is 2.4:1 on white.

**Manual.** The per-release screen-reader script is [`a11y-checklist.md`](./a11y-checklist.md).

## Performance

### Bundle sizes (`node scripts/bundleSize.mjs`, gzip -9)

| | Size | Budget |
| --- | --- | --- |
| `/en` and `/fr` first-load JS (excluding `noModule` polyfills) | **179.9 kB** | 120 kB |
| … Next.js + React runtime (what Next's bare 404 page loads) | 136.1 kB | |
| … app code (store, catalog, wizard, tally, i18n) | 43.7 kB | |
| Results chunk (Recharts + results view) | **100.2 kB** | 140 kB |

The 120 kB first-load budget can't be met on this stack. react-dom alone is 71.8 kB and Next's client runtime is 45.6 kB. The app adds 43.7 kB on top of an empty Next page. **Proposed:** restate the §14 budget as "app code ≤ 50 kB gzip on top of the framework runtime", or as "first-load JS ≤ 185 kB gzip". This needs the owner's decision, so the spec is unchanged for now.

### Lighthouse (mobile, simulated throttling, Lighthouse 13.5.0)

| Run | Locale | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| single run, before the font change | `/en` | 85 | 100 | 100 | 100 | 1.1 s | 2.2 s | 540 ms | 0 |
| single run, before the font change | `/fr` | 80 | 100 | 100 | 100 | 1.1 s | 3.7 s | 400 ms | 0 |
| median of 5, after | `/en` | 71 | 100 | 100 | 100 | 1.1 s | 3.4 s | 1,360 ms | 0 |
| median of 5, after | `/fr` | 78 | 100 | 100 | 100 | 1.1 s | 3.3 s | 770 ms | 0 |

These numbers are noisy. The audit machine was under heavy load (load average ≈ 18; Lighthouse `benchmarkIndex` 1,100–1,400), and TBT moved between 400 ms and 1,360 ms across runs of the same build. Re-run on a quiet machine, or with PageSpeed Insights once deployed, before drawing conclusions. What is consistent:

- **Observed** LCP equals FCP at 0.3–0.65 s. The LCP element is the step lede, and it is in the static HTML. Lighthouse's *simulated* LCP is longer because it counts the JS that loads before hydration.
- TBT comes from one long task: evaluating react-dom and hydrating the island (350–890 ms at 4× CPU slowdown). There is also a 75–345 ms document task that parses the inline RSC payload (37 kB, mostly the dictionary the client needs for `t()`). The page has only 186 elements.
- CLS is 0. No render-blocking resources except the one CSS file.

Changes made in this step:

- **Results chunk prefetch** (§14, was missing): `usePrefetchResults()` in `LazyResultsView.tsx` fetches the chunk on `requestIdleCallback` (falling back to `setTimeout` on Safari) while the last bucket step is open.
- **Font preloads 8 → 3**: `subsets: ["latin"]` instead of `["latin", "latin-ext"]` (the `subsets` option only chooses what is *preloaded*; the latin-ext faces are still declared and download through `unicode-range` when needed), and `preload: false` on IBM Plex Mono (numbers only). The run-to-run noise above is too large to show the effect in the score.

Candidates for a follow-up, if the ≥ 95 target stays:

1. Ship only the client-side strings in the RSC payload (the dictionary minus server-only sections such as `meta`, `footer`), which trims the inline payload.
2. Keep the step heading and lede server-rendered and outside the client island, so hydration has less to do and LCP no longer waits on it.
3. Look at what the 17–19 kB app chunks contain (RTK listener middleware, catalog) with a bundle analyser.

## Memory (`node scripts/leakCheck.mjs`)

Headless Chrome, driven over the DevTools protocol. Each round goes through all 8 steps (adding a row and an amount on each bucket), saves the file (download denied) and opens `v2-full.json` through the file input. After each round it waits for toasts to clear, runs GC twice and reads `Memory.getDOMCounters`, `DOM.getDetachedDomNodes` and `Runtime.getHeapUsage`. The language switch goes through the header link (a full page load, because each locale has its own root layout).

| Locale | Round | DOM nodes | JS listeners | Documents | Detached nodes | JS heap |
| --- | --- | --- | --- | --- | --- | --- |
| en | warm-up | 863 | 2,253 | 1 | 0 | 8,458 kB |
| en | 1 | 863 | 2,108 | 1 | 0 | 8,819 kB |
| en | 3 | 863 | 2,108 | 1 | 0 | 9,088 kB |
| en | 8 | 863 | 2,108 | 1 | 0 | 9,526 kB |
| fr | warm-up | 1,619 | 3,909 | 1 | 0 | 12,043 kB |
| fr | 1 | 1,619 | 3,909 | 1 | 0 | 12,116 kB |
| fr | 3 | 1,619 | 3,909 | 1 | 0 | 12,186 kB |
| fr | 8 | 1,619 | 3,909 | 1 | 0 | 12,360 kB |

(`fr` has more nodes because it opens with the saved fixture budget on the results step, where `en` starts empty.)

DOM nodes, listeners and detached nodes stay flat. The JS heap grows less with each round: from about 360 kB per round down to 20–60 kB. A heap-snapshot diff between rounds 2 and 8 puts the growth almost entirely in V8 JIT code (`InstructionStream`, `FeedbackVector`, `Code`: about 0.5 MB) and Chrome's bounded performance-timeline entries (`LayoutShift`, long-animation-frame timings). App objects grew by 132 plain `Object`s (3 kB). No leak was found.

The Jest leak test (`store/StoreProvider.test.tsx`, Spec §14.9) still guards the store side: 50 mounts leave no live listeners and no timers.
