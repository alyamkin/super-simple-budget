# Super Simple Budget

A free, private, bilingual (English / French, Canada) monthly budget planner. Tap the things you pay for, enter each amount the way it arrives (weekly, every two weeks, yearly…) and get a monthly plan compared with usual Canadian spending ranges.

- **Tap, don't type**: items are picked from chips, and only amounts are typed.
- **One question per screen**: a 7-step wizard, then a results page with charts, a rule-of-thumb comparison and next steps.
- **Private**: no accounts, no server, no analytics on budget data. The budget lives in the browser's `localStorage`. Save it as a `.json` file to keep or move it, or export a `.csv` for a spreadsheet.
- **Accessible**: WCAG 2.2 AA, built for keyboard and screen readers, works one-handed on a phone.

## Stack

Next.js 16 (App Router, Cache Components, React Compiler) · React 19 · TypeScript strict · Redux Toolkit · Tailwind CSS v4 · Recharts (results only, code-split) · Jest + React Testing Library + jest-axe.

Each locale (`/en`, `/fr`) is one statically prerendered page. The wizard step is app state, not a URL.

## Getting started

Requires Node.js 20.9+ and pnpm (the version is pinned in `package.json`).

```sh
pnpm install
pnpm dev            # http://localhost:3000
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to the public origin. Canonical URLs, Open Graph, the sitemap and robots use it. It falls back to `http://localhost:3000`.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build / serve it |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Jest (`pnpm test path/or/pattern`, `pnpm test -t "name"`) |
| `pnpm test:watch` / `pnpm test:coverage` | Watch mode / coverage report |
| `node scripts/bundleSize.mjs` | Gzip sizes of first-load JS and the results chunk vs the budgets (after `pnpm build`) |
| `node scripts/leakCheck.mjs [url] [rounds]` | Memory check in headless Chrome against a running build |

Each step is done when `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` all pass.

## Project layout

```
app/[lang]/        root layout (metadata, fonts, providers) and the page shell
domain/            pure budget logic: catalog, frequencies, totals, rules, results
features/          app, budget, wizard, tally, results, files, notices, seo
components/ui/     stateless UI primitives
store/             Redux store, typed hooks, localStorage persistence
i18n/              typed en/fr dictionaries, t() and plural()
lib/               small helpers (formatting, parsing, CSV, downloads…)
```

## Documentation

- [`docs/SPEC.md`](docs/SPEC.md): requirements, architecture and data formats
- [`docs/PLAN.md`](docs/PLAN.md): the step-by-step build plan
- [`docs/audit.md`](docs/audit.md): accessibility, performance and memory audit
- [`docs/a11y-checklist.md`](docs/a11y-checklist.md): manual screen-reader checklist for each release
- [`docs/reference/artifact.html`](docs/reference/artifact.html): the frozen prototype (design, copy and catalog source)

Spending ranges are adapted from the Financial Consumer Agency of Canada's [Budget Planner](https://itools-ioutils.fcac-acfc.gc.ca/BP-PB/budget-planner). This project is not affiliated with the FCAC and is not financial advice.

## License

[MIT](LICENSE)
