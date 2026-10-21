# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Early build-out following `docs/PLAN.md`: Jest tooling (step 1), design tokens/fonts (step 2) and locale routing + i18n core (step 3) are in; `app/[lang]/page.tsx` is a placeholder rendering header/footer chrome from the dictionaries. There is no budget logic or data layer yet.

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
- Single test: `pnpm test lib/cn.test.ts` or `pnpm test -t "test name"`

Tests use Jest via `next/jest` (`jest.config.ts`, jsdom by default; pure `domain/`/`lib/` tests opt into node with a `@jest-environment node` docblock), React Testing Library + user-event, and `jest-axe`. `jest.setup.ts` registers jest-dom matchers and `toHaveNoViolations`. Test files sit next to the code as `*.test.ts(x)`.

## Stack and non-default configuration

- **Next.js 16 App Router**, React 19, TypeScript strict. Import alias `@/*` maps to the repo root.
- `next.config.ts` enables options that change how code must be written:
  - `cacheComponents: true` — Cache Components mode. Dynamic data access (uncached fetches, `cookies()`, `headers()`, etc.) must sit under a `<Suspense>` boundary or be cached with the `"use cache"` directive; otherwise the build errors.
  - `reactCompiler: true` — React Compiler auto-memoizes, so manual `useMemo`/`useCallback`/`memo` is usually unnecessary.
  - `partialPrefetching: true`.
- **Tailwind CSS v4** is wired through Turbopack's `@tailwindcss/turbopack` CSS loader (in `next.config.ts`), not PostCSS — there is no `postcss.config` or `tailwind.config`. Design tokens (copied from the artifact) live on `:root` in `app/globals.css` and are exposed via `@theme inline` as utilities (`bg-surface`, `text-ink`, `border-line`, `bg-b-home`, `font-display`/`font-body`/`font-mono`, `rounded-card`, `phone:`/`tablet:` breakpoints) — no hard-coded hex in components. Dark mode follows `prefers-color-scheme` unless `<html data-theme="light|dark">` overrides it. Fonts (Bricolage Grotesque, Atkinson Hyperlegible, IBM Plex Mono) come from `next/font/google` in `app/layout.tsx`.
- **Locales** (`en`, `fr`): the root layout lives in `app/[lang]/` (there is no `app/layout.tsx`). `proxy.ts` redirects `/` only. `dynamicParams` is not allowed with Cache Components, so `[lang]` layouts/pages guard with `hasLocale(lang)` → `notFound()`. Copy lives in typed dictionaries `i18n/dictionaries/{en,fr}.ts` (`fr: Dictionary`, key parity tested); servers call `getDictionary(lang)` (`server-only`), clients use `useT()` from `I18nProvider` (`t("a.b", vars)` with `{var}` templates, `plural(key, n)`).
- Route components use Next's global typed helpers (e.g. `LayoutProps<"/">`, `PageProps<...>`) rather than hand-written prop types.
