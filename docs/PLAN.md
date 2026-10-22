# Implementation plan

Small, reviewable steps. Each step = **one commit** (or one PR), leaves the app building and tests green, and points to the spec sections it implements. Work top to bottom; tick the step's box (`[x]`) in the same commit that implements it.

How to use with Claude Code: *"Implement PLAN step N"* — the step lists everything needed; the spec holds the details.

Commit message format: `feat|chore|test|docs(scope): summary` (Conventional Commits).

---

## Phase 0 — Foundations

### [x] 0. Spec
`docs(spec): add specification and implementation plan`
- Files: `docs/SPEC.md`, `docs/PLAN.md`, `docs/reference/artifact.html`, `CLAUDE.md` pointer.

### [x] 1. Test tooling
`chore(test): set up Jest, Testing Library and jest-axe` · Spec §2, §16
- Add dev deps: `jest`, `jest-environment-jsdom`, `@types/jest`, `ts-node` (for `jest.config.ts`), `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jest-axe`, `@types/jest-axe`.
- `jest.config.ts` via `next/jest` (`dir: "./"`, `testEnvironment: "jsdom"`, `coverageProvider: "v8"`, `setupFilesAfterEnv`, `moduleNameMapper` for `@/*`).
- `jest.setup.ts`: jest-dom + `toHaveNoViolations`.
- Scripts: `test`, `test:watch`, `test:coverage`, `typecheck`.
- One smoke test (`lib/classNames.ts` + test) to prove the pipeline.
- Update `CLAUDE.md` commands section.
- **Done when** `pnpm test` and `pnpm typecheck` pass.

### [x] 2. Design tokens and fonts
`feat(ui): add design tokens, fonts and base styles` · Spec §9.1, §9.3
- `app/globals.css`: artifact tokens (light/dark/`data-theme`), `@theme inline` mapping, base `body` styles, `:focus-visible` outline, reduced-motion rule, breakpoints.
- Fonts via `next/font/google` (Bricolage Grotesque, Atkinson Hyperlegible, IBM Plex Mono) as CSS variables; remove Geist.
- Replace template `page.tsx` with a placeholder that uses the tokens.
- **Done when** light/dark render with the artifact colours; no CLS from fonts.

### [x] 3. Locale routing and i18n core
`feat(i18n): add [lang] routing, proxy redirect and dictionary loader` · Spec §3.1, §5
- Move `app/layout.tsx` + `page.tsx` → `app/[lang]/`; `generateStaticParams` (`en`, `fr`), `hasLocale` guard → `notFound()` (`dynamicParams` is not allowed with Cache Components), `<html lang={regionalLocale(lang)}>`.
- `proxy.ts`: `/` → `/en|/fr` (cookie `NEXT_LOCALE`, `Accept-Language`).
- `i18n/config.ts`, `i18n/getDictionary.ts` (`server-only`), `i18n/translate.ts` (`t` with `{var}` templates, `plural` with cached `Intl.PluralRules`), `I18nProvider` + `useTranslator()` client hook.
- Dictionaries with **chrome strings only** for now (app name, subtitle, lang button, footer, meta). Remaining strings arrive with the features that use them.
- Tests: `translate` (interpolation, plural en/fr, missing var), `hasLocale`, en/fr key parity test (reused by later steps).
- **Done when** `/` redirects, `/en` and `/fr` prerender (`next build` shows ● static), `/de` 404s.

### [x] 4. Money and frequency utilities
`feat(domain): add frequency conversion, money formatting and parsing` · Spec §7.1, §7.6
- `domain/frequency.ts` (`TIMES_PER_YEAR`, `toMonthly`, `FREQUENCIES`) — ported from old `src/utils/utils.ts`.
- `lib/format.ts` (cached `Intl.NumberFormat`, `formatMoney`, `formatPercent`), `lib/parseAmount.ts` (ported from old `useInputAmount` as pure functions).
- Dictionary: frequency labels.
- Tests: every frequency; `parseAmount` cases `"1,234.50"` en, `"1 234,50"` fr (U+00A0 and U+202F), `"12,"`, `"abc"`, `""`, `"1e12"`, negative; format en/fr.

### [x] 5. Item catalog and its translations
`feat(domain): add item catalog, categories and buckets` · Spec §3.2, §7.2
- `domain/catalog/items.ts`, `categories.ts`, `buckets.ts` (steps, popular ids, estimable buckets, colour key), `retired.ts` (empty map).
- Dictionaries: `items.*`, `categories.*`, `fundTypes.*`, bucket titles/questions/ledes (EN from `D`/`T.en`, FR from `FR`/`T.fr`).
- Tests: ids unique; every item maps to exactly one bucket; every popular id exists and belongs to that bucket; every id has en+fr label; counts (16/9/79/15).

### [x] 6. Totals and rules of thumb
`feat(domain): add totals and rules of thumb` · Spec §7.3–7.5, §8
- `domain/totals.ts`, `domain/rules.ts` (cleaned table), `domain/results.ts` (checks list, top expenses, next steps, headline data), test fixture `domain/__fixtures__/exampleBudget.ts`.
- Dictionary: rule sentences, level names.
- Tests: example vector from §7.5; every rule band edge (exactly 15%, 15.01%…); zero-is-red; no income; estimated bucket excluded from checks and categories; top-5 with estimate entry; next-steps conditions.

## Phase 1 — State

### [x] 7. Redux store and slices
`feat(store): add budget and ui slices with typed hooks` · Spec §6.1–6.3
- Deps: `@reduxjs/toolkit`, `react-redux`.
- `store/makeStore.ts`, `store/hooks.ts`, `store/StoreProvider.tsx` (`useState(makeStore)`), mounted in `app/[lang]/layout.tsx`.
- `features/budget/budgetSlice.ts`, `features/budget/selectors.ts`, `features/wizard/uiSlice.ts` (incl. `changedAt` matcher).
- Initial state = empty budget, step 1.
- Tests: every reducer; custom id format; selectors memoisation (same reference for same input); totals selectors equal domain results.

### [x] 8. Backup schema, migrations and persistence
`feat(files): add versioned budget schema, migrations and local persistence` · Spec §6.4, §11.1–11.3
- `features/files/schema.ts` (types, `CURRENT_VERSION = 2`), `migrations/v1ToV2.ts`, `sanitize.ts`, `importJson.ts` (`parseBudgetFile(text) → Result`), `exportJson.ts` (`serializeBudget`).
- Golden fixtures (append-only): `v1-artifact.json` (artifact export of the example), `v2-full.json`, `v2-unknown-ids.json`, `v2-future-version.json`, `garbage.json`.
- `store/persistence.ts`: listener middleware per store, 400 ms debounce, flush on `pagehide`/`visibilitychange`/teardown, legacy key `bp-pickplan-v3` import, `hydrated` action dispatched after mount.
- Tests: fixtures; every sanitize rule; round-trip `serialize → parse` deep-equal; persistence with fake timers; **leak test** (mount/unmount 50×, no listeners or timers left).

## Phase 2 — UI

### [x] 9. UI primitives
`feat(ui): add accessible UI primitives` · Spec §9.2
- `components/ui/*`: Button, IconButton, Chip, Switch, SegmentedControl, Pill, StatusBadge, MoneyInput (draft-while-focused), FrequencySelect, Dialog, VisuallyHidden, Icons.
- Tests: roles/names/states; keyboard; MoneyInput fr comma typing; axe per component.

### [x] 10. App shell
`feat(app): add header, progress, step navigation and footer` · Spec §4.1, §4.2, §4.7, §12
- Server: `app/[lang]/page.tsx` renders header text, footer, skip link; client island `BudgetApp`.
- `Header` (brand + language link only), `LanguageLink`, `Progress`, `StepHeading` (focus + `document.title`), `StepNav`, `Footer`.
- Layout grid + responsive rules (tally placeholder).
- Tests: progress `aria-current`; clicking a step moves focus to `h2`; Next/Back labels; axe both locales.

### [ ] 11. Bucket step: rows and chip picker
`feat(budget): add picked rows and chip picker` · Spec §4.3, §4.3.1, §4.4
- `BucketStep`, `PickedPanel` (count heading, step total, savings badge), `Row` (catalog/custom, tip toggle, fund tag, remove), `ChipPicker` (popular, show more/fewer, something else).
- Focus rules after add/remove.
- Tests: pick → row appears and amount input focused; type amount updates step total; frequency change; tip toggle `aria-expanded`; remove focus target; custom row naming; axe empty/filled.

### [ ] 12. Item search and toasts
`feat(budget): add cross-bucket item search and toasts` · Spec §4.3 (5), §4.4, §4.8 (toasts)
- `lib/normalizeSearch.ts`, `ItemSearch` (local state, polite result count), `Toaster` (always-mounted live region, 2.4 s, key-based messages).
- Tests: accent-insensitive search in fr ("garderie", "epicerie"); max 10; already picked excluded; other-bucket add → toast "Added to …" and stays on step.

### [ ] 13. Rough-total estimates
`feat(budget): add rough-total estimate toggle` · Spec §4.3 (2), §7.3
- `EstimateToggle` + estimate row; rows hidden but kept.
- Tests: toggle on/off keeps rows; totals use estimate; switch accessible name/state.

### [ ] 14. Running tally and mobile bar
`feat(tally): add running total, mobile bar and balance announcer` · Spec §4.5
- `Tally`, `MobileBar`, `SegmentedControl` month/year, `BalanceAnnouncer` (1 s debounce, cleans up timer).
- Tests: yearly ×12; balance classes/text; announcer fires once after typing stops (fake timers); no timers after unmount.

## Phase 3 — Results

### [ ] 15. Results: headline, income flow, top expenses
`feat(results): add plan headline, income flow bar and biggest expenses` · Spec §4.6 (1–4), §8.1–8.2, §10.2–10.3
- Deps: `recharts`.
- `ResultsView` loaded with `next/dynamic` (`ssr: false`, skeleton); `usePrefersReducedMotion`; chart selectors; `IncomeFlowBar`, `TopExpenses` (Recharts, rules in Spec §10.0); ESLint `no-restricted-imports` for `recharts` outside `charts/`; `ResizeObserver` stub in `jest.setup.ts`.
- Tests: example headline text; no-income state; shortfall key item; top-5 subtitle and share sentence; chart wrappers `aria-hidden`; axe.

### [ ] 16. Results: spending donut
`feat(results): add spending donut chart` · Spec §8.3, §10.1
- `SpendingDonut` (Recharts `PieChart`, centre label, legend `<table>`), CSS empty ring.
- Tests: legend rows and percentages; chart wrapper `aria-hidden`; empty state; mount/unmount `ResultsView` 20× leaves no observers/timers; axe.

### [ ] 17. Results: rule-of-thumb comparison
`feat(results): add comparison with usual Canadian ranges` · Spec §4.6 (6), §7.4
- `CompareSection` (counts by level, rule rows with sentence + decorative bar, "not compared" note, empty states).
- Tests: example → insurance "Needs attention" first; rough buckets listed; no-income message.

### [ ] 18. Results: next steps and copy summary
`feat(results): add next steps and copy summary` · Spec §4.6 (7, 9), §4.9, §8.4
- `NextSteps`, `CopySummary` (clipboard + toasts), "← Edit".
- Tests: each tip condition; clipboard text en/fr (mock `navigator.clipboard`).

## Phase 4 — Files and safety

### [ ] 19. Save, open and CSV export
`feat(files): add JSON save/open and CSV export` · Spec §11, §4.6 (8)
- `lib/csv.ts` (escaping), `features/files/exportCsv.ts`, `lib/download.ts`, `FileBox`, tally file links, hidden file input via button.
- Tests: CSV exact output for example (en with `,`/`.`, fr with `;`/`,`), formula-injection escaping, BOM + CRLF; open valid/invalid/oversized file → state + toast; object URL revoked.

### [ ] 20. Unsaved notice, confirmations and budget actions
`feat(notices): add unsaved-changes notice, confirm dialog and budget actions` · Spec §4.8, §4.9
- `UnsavedNotice` (snooze 1 h), `ConfirmDialog` (native dialog, save-first flow), `useBeforeUnload`, "Clear budget" button in the file box; wire Clear and Open through the confirm dialog.
- Tests: dialog only when unsaved; save-first flow swaps body and primary action; Esc closes and restores focus; beforeunload registered only while unsaved and removed on unmount.

## Phase 5 — Ship

### [ ] 21. SEO
`feat(seo): add metadata, sitemap, robots, manifest, icons and JSON-LD` · Spec §13
- `generateMetadata` + `viewport`, `sitemap.ts`, `robots.ts`, `manifest.ts`, `icon.svg`, `apple-icon.png`, `[lang]/opengraph-image.tsx`, JSON-LD.
- `.env.example` with `NEXT_PUBLIC_SITE_URL`.
- Tests: metadata objects per locale (alternates, canonical); sitemap entries.

### [ ] 22. Hardening and audit
`chore: accessibility, performance and memory audit` · Spec §12, §14, §17
- Run axe across all states in both locales; fix findings. Contrast check for all token pairs (light/dark).
- `next build` bundle sizes vs budgets; Lighthouse mobile on `/en` and `/fr`; record numbers in `docs/audit.md`.
- Chrome DevTools heap snapshot: go through all steps 3×, switch language, open/save files — detached DOM nodes and listener count must not grow.
- `docs/a11y-checklist.md` (manual screen-reader script); README rewrite.

---

## Dependency summary (added over the plan)

| Step | Runtime | Dev |
| --- | --- | --- |
| 1 | — | jest, jest-environment-jsdom, @types/jest, ts-node, @testing-library/{react,dom,user-event,jest-dom}, jest-axe, @types/jest-axe |
| 3 | server-only | — |
| 7 | @reduxjs/toolkit, react-redux | — |
| 15 | recharts | — |
