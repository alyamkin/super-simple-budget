# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Early build-out following `docs/PLAN.md`, steps 1–9 done: Jest tooling, design tokens/fonts, locale routing + i18n core, money/frequency utilities (`domain/frequency.ts`, `lib/format.ts`, `lib/parseAmount.ts`), the item catalog (`domain/catalog/`; item/category/bucket text lives in the dictionaries) and the pure results logic (`domain/budget.ts` types, `totals.ts`, `rules.ts`, `results.ts`; locale-free — they return data and dictionary keys, the UI formats). The Redux store (step 7): `store/rootReducer.ts` (`combineSlices`, `RootState`, `createAppSelector`), `store/makeStore.ts`, typed hooks in `store/hooks.ts`, `StoreProvider` mounted in `app/[lang]/layout.tsx`; slices `features/budget/budgetSlice.ts` and `features/wizard/uiSlice.ts` keep simple lookups in their `selectors` field. Derived data lives in `features/budget/selectors.ts`: memoised `createAppSelector`s over the domain functions, `perBucket` for parametric selectors (one cache per bucket), and `resultEqualityCheck` so ids/chips/picks keep their reference while the user types amounts — follow that pattern for new derived data. Files and persistence (step 8): `features/files/` holds the v2 file format (`schema.ts`), append-only migrations (`migrations/vNToVN+1.ts`, registered in `importJson.ts`'s `MIGRATIONS`), `sanitize.ts` (repairs, never throws) and `importJson.ts`/`exportJson.ts`; golden fixtures in `features/files/__fixtures__/` are append-only. `store/persistence.ts` (`startPersistence`, called from `StoreProvider`'s effect) reads `localStorage` through the same import pipeline, dispatches `hydrated` (`store/hydrated.ts`, handled by both slices) and saves via a listener added to the per-store listener middleware (debounced, flushed on `pagehide`/hidden/cleanup); `StoreProvider` must sit inside `I18nProvider` (it writes item labels). UI primitives (step 9) live in `components/ui/` (one component per file, no barrel): stateless, forward native props/`ref` via `ComponentPropsWithRef`, style with token utilities plus `max-tablet:`/`pointer-coarse:` variants; `MoneyInput` and `FrequencySelect` read the locale/labels from `useTranslator()`, so render them in tests with `renderWithI18n` (`test/renderWithI18n.tsx`). `jest.setup.ts` stubs `HTMLDialogElement.showModal`/`close` (jsdom lacks them). `app/[lang]/page.tsx` is still a placeholder; no screens yet.

## Specification

Build from `docs/SPEC.md` (requirements, architecture, data formats) following `docs/PLAN.md` (one commit per step). `docs/reference/artifact.html` is the frozen prototype: the source for design, copy, translations and catalog data — never edit it.

## Commands

Package manager is **pnpm** (pinned via `packageManager` in `package.json`).

- `pnpm install` — install deps (`sharp`, `unrs-resolver` and `@parcel/watcher` build scripts are intentionally ignored in `pnpm-workspace.yaml`)
- `pnpm dev` — dev server at http://localhost:3000
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)
- `pnpm typecheck` — type-check (`tsc --noEmit`)
- `pnpm test` / `pnpm test:watch` / `pnpm test:coverage` — Jest
- Single test: `pnpm test lib/classNames.test.ts` or `pnpm test -t "test name"`

Tests use Jest via `next/jest` (`jest.config.ts`, jsdom by default; pure `domain/`/`lib/` tests opt into node with a `@jest-environment node` docblock), React Testing Library + user-event, and `jest-axe`. `jest.setup.ts` registers jest-dom matchers and `toHaveNoViolations`. Test files sit next to the code as `*.test.ts(x)`.

## Stack and non-default configuration

- **Next.js 16 App Router**, React 19, TypeScript strict. Import alias `@/*` maps to the repo root.
- `next.config.ts` enables options that change how code must be written:
  - `cacheComponents: true` — Cache Components mode. Dynamic data access (uncached fetches, `cookies()`, `headers()`, etc.) must sit under a `<Suspense>` boundary or be cached with the `"use cache"` directive; otherwise the build errors.
  - `reactCompiler: true` — React Compiler auto-memoizes, so manual `useMemo`/`useCallback`/`memo` is usually unnecessary.
  - `partialPrefetching: true`.
- **Tailwind CSS v4** is wired through Turbopack's `@tailwindcss/turbopack` CSS loader (in `next.config.ts`), not PostCSS — there is no `postcss.config` or `tailwind.config`. Design tokens (copied from the artifact) live on `:root` in `app/globals.css` and are exposed via `@theme inline` as utilities (`bg-surface`, `text-ink`, `border-line`, `bg-b-home`, `font-display`/`font-body`/`font-mono`, `rounded-card`, `phone:`/`tablet:` breakpoints) — no hard-coded hex in components. Reusable class bundles are Tailwind `@utility` rules in `globals.css` (`btn`, `field`; built with `@apply`/`@variant`), not TS string constants — they accept variants and sort before plain utilities, so a single utility can override them; a property that a variant inside the utility changes (e.g. `field`'s 16px font below the tablet breakpoint) is set through a CSS variable (`[--field-text:.95rem]`) instead. Dark mode follows `prefers-color-scheme` unless `<html data-theme="light|dark">` overrides it. Fonts (Bricolage Grotesque, Atkinson Hyperlegible, IBM Plex Mono) come from `next/font/google` in `app/layout.tsx`.
- **Locales** (`en`, `fr`): the root layout lives in `app/[lang]/` (there is no `app/layout.tsx`). `proxy.ts` redirects `/` only. `dynamicParams` is not allowed with Cache Components, so `[lang]` layouts/pages guard with `hasLocale(lang)` → `notFound()`. Copy lives in typed dictionaries `i18n/dictionaries/{en,fr}.ts` (`fr: Dictionary`, key parity tested); servers call `getDictionary(lang)` (`server-only`), clients use `useTranslator()` from `I18nProvider` (`t("a.b", vars)` with `{var}` templates, `plural(key, n)`).
- Route components use Next's global typed helpers (e.g. `LayoutProps<"/">`, `PageProps<...>`) rather than hand-written prop types.
