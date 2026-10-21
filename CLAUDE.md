# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Freshly bootstrapped with `create-next-app`; `app/page.tsx` and `app/layout.tsx` (including the `metadata` title/description) are still the template defaults. There is no budget logic, data layer, or test setup yet.

## Specification

Build from `docs/SPEC.md` (requirements, architecture, data formats) following `docs/PLAN.md` (one commit per step). `docs/reference/artifact.html` is the frozen prototype: the source for design, copy, translations and catalog data — never edit it.

## Commands

Package manager is **pnpm** (pinned via `packageManager` in `package.json`).

- `pnpm install` — install deps (`sharp` and `unrs-resolver` build scripts are intentionally ignored in `pnpm-workspace.yaml`)
- `pnpm dev` — dev server at http://localhost:3000
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)
- `pnpm exec tsc --noEmit` — type-check (no script defined for it)

No test runner is configured.

## Stack and non-default configuration

- **Next.js 16 App Router**, React 19, TypeScript strict. Import alias `@/*` maps to the repo root.
- `next.config.ts` enables options that change how code must be written:
  - `cacheComponents: true` — Cache Components mode. Dynamic data access (uncached fetches, `cookies()`, `headers()`, etc.) must sit under a `<Suspense>` boundary or be cached with the `"use cache"` directive; otherwise the build errors.
  - `reactCompiler: true` — React Compiler auto-memoizes, so manual `useMemo`/`useCallback`/`memo` is usually unnecessary.
  - `partialPrefetching: true`.
- **Tailwind CSS v4** is wired through Turbopack's `@tailwindcss/turbopack` CSS loader (in `next.config.ts`), not PostCSS — there is no `postcss.config` or `tailwind.config`. Theme tokens are defined in CSS via `@theme inline` in `app/globals.css` (`--color-background`, `--color-foreground`, Geist font variables), with dark mode driven by `prefers-color-scheme`.
- Route components use Next's global typed helpers (e.g. `LayoutProps<"/">`, `PageProps<...>`) rather than hand-written prop types.
