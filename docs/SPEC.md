# Super Simple Budget — Specification

Status: **v1 draft** · Owner: Andrey Lyamkin · Implementation plan: [`PLAN.md`](./PLAN.md)

This is the single source of truth for building the app. Every implementation step in `PLAN.md` refers back to a section here, so a step can be picked up without extra context.

**Reference design:** [`docs/reference/artifact.html`](./reference/artifact.html) is a frozen copy of the prototype artifact (claude.ai/artifact/XqoBTH1cfpLaTX9ovCt3VC). It is the source for **design, copy, translations and data**. Do not edit it. Line numbers below refer to that file.

| What | Where in `artifact.html` |
| --- | --- |
| Design tokens, layout, breakpoints (CSS) | lines 5–270 |
| Markup skeleton | lines 271–291 |
| Item catalog `D` (income, savings, expenses, categories, rules) | line 293 |
| French item/category/fund-type text `FR` | line 294 |
| UI strings `T.en` / `T.fr` | lines 304–447 |
| Rule-of-thumb sentences `ruleText` | lines 460–472 |
| Buckets, steps, popular items `BUCKETS` | lines 474–486 |
| Example budget `EXAMPLE` (test fixture only, §7.5) | lines 488–502 |
| Totals, rules, results, charts, files | lines 518–763 |

---

## 1. Product

A free, private, bilingual (English / French, Canada) budget planner. The user taps the things they pay for, enters amounts in whatever frequency they arrive, and gets a monthly plan compared with usual Canadian spending ranges.

Principles:

1. **Tap, don't type.** Items are picked from chips; only amounts are typed.
2. **One question per screen.** A 7-step wizard plus a results screen.
3. **Private by default.** No accounts, no server, no analytics on budget data. Data lives in `localStorage`; the user can save/open a `.json` file and export a `.csv`.
4. **Inclusive.** WCAG 2.2 AA, great screen-reader flow, works one-handed on a phone.
5. **Fast.** Static HTML per locale, small JS, no layout shift.

Out of scope for v1: an example/demo budget in the UI (decided 2026-10-21 — first visit starts empty), accounts/sync, multiple budgets, currencies other than CAD, CSV import, dark-mode toggle (dark mode follows the OS).

---

## 2. Tech stack

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | **Next.js 16 App Router** (already bootstrapped) | `cacheComponents`, `reactCompiler`, `partialPrefetching` stay on. |
| Language | TypeScript strict | No `any`. Prefer `type` over `interface` for data; discriminated unions for variants. |
| State | **Redux Toolkit 2 + react-redux 9** | Per-client store via `makeStore` (see §6). |
| Forms | **No React Hook Form.** | There is no submit; every field writes straight to the store on input. RHF would duplicate the store. Revisit only if a real submit form appears. |
| Styling | **Tailwind CSS v4** via `@tailwindcss/turbopack` | Tokens in `app/globals.css` `@theme`. No CSS-in-JS. |
| Charts | **Recharts 3** for the Results charts (donut, income flow, biggest expenses) | Code-split with the Results view. See §10. |
| Fonts | `next/font/google`: Bricolage Grotesque (display), Atkinson Hyperlegible (body), IBM Plex Mono (numbers) | Self-hosted at build time, `display: swap`, no CLS. Replace Geist. |
| Tests | **Jest** (`next/jest`) + React Testing Library + `@testing-library/user-event` + `@testing-library/jest-dom` + `jest-axe` | jsdom environment. |
| Lint | ESLint flat config (existing) | Add `eslint-plugin-jsx-a11y` rules via `eslint-config-next` (already included) — keep warnings at zero. |

Dependencies we deliberately **do not** add: lodash (native JS is enough), moment/date-fns (only "N days ago"), zod (hand-written tolerant parsers are simpler for "accept anything, repair what we can" — §11), i18n frameworks (two locales, typed dictionaries are enough — §5), Chart.js (canvas, not accessible — §10).

---

## 3. Information architecture

### 3.1 Routes

| URL | Purpose | Rendering |
| --- | --- | --- |
| `/` | Redirects to `/en` or `/fr` | `proxy.ts`: cookie `NEXT_LOCALE`, then `Accept-Language` (`fr*` → `fr`), default `en`. 307 redirect. |
| `/en`, `/fr` | The app | Statically prerendered (`generateStaticParams` → `en`, `fr`). `dynamicParams = false` is rejected under Cache Components, so layout and page guard with `hasLocale()` → `notFound()`. |
| anything else under `/[lang]` | 404 | `notFound()` |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, icons, OG image | SEO | Metadata file conventions (§13). |

The wizard step is **app state, not a URL** (as in the artifact). The page is one static document per locale; this keeps it fully prerenderable under Cache Components (no `searchParams`).

### 3.2 Steps

`STEPS = ["income", "savings", "home", "around", "everyday", "family", "debt", "results"]` (8 steps; "Step n of 8").

Each non-results step is a **bucket**:

| Bucket | Expense categories | Rough total allowed | Colour token | Popular chips (in order) |
| --- | --- | --- | --- | --- |
| `income` | — (all income items) | no | — | myNetIncome, spouseNetIncome, selfEmploymentIncome, gigIncome, childBenefits, employmentInsurance, federalPension |
| `savings` | — (all savings items, category `savings`) | no | `--b-save` | emergencyFund, tfsa, retirement, fhsa, education, homePurchase, incomeTax |
| `home` | housing, communications, insurance, fees | yes | `--b-home` | rent, mortgage, electricity, heating, internet, telephone, tenantInsurance, homeInsurance, subscriptions, bankFees |
| `around` | transportation | yes | `--b-around` | carPayments, carInsurance, gas, transitPass, maintenance, parking, rideServices |
| `everyday` | food, medical, clothing, personalCare | yes | `--b-everyday` | groceries, restaurants, prescriptions, clothes, hairdresser, dentist |
| `family` | childcare, education, recreation, pets, giftsDonations | yes | `--b-family` | daycare, tuition, travel, memberships, tickets, petFood, gifts, donations |
| `debt` | debt | no | `--b-debt` | creditCard, lineOfCredit, studentLoan, personalLoan |

`OUTGOING_BUCKETS = ["savings", "home", "around", "everyday", "family", "debt"]`.

Every catalog item belongs to exactly one bucket (derived from its category). Search can add an item to a bucket other than the current one (§4.4).

---

## 4. Screens and behaviour

Visual reference: run the artifact or read its CSS. Layout: header → (unsaved notice) → progress → two-column grid (`main` + 300px sticky `aside` tally) → footer. At ≤860px the tally is replaced by a fixed bottom bar.

### 4.1 Header

- Brand mark (inline SVG from artifact line 277, `aria-hidden`), `h1` app name, subtitle (hidden ≤600px).
- **No budget actions in the header.** Save / Open / Export / Clear live in the results file box (§4.6) and Save / Export also in the tally (§4.5).
- **Language switch**: a `<Link>` to the other locale (`/fr` ↔ `/en`) with text "Français"/"English", `lang` attribute of the target language, `aria-label` "Afficher en français"/"Show in English", `hrefLang`. Switching language keeps the budget (it is in `localStorage`, §6.4).

### 4.2 Progress

`<nav aria-label="Progress">` with an ordered list of 8 buttons. Completed steps: accent bar at 55% opacity; current step: `aria-current="step"`, bold. Any step is clickable. ≤860px: text hidden visually (font-size 0) but each button keeps its accessible name and a ≥44px tap target.

### 4.3 Bucket step (steps 1–7)

Top to bottom:

1. Eyebrow "Step {n} of {total} · {bucket title}", `h2` question, lede (strings `T.*.b[bucket]`).
2. **Rough-total toggle** (only buckets with "rough total allowed"): switch "Give a rough total instead" + hint. When on, the item list is replaced by one row: "About how much on {bucket}?" + money input + frequency select. Picked items are kept (not deleted) and come back when toggled off.
3. **Picked panel**: heading = count text (`count.income/savings/debt/other`) or "Nothing added yet"; step total right-aligned (`$X/mo`). On `savings` also a status badge "{p} of income" coloured by the savings rule. Rows (§4.3.1) or the empty hint.
4. **Picker**: heading "Anything else?" (if any picked) or "Tap what applies"; chips for popular, not-yet-picked items; "Show {n} more" / "Show fewer" chip; "+ Something else" chip adds a custom row and focuses its name input.
5. **Search** (`type="search"`): matches label + help text across **all** items, accent- and case-insensitive (`NFD` + strip combining marks), excludes already-picked, max 10 results. Result chips show "· {bucket}" when the item belongs to another bucket. Empty result: "No match. Use “Something else” to add your own."
6. **Nav bar**: "← Back" (hidden on step 1) and primary "Next: {next bucket} →" / "See my plan →" on the last bucket.

#### 4.3.1 Row

Grid: label · money input · frequency select · tip button (if the item has a tip) · remove button. ≤600px: label spans the top line with the two icon buttons; input and select on the second line.

- Catalog label is a `<label for>` the amount input; help text below it in `small`; fund-type tag (RRSP/RESP/TFSA/FHSA — French REER/REEE/CELI/CELIAPP; none for cash savings).
- Custom row: text input "Name this item" (`aria-label` "Item name"), max 80 chars.
- Money input: `inputmode="decimal"`, `$` prefix (suffix in French), placeholder `0`, right-aligned mono. Accessible name "{label} amount".
- Frequency select: 8 options (§7.1), default = item's default frequency. Name "{label} frequency".
- Tip: toggle button with `aria-expanded` + `aria-controls`; reveals a tip line under the row.
- Remove: "Remove {label}". Removing deletes the row and its amount (matches artifact). Focus moves to the next row's remove button, else the previous one, else the picker heading.

### 4.4 Picking

- Clicking a chip adds the row to the item's own bucket with an empty amount and the item's default frequency.
- Same bucket: re-render, clear search, focus the new row's amount input.
- Other bucket: stay, show toast "Added to {bucket}", refresh search results.
- Any data edit sets `changedAt` (§4.8).

### 4.5 Tally (desktop `aside aria-label="Running total"`)

- `h3` "Your plan" + segmented control (`role="group"` "Show amounts": Monthly / Yearly, `aria-pressed`).
- Income line; one line per outgoing bucket with colour dot, title, "rough" marker when estimated, amount.
- Stacked bar (decorative, `aria-hidden`), base = max(income, outgoing).
- Balance box: "Left over" (good) / "Shortfall" (bad) / zero (accent); threshold ±0.5.
- File line: "Last saved to a file: today/yesterday/N days ago" or "Not saved to a file yet"; link buttons "Save budget", "Export to spreadsheet".

**Mobile bar** (≤860px, fixed bottom, safe-area padding): Income · Planned · Left/Short (coloured) + a button toggling `/mo` ↔ `/yr`.

Screen reader: a single visually-hidden `aria-live="polite"` region announces "{Left over|Shortfall} {amount} per month" **1 s after the last amount edit** (debounced, not on every keystroke).

### 4.6 Results (step 8)

Order of sections (all amounts follow the Monthly/Yearly view unless noted):

1. Eyebrow "Your plan"; `h2`: "Add your income to see your plan" | "You have {x} left each month" | "You're {x} short each month" (always monthly).
2. Lede: "Of the {income} that comes in each month, you plan to spend {spend} and save {save}, which is {p} of your income." + "{n} categories are outside the usual range for Canadians." | "Every category you itemized is within the usual range…"; or "Your plan needs income to compare against."
3. **Where your income goes** — flow bar (§10.2).
4. **Your biggest expenses** — top 5 horizontal bars (§10.3).
5. **Where your money goes** — donut + legend (§10.1).
6. **How your plan compares** — rule-of-thumb list (§8).
7. **Next steps** — tips (§8.4). *(Strings exist in the artifact but the section was not rendered there; we render it.)*
8. **Keep your budget** — file box: Save budget (.json), Open budget (.json), Export to spreadsheet (.csv) (§11); below them a secondary "Clear budget" button (§4.9).
9. Nav: "← Edit" (goes to the last bucket step) and primary "Copy summary" (§4.9).

### 4.7 Footer

"About this tool" `h2`; privacy + advice sentence; credit link to the FCAC Budget Planner (EN `https://itools-ioutils.fcac-acfc.gc.ca/BP-PB/budget-planner`, FR `…/planificateur-budgetaire`, `target="_blank" rel="noopener"`, with visually-hidden "(opens in a new tab)"); non-affiliation sentence. Rendered on the server.

### 4.8 Unsaved changes, confirmations, toasts

- `unsaved = changedAt !== null`. `changedAt` is set on the first edit after a file save/open and cleared by saving or opening a file.
- **Notice** (below header) when unsaved and not snoozed: title "Changes not saved to a file", body, buttons "Save budget" / "Later" (snooze 1 hour).
- **Confirm dialog** before *Clear budget* and *Open budget* when unsaved: native `<dialog>` opened with `showModal()` (focus trap, Esc, inert background for free). Buttons: "Save budget first" (→ on success the body becomes "Budget saved. You can continue safely." and the primary becomes "Clear my budget" / "Choose a file to open"), "Continue without saving", "Cancel". Focus returns to the invoking button on close.
- `beforeunload` prompt when unsaved.
- **Toasts**: one live region (`role="status"`) that is **always in the DOM**; message replaced, auto-hide after 2.4 s. Toast state stores a message *key + params*, not text, so it survives a language switch.

### 4.9 Actions

| Action | Result |
| --- | --- |
| Clear budget | Empty budget, step 1, `changedAt=null`, toast "Started a blank budget". Ghost/link button "Clear budget" under the file box actions (results only). |
| Copy summary | Clipboard text: "My budget plan (monthly)", "Income: $x.xx", one line per outgoing bucket (+" (rough)"), "Left over/Shortfall: $x.xx". Toast "Summary copied" / "Copy isn't available here." |
| Save / Open / Export | §11. |

---

## 5. Internationalisation

- Locales: `en` → `en-CA`, `fr` → `fr-CA`. `<html lang>` and `Intl` use the regional locale (`regionalLocale()`).
- Config: `i18n/config.ts` exports `locales`, `defaultLocale`, `hasLocale()`, `regionalLocale()`.
- **Dictionaries are plain serialisable data** (`i18n/dictionaries/en.ts`, `fr.ts`, typed by `Dictionary = typeof en`; `fr` must satisfy it). This lets a Server Component load the dictionary with `getDictionary(lang)` (`import "server-only"`) and pass **only the active locale** to the client `I18nProvider`.
- Artifact strings that are functions become templates:
  - Interpolation: `"Step {n} of {total} · {name}"` → `t("stepOf", { n, total, name })`.
  - Plurals: `{ one: "{n} source of income", other: "{n} sources of income" }` resolved with a cached `Intl.PluralRules(locale)`.
- Item, category and fund-type text live in the dictionaries under `items.{id}.{label,help,tip}`, `categories.{id}`, `fundTypes.{code}` (English from `D`, French from `FR`). A unit test asserts both dictionaries have exactly the same keys and that every catalog id has a label.
- Artifact strings **not used** (no example budget, no header actions): `example`, `startOwn`, `saved`, `yourBudget`, `clear`, `loadExample`, `exLoaded`, `actExample`. Add `clearBudget` ("Clear budget" / "Effacer le budget").
- French typography: keep the artifact's non-breaking spaces (U+00A0) before `:` `;` `?` `!` `%` and inside « ». Currency/percent come from `Intl` (which uses U+202F in fr-CA) — never hand-format them.
- Lower-casing helpers from the artifact (`listName`, `roughQ`, `tStartWith`) are locale-dependent: implement as `toLocaleLowerCase(locale)` in EN only; FR wraps names in « » instead (see `T.fr.listName`).

---

## 6. State management

### 6.1 Store

```ts
// store/makeStore.ts
export const makeStore = () => {
  const persistence = createPersistenceListener(); // new instance per store
  const store = configureStore({
    reducer: { budget: budgetSlice.reducer, ui: uiSlice.reducer },
    middleware: (gDM) => gDM().prepend(persistence.middleware),
  });
  persistence.start(store); // returns cleanup; see §6.4
  return store;
};
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
```

- `StoreProvider` (`"use client"`): `const [store] = useState(makeStore)` — never a module singleton (would leak between server requests), never created during render.
- Typed hooks: `useAppSelector = useSelector.withTypes<RootState>()`, `useAppDispatch = useDispatch.withTypes<AppDispatch>()` (pattern reused from the old repo).
- Components select the **smallest** slice (`selectRow(id)`, `selectBucketTotal(bucket)`), so typing in one row re-renders only that row and the tally.

### 6.2 `budget` slice — persisted, exported

```ts
type Frequency = "Daily" | "Weekly" | "Every2Weeks" | "TwiceMonthly" | "Monthly" | "Quarterly" | "Every6Months" | "Annually";
type BucketId = "income" | "savings" | "home" | "around" | "everyday" | "family" | "debt";
type EstimableBucketId = "home" | "around" | "everyday" | "family";

type Row =
  | { kind: "catalog"; id: ItemId; amount: number | null; frequency: Frequency }
  | { kind: "custom"; id: CustomId; label: string; amount: number | null; frequency: Frequency };

type Estimate = { enabled: boolean; amount: number | null; frequency: Frequency };

type BudgetState = {
  rows: Record<BucketId, Row[]>;               // order = display order
  estimates: Partial<Record<EstimableBucketId, Estimate>>;
};
```

- `amount: null` = empty field (shown as placeholder), distinct from `0`.
- Amount bounds: `0 ≤ amount < 1e9`, max 2 decimals (rounded on parse).
- `CustomId` = `"c_" + 10 base-36 chars` from `crypto.getRandomValues`.
- Actions: `rowAdded({ itemId })` (bucket derived from the item; already picked → no-op), `customRowAdded({ bucket })` (id generated in `prepare`), `rowRemoved`, `amountChanged`, `frequencyChanged`, `customLabelChanged` (rows addressed by `{ bucket, id }`), `estimateToggled({ bucket, enabled })`, `estimateAmountChanged`, `estimateFrequencyChanged`, `budgetReplaced(BudgetState)` (open file / clear / hydrate). Every data edit stamps `meta.at = Date.now()` in `prepare` (reducers stay pure); the `isBudgetEdit` matcher (`isAnyOf`) lets `ui` set `changedAt` from it.

### 6.3 `ui` slice — persisted (except transient bits), not exported

```ts
type UiState = {
  step: number;                       // 0..7
  view: "month" | "year";
  showAllChips: Partial<Record<BucketId, boolean>>;
  lastFileSaveAt: number | null;      // epoch ms
  changedAt: number | null;
  noticeSnoozedUntil: number | null;
  toast: { id: number; key: ToastKey; params?: Record<string, string> } | null; // transient
  hydrated: boolean;                                                             // transient
};
```

Search query and tip open/closed are **local component state**, not Redux.

A matcher in `ui` reacts to every data-editing `budget/*` action (except `budgetReplaced`) to set `changedAt ??= now`.

### 6.4 Persistence (`localStorage`)

- Key `ssb:state`. Value `{ "schema": 2, "budget": <file payload §11.1 without app/savedAt>, "ui": {step, view, showAllChips, lastFileSaveAt, changedAt, noticeSnoozedUntil} }`.
- Read through the **same tolerant parser and migrations as file import** (§11.3). Unreadable → ignored (start empty).
- **Initial state is an empty budget** on step 1 (no example).
- **Hydration without mismatch:** server and first client render use the empty budget (deterministic; step 1 chips are crawlable). After mount, `StoreProvider` reads storage once and dispatches `hydrated(payload)`. The interactive region carries `aria-busy="true"` until `hydrated`.
- Writes: listener middleware with predicate "budget or persisted ui changed", **debounced 400 ms**, wrapped in `try/catch` (quota, private mode).
- **Flush** pending writes on `pagehide`, on `visibilitychange → hidden`, and in the store cleanup (language switch remounts the `[lang]` layout).
- Also legacy read of the artifact key `bp-pickplan-v3` once (migrated via v1 path), then removed. If that stored state has `isExample: true` it is the artifact's demo — ignore it.

---

## 7. Domain logic (pure TypeScript, no React — `domain/`)

### 7.1 Frequencies

Reused from old repo `src/utils/utils.ts` (`multipliers`, renamed `SemiMonthly` → `TwiceMonthly`):

```ts
export const TIMES_PER_YEAR: Record<Frequency, number> = {
  Daily: 365, Weekly: 52, Every2Weeks: 26, TwiceMonthly: 24,
  Monthly: 12, Quarterly: 4, Every6Months: 2, Annually: 1,
};
export const toMonthly = (amount: number, f: Frequency) => (amount * TIMES_PER_YEAR[f]) / 12;
```

Labels from `T.*.freq` (EN "Every 2 weeks", "Twice a month", "Every 3 months", "Yearly"…).

### 7.2 Catalog

`domain/catalog/` holds **ids and structure only** (text lives in dictionaries):

```ts
type CatalogItem = { id: ItemId; category: CategoryId | "savings" | null;   // null = income
                     defaultFrequency: Frequency; fundType?: "RRSP" | "RESP" | "TFSA" | "FHSA" };   // no tag for cash savings
```

Extract from artifact `D` (line 293): 16 income, 9 savings, 79 expense items, 15 categories. `ItemId`/`CategoryId` are string-literal unions generated by `as const` arrays. Derived maps: `ITEMS_BY_ID`, `BUCKET_OF_ITEM`, `ITEMS_BY_BUCKET`. Item help and tip are dictionary strings that may be empty (`""` = none); en and fr agree on which are empty (tested).

**Catalog stability rule:** ids are a public contract (they appear in saved files). Never rename or delete an id; to retire one, add it to `RETIRED_ITEMS` with either a replacement id or `null` (→ becomes a custom row, §11.3).

### 7.3 Totals (`domain/totals.ts`)

`computeTotals(budget) → { income, byBucket, byCategory, savings, debt, outgoing, spending, balance }` (all monthly):

- `income` = Σ monthly(income rows).
- For each outgoing bucket: if estimate enabled → monthly(estimate) and **no category contribution**; else Σ rows, and each row adds to `byCategory[item.category]`; custom rows add to `savings` in the savings bucket, `debt` in the debt bucket, nothing elsewhere.
- `outgoing = Σ byBucket`, `spending = outgoing − savings`, `balance = income − outgoing`.
- Exposed through memoised selectors (`createSelector`); view multiplier (×12 for yearly) is applied only at display time.

### 7.4 Rules of thumb (`domain/rules.ts`)

Cleaned from artifact `D.rules` (share of monthly income `p = amount / income`):

| Category | Green | Yellow | Red | Zero is red |
| --- | --- | --- | --- | --- |
| savings | p ≥ 5% | 0 < p < 5% | p = 0 | yes |
| debt | ≤ 15% | ≤ 30% | > 30% | |
| housing | ≤ 35% | ≤ 43% | > 43% | |
| communications | ≤ 5% | ≤ 15% | > 15% | |
| food | ≤ 20% | ≤ 30% | > 30% | yes |
| insurance | ≤ 3% | ≤ 9% | > 9% | yes |
| transportation | ≤ 20% | ≤ 30% | > 30% | |
| childcare | ≤ 14% | ≤ 25% | > 25% | |
| education | ≤ 8% | ≤ 17% | > 17% | |
| recreation | ≤ 15% | ≤ 30% | > 30% | |
| personalCare | ≤ 2% | ≤ 10% | > 10% | |
| clothing | ≤ 5% | ≤ 20% | > 20% | yes |
| medical | ≤ 5% | ≤ 20% | > 20% | |
| pets | ≤ 2% | ≤ 10% | > 10% | |
| fees | ≤ 2% | ≤ 10% | > 10% | |
| giftsDonations | ≤ 5% | ≤ 20% | > 20% | |

`evaluateRule(category, amount, income) → { level: "green"|"yellow"|"red", share } | null`:
- `income ≤ 0` → `null`.
- `p = 0` → red if "zero is red", else `null`.
- Otherwise compare `p` against the bands above.

**Checks shown on results**: for every non-estimated bucket, for each of its categories (and `savings` for the savings bucket): include if a rule result exists and (`amount > 0` or level is red). Sort red → yellow → green, then amount desc. "Outside the usual range" = non-green count. Estimated buckets are listed in "Not compared because you gave a rough total: …".

Sentences (`ruleText`, artifact lines 460–472) become dictionary templates keyed `rule.savings.zero|green|under`, `rule.zero`, `rule.green|yellow|red` with `{edge}` = green edge formatted as percent.

Rule bar scale (decorative): `scale = max(0.3, share × 1.15, greenEdge × 2)`; fill = `min(share/scale, 1)`; marker at `greenEdge/scale`.

### 7.5 Example budget (test fixture only)

Not shown in the app. Kept as `domain/__fixtures__/exampleBudget.ts` because it exercises every bucket, frequencies and a rough total. From artifact `EXAMPLE` (line 488). Test vector (monthly, en-CA):

| | Amount |
| --- | --- |
| Income | 8,666.67 |
| Home | 2,717.50 |
| Getting around | 1,031.00 |
| Everyday living | 1,456.67 |
| Family, fun and giving (rough total) | 450.00 |
| Debt | 540.00 |
| Savings | 600.00 (6.9% → green) |
| Outgoing | 6,795.17 |
| **Balance** | **1,871.50** → "You have $1,872 left each month" |
| Flagged | 1 (insurance = 0 → red) |

### 7.6 Formatting and parsing (`lib/format.ts`, `lib/parseAmount.ts`)

- `formatMoney(n, locale, { decimals = 0 })` and `formatPercent(ratio, locale, { decimals = 0 })` with a **module-level cache** of `Intl.NumberFormat` per `(locale, options)` key — not hooks (replaces old `useCurrencyFormatter`/`usePercentFormatter`; React Compiler makes hooks pointless here).
- `parseAmount(input, locale) → number | null`: pure function. Ignore `$` and spaces (incl. U+00A0/U+202F); in `en` commas are thousands separators, in `fr` `,` is the decimal mark; `.` is a decimal mark in both. One decimal mark at most, truncate to 2 decimals, clamp to `< 1e9`. Anything else (letters, signs, exponents) or empty → `null`.
- Money input keeps a **local draft string while focused** (so "12," in French is not lost) and commits `parseAmount(draft)` on every input; on blur it re-renders from the stored number.

---

## 8. Results content rules

### 8.1 Headline and lede — §4.6.

### 8.2 Top expenses
List = each estimated bucket as one entry "{bucket} (rough total)" + each row of non-estimated outgoing buckets except savings, with value > 0. Sort desc, take 5. Subtitle "{n} of {m} items". Text: if more items than shown "These {n} make up {p} of your spending…" else "Your largest costs, from highest to lowest." Each bar: label, amount `/mo|/yr`, "{p} of income" (1 decimal) when income > 0. Bar colour = bucket colour; width relative to the largest.

### 8.3 Donut
Segments in order Home, Getting around, Everyday, Family, Debt, Savings (non-zero only). Centre: "Planned/mo" + total. Legend: dot, name, % of planned, amount.

### 8.4 Next steps (max 4, in this order)
1. No income → "Add your income" + body (button goes to step 1).
2. Balance < 0 → "Close a gap of {x} a month" + "Start with {first flagged category}, which is above the usual range." or "Start with your largest bucket…".
3. Balance > 0.5 → "Give your {x} surplus a job" + body.
4. `emergencyFund` not picked → "Start an emergency fund" + body.
5. Any rough totals → "Itemize your rough totals when you can" + "You estimated {list}…".

Rendered as `<ul>` of `.tip` cards (`h3` + `p`).

---

## 9. Design system

### 9.1 Tokens (`app/globals.css`)

Copy the artifact `:root` tokens 1:1 (light + dark). Dark applies under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`, and under `:root[data-theme="dark"]` (hook for a future toggle). Expose them to Tailwind:

```css
@theme inline {
  --color-bg: var(--bg); --color-surface: var(--surface); --color-ink: var(--ink); --color-muted: var(--muted);
  --color-line: var(--line); --color-accent: var(--accent); --color-accent-soft: var(--accent-soft);
  --color-good: var(--good); --color-good-soft: var(--good-soft); --color-good-mid: var(--good-mid);
  --color-warn: var(--warn); --color-warn-soft: var(--warn-soft); --color-bad: var(--bad); --color-bad-soft: var(--bad-soft);
  --color-b-home: var(--b-home); --color-b-around: var(--b-around); --color-b-everyday: var(--b-everyday);
  --color-b-family: var(--b-family); --color-b-debt: var(--b-debt); --color-b-save: var(--b-save);
  --font-display: var(--font-bricolage); --font-body: var(--font-atkinson); --font-mono: var(--font-plex-mono);
  --radius-card: 12px;
  --breakpoint-phone: 600px; --breakpoint-tablet: 860px;
}
```

Use utilities (`bg-surface text-ink border-line`) — no hard-coded hex in components. Bucket colours are looked up through a typed map `BUCKET_COLOR: Record<OutgoingBucketId, string>` returning the CSS variable.

### 9.2 Components (`components/ui/`)

Small, stateless, typed props, forward native attributes (`ComponentPropsWithRef<"button">`), no business logic:
`Button` (variants `default | primary | ghost | link`), `Chip` (`add | more`), `Switch` (native checkbox, `role="switch"`), `SegmentedControl` (`aria-pressed` buttons), `StatusBadge` (`green | yellow | red | none`), `MoneyInput`, `FrequencySelect`, `IconButton`, `Dialog` (native `<dialog>` wrapper), `VisuallyHidden`, `Icon` set (tip, close, search, download, upload, sheet — inline SVG from artifact, `aria-hidden`, `currentColor`).

A tiny `classNames()` helper (`lib/classNames.ts`) (string join, no dependency) for conditional classes.

### 9.3 Responsive rules (from artifact CSS)

- ≤860px: single column, tally hidden, mobile bar shown, progress labels hidden, inputs 16px (no iOS zoom), buttons min 44px, donut stacked above legend; `main` gets bottom padding ≥ mobile bar height.
- ≤600px: row grid re-flow (§4.3.1), result cards 3 columns compact, header stays one line (brand shrinks, lang button keeps ≥40px), file actions one column.
- `(pointer: coarse)`: icon buttons 40px, chips min 42px, larger segmented buttons and switch.
- `viewport-fit=cover` + `env(safe-area-inset-*)` paddings.
- `prefers-reduced-motion: reduce`: no transitions, no smooth scroll.

---

## 10. Charts

**Choice: [Recharts 3](https://recharts.github.io/)** for the three Results charts. The tiny inline indicators (tally stack bar, rule-of-thumb bars) stay plain HTML/CSS so the wizard steps never load Recharts.

Why Recharts: the most widely used React chart library (also behind shadcn/ui and Tremor charts), declarative components, full TypeScript types, SVG output, large community. Its bundle cost (~100 kB gzip) is contained by code-splitting the Results view (§14).

| Chart | Recharts component | Spec |
| --- | --- | --- |
| Where your money goes | `PieChart` + `Pie` (donut) | §10.1 |
| Where your income goes | `BarChart layout="vertical"`, one stacked row + `ReferenceLine` | §10.2 |
| Your biggest expenses | `BarChart layout="vertical"`, one bar per item | §10.3 |
| Tally stack, rule bars | none — `div` widths, `aria-hidden` | §10.4 |

### 10.0 Rules for every Recharts chart

- Lives in `features/results/components/charts/`; each file starts with `"use client"`. Recharts is imported **only** from these files (ESLint `no-restricted-imports` elsewhere).
- The whole `ResultsView` is loaded with `next/dynamic(() => import(...), { ssr: false, loading: <ResultsSkeleton/> })`. Results are only reachable after client interaction, so nothing is lost for SEO.
- **Accessibility pattern:** the chart is decorative; the data is text. Wrap the chart in `<div aria-hidden="true">`, set `accessibilityLayer={false}` (otherwise it would put keyboard focus inside `aria-hidden` content), no `Tooltip`, no Recharts `Legend`. Each chart sits in a `<figure>` with a `<figcaption>` (the section `h3`), and its values are rendered next to it as a real `<table>`/list built from the same data. Never rely on hover.
- **Colours:** never hex in components. Pass token variables as the fill (`fill="var(--b-home)"`, from `BUCKETS[bucket].color`), so dark mode works automatically. Every series is its own `Bar` (or one-datum chart), so no `Cell` is needed — `Cell` is deprecated in Recharts 3.
- **Sizing:** donut has a fixed size (no `ResponsiveContainer`). Bar charts use `ResponsiveContainer width="100%" height={…}` with `initialDimension` to avoid layout shift; reserve the height in CSS.
- **Motion:** `isAnimationActive={!prefersReducedMotion}` (read once via `matchMedia` in a small `usePrefersReducedMotion` hook using `useSyncExternalStore`, which unsubscribes on unmount). Animation duration ≤ 400 ms.
- **Data:** each chart receives a plain, memoised array from a selector (`selectDonutData`, `selectFlowData`, `selectTopExpenses`); no calculations inside chart components; numbers formatted with `lib/format.ts`, never by Recharts.
- **Memory:** charts are fully declarative — no refs to chart instances, no manual listeners. Recharts' internal store and `ResizeObserver` are released on unmount; the leak test (§14 rule 9) mounts/unmounts `ResultsView` 20× and checks for remaining observers/timers.
- **Tests:** jsdom has no layout, so Recharts draws nothing useful there. `jest.setup.ts` stubs `ResizeObserver`; tests assert on the figure caption and the data table/list, not on SVG paths.

### 10.1 Donut (`SpendingDonut`)
`PieChart` 210×210, `Pie` `innerRadius={52}` `outerRadius={80}` `startAngle={90}` `endAngle={-270}` (clockwise from 12 o'clock like the artifact), `paddingAngle={0}`, `stroke="var(--surface)"` 2px between segments. Centre text via `Label position="center"` with custom content: "Planned/mo" (muted, 11px) + total (display font, 19px). Segment order: Home, Getting around, Everyday, Family, Debt, Savings (non-zero only). Legend `<table>`: dot, name, % of planned, amount. Empty state (nothing planned): no Recharts — a CSS ring + "Nothing planned yet".

### 10.2 Income flow (`IncomeFlowBar`)
Single stacked horizontal row, height 34px, radius 8px at the ends. Segments (one `Bar` each, same `stackId`): Savings (`--b-save`), Spending (`--accent`), Left over (`--good-mid`, only if balance > 0). `XAxis type="number" domain={[0, max(income, outgoing)]} hide`, `YAxis type="category" hide`. When short: `ReferenceLine x={income}` in `--bad` with label "Income", and the part beyond it uses a hatched pattern (`<defs><pattern>` in the chart). Key below (list): dot, name, amount, "% of income"; plus "Shortfall" when negative. Not rendered when both income and outgoing are 0.

### 10.3 Biggest expenses (`TopExpenses`)
Up to 5 items as an `<ol>`. Each `<li>`: an HTML line (label with ellipsis + amount `/mo|/yr`), then the bar, then "{p} of income". The bar is one small Recharts `BarChart layout="vertical"` per row (`ResponsiveContainer width="100%" height={10}`), bar radius 5px, background track (`background={{ fill: "var(--bg)" }}`), bar in the bucket colour, shared domain `[0, largest]` so rows are comparable. Labels stay in HTML (they wrap/truncate, are selectable and readable), which is why each row gets its own chart instead of one chart with SVG labels.

### 10.4 Tally stack and rule bars (no library)
`div` segments with `%` widths, `aria-hidden`; the numbers next to them are the accessible content.

---

## 11. Files: JSON backup, CSV export, compatibility

### 11.1 JSON backup — format v2 (current)

File name `my-budget-YYYY-MM-DD.json` / `mon-budget-YYYY-MM-DD.json`, `application/json`, pretty-printed.

```jsonc
{
  "app": "super-simple-budget",
  "version": 2,              // format version this file was written with
  "minReaderVersion": 2,     // oldest reader that can understand it (forward compatibility)
  "savedAt": "2026-10-21T14:03:00.000Z",
  "locale": "en",            // informational
  "view": "month",
  "buckets": {
    "income": {
      "rows": [
        { "id": "myNetIncome", "label": "My net salary", "amount": 2150, "frequency": "Every2Weeks" },
        { "id": "c_k3j9x0aa1b", "custom": true, "label": "Tutoring", "amount": 200, "frequency": "Monthly" }
      ]
    },
    "family": {
      "rows": [ /* … */ ],
      "estimate": { "enabled": true, "amount": 450, "frequency": "Monthly" }
    }
    // other buckets…
  }
}
```

- `label` is written for **every** row (the label shown at export time). Readers use it only when the id is unknown (§11.3) — that is what keeps files usable after catalog changes.
- `amount` is a JSON number or `null`.

### 11.2 Version 1 (artifact) — must stay importable

`{ app, version: 1, savedAt, lang, view, picked: {bucket: id[]}, v: {id: {a, f}}, est: {bucket: {on, a, f}}, custom: {bucket: [{id, l}]} }` (artifact lines 716–735).

### 11.3 Compatibility policy (read side)

One pipeline for files **and** `localStorage`:

```
unknown JSON ──► detect(app, version) ──► migrate vN → vN+1 → … → current ──► sanitize ──► BudgetState
```

1. `app` must equal `"super-simple-budget"`; otherwise "This file isn't a Super Simple Budget file."
2. If `version > CURRENT` and `minReaderVersion > CURRENT` → message "This file was made by a newer version of Super Simple Budget." Else read it as current (unknown fields ignored).
3. Migrations are pure functions in `features/files/migrations/` (`v1ToV2.ts`, …), each with its own test. Never edit an old migration.
4. **Sanitize** (never throw, repair instead):
   - Unknown bucket → its rows go to the bucket of their catalog item, or are dropped if custom.
   - Retired id with replacement → replaced; unknown/retired-without-replacement id → **custom row** with the file's `label` (or "Your item").
   - Catalog item in the wrong bucket → moved to its own bucket.
   - Duplicates → first wins. Max 200 rows per bucket.
   - Custom id not matching `/^c_?[a-z0-9]{1,16}$/` → new id generated. Label → string, trimmed, max 80 chars.
   - Amount: finite, `0 ≤ a < 1e9`, rounded to 2 decimals; anything else → `null`. Strings like `"1234.5"` are accepted.
   - Frequency: unknown → item default (or `Monthly`); legacy `SemiMonthly` → `TwiceMonthly`.
   - Estimate only for estimable buckets.
   - `view`: `"year"` or `"month"`.
5. Write side always writes the current version.

**Change rules for future developers:**
- *Additive* change (new optional field, new bucket key, new frequency that old readers can default): keep `version`, keep `minReaderVersion`.
- *Breaking* change: bump `version`, add a migration, bump `minReaderVersion` only if old readers would misinterpret the data.
- Golden fixtures in `features/files/__fixtures__/` (`v1-artifact.json`, `v2-full.json`, `v2-unknown-ids.json`, `v2-future-version.json`, `garbage.json`) are **append-only** and are imported in tests forever.
- Size guard: reject files > 1 MB before parsing. Read with `await file.text()` (no `FileReader` handlers to clean up).

### 11.4 CSV export (view-only)

File `my-budget-YYYY-MM-DD.csv`, `text/csv;charset=utf-8`, UTF-8 BOM, CRLF line endings.

- Delimiter `,` (en) / `;` (fr); decimal `.` (en) / `,` (fr); numbers with 2 decimals, no grouping, no currency symbol.
- Columns (localised header, artifact `csvHead`): **Section, Item, Amount, Frequency, Monthly, Yearly**. Then a blank line, then rows "Total income", "Total planned", "Left over|Shortfall" (absolute value).
- Rows: every row with amount > 0 in step order; estimated bucket → one row "{bucket} (rough total)".
- Every cell escaped: prefix `'` if it starts with `= + - @ \t \r` (formula injection), quote if it contains the delimiter, `"` or a newline.
- **Stability contract:** column order never changes; new columns are only appended at the end; header text may be re-translated. CSV is not re-imported (JSON is the round-trip format).

### 11.5 Download helper (`lib/download.ts`)

`downloadFile(name, content, mime)`: create Blob → object URL → temporary `<a download>` → click → remove → `URL.revokeObjectURL` in a `setTimeout(…, 0)`. Returns `true/false`; failure toast "Downloads aren't available here." On success update `lastFileSaveAt`, clear `changedAt`, toast.

Open: hidden `<input type="file" accept=".json,application/json">` triggered by a real `<button>` (not a `<label role=button>`); reset `value` after reading. On success: replace budget, go to results step, `changedAt=null`, scroll to top, toast "Budget opened".

---

## 12. Accessibility (WCAG 2.2 AA)

Structure
- Landmarks: `header`, `nav[aria-label=Progress]`, `main`, `aside[aria-label=Running total]`, `footer`. One `h1` (app name); `h2` per step; `h3` per panel/section.
- Skip link "Skip to main content" as the first focusable element.
- `<html lang>` per locale; the language link carries `lang`/`hrefLang` of the target.

Focus management
- Step change: scroll to top (instant if reduced motion), move focus to the step `h2` (`tabIndex={-1}`), update `document.title` to "{step name} — Super Simple Budget".
- After adding an item: focus its amount input (same bucket). Custom row: focus its name input. After removing: §4.3.1.
- Dialog: native `showModal()`; focus first action; restore focus on close.
- Visible focus: `outline: 3px solid var(--accent); outline-offset: 2px` on `:focus-visible` everywhere; never removed.

Names, roles, states
- Every input has an accessible name (label or `aria-label` per §4.3.1). Chips: "Add {item}" (visible "+ {item}"). Remove/tip buttons named with the item label.
- Toggles: `aria-pressed` (Monthly/Yearly), `role="switch"` + `aria-checked` via native checkbox (rough total), `aria-expanded` + `aria-controls` (tips, show more).
- Status colours always paired with text ("On track", "A bit off", "Needs attention"); never colour alone.
- Charts: §10 — data is always available as text/table; SVG decorative.

Announcements
- One polite toast region (always mounted). One debounced balance region (§4.5). Search: polite "{n} results" / "No match". No `aria-live` on totals that change per keystroke.

Input
- Everything works with keyboard only; Enter/Space activate. Tap targets ≥ 44×44 on touch (24×24 minimum elsewhere, WCAG 2.5.8).
- Inputs ≥16px on mobile. `inputmode="decimal"`, `autocomplete="off"` on money fields, `enterKeyHint="next"`.
- Reflow at 400% zoom / 320 CSS px wide with no horizontal page scroll.
- Contrast ≥ 4.5:1 text, ≥ 3:1 UI in both themes — verify the artifact tokens with a test helper; adjust if any pair fails.

Testing
- `jest-axe` on: each bucket step (empty + filled), results (with/without income), dialog open, both locales.
- Manual checklist per release: VoiceOver iOS Safari, VoiceOver macOS Safari, NVDA + Firefox, TalkBack Chrome (documented in `docs/a11y-checklist.md` at step 22).

---

## 13. SEO

- Static HTML per locale with real content: header, step 1 question, lede and the popular income chips, footer — readable without JS.
- `generateMetadata` in `app/[lang]/layout.tsx` from the dictionary:
  - `title`: "Super Simple Budget — free monthly budget planner" / "Budget super simple — planificateur budgétaire mensuel gratuit"; `description` (≤160 chars, new `meta.*` dictionary keys).
  - `metadataBase` from `NEXT_PUBLIC_SITE_URL` (fallback `http://localhost:3000`).
  - `alternates`: `canonical: "/{lang}"`, `languages: { "en-CA": "/en", "fr-CA": "/fr", "x-default": "/en" }`.
  - `openGraph` (type `website`, `locale` `en_CA`/`fr_CA`, `alternateLocale`), `twitter` (`summary_large_image`).
  - `robots: { index: true, follow: true }`.
- `viewport` export: `width=device-width, initial-scale=1, viewport-fit=cover`, `themeColor` light `#f3f6f7` / dark `#0e1a1d`.
- `app/sitemap.ts` (both locales with `alternates.languages`), `app/robots.ts`, `app/manifest.ts` (name, short name, colours, icons), `app/icon.svg` (brand mark), `app/apple-icon.png`, `app/[lang]/opengraph-image.tsx` (1200×630, localised title).
- JSON-LD `WebApplication` (`applicationCategory: "FinanceApplication"`, `operatingSystem: "Any"`, `offers.price: 0`, `inLanguage`) in the page, serialised with `<` escaped as `<`.
- Lighthouse targets (mobile): SEO 100, Accessibility 100, Best Practices 100, Performance ≥ 95.

---

## 14. Performance and memory

Budgets (checked at step 22 with `next build` output and Lighthouse):
- First-load JS for `/[lang]` ≤ **120 kB gzip**; Results chunk (dynamic, includes Recharts) ≤ 140 kB gzip, loaded only when the Results step opens; prefetch it when the user reaches the last bucket step (`import()` on idle).
- LCP < 2.0 s on throttled mobile, CLS < 0.02, INP < 100 ms while typing amounts.

Rules:
1. Server Components by default; `"use client"` only on interactive leaves and the app island (`BudgetApp`). Header text, footer, JSON-LD are server-rendered.
2. Fine-grained selectors; derived data via `createSelector`; no selector returns a new object/array unless memoised. React Compiler handles component memoisation — no manual `useMemo`/`useCallback`/`memo`.
3. No module-level mutable state that grows (except the bounded `Intl` formatter cache: ≤ 2 locales × few option sets).
4. Every effect that subscribes cleans up: `beforeunload`, `pagehide`, `visibilitychange`, toast/announcer timers, persistence debounce timer, store listener `unsubscribe`. Pattern: subscribe in `useEffect`, return cleanup; prefer `AbortController` signal for DOM listeners.
5. Object URLs always revoked; file reading via `file.text()`.
6. No polling, no intervals. "N days ago" is computed at render (it changes at most daily; re-rendered on any state change).
7. Search: pre-built normalised index per locale (computed once per dictionary), simple `includes` over ~104 items — no debounce needed.
8. Fonts via `next/font` (subset `latin`, `latin-ext` for French), only the weights used (Bricolage 500/700, Atkinson 400/700, Plex Mono 500).
9. Leak test: a Jest test mounts/unmounts `StoreProvider` 50× and asserts no remaining `window` listeners (spy on `addEventListener`/`removeEventListener` counts) and no pending timers (`jest.getTimerCount() === 0`).

---

## 15. Project structure

```
app/
  [lang]/
    layout.tsx            # root layout: <html lang>, fonts, metadata, StoreProvider, I18nProvider
    page.tsx              # server shell: header/footer text, JSON-LD, <BudgetApp/>
    opengraph-image.tsx
  globals.css
  icon.svg  apple-icon.png  manifest.ts  robots.ts  sitemap.ts
proxy.ts                  # "/" → "/en" | "/fr"
i18n/
  config.ts  getDictionary.ts  I18nProvider.tsx  translate.ts   # t(), plural(), useTranslator()
  dictionaries/en.ts  dictionaries/fr.ts
domain/                   # pure TS, 100% unit-tested, no React/Redux imports
  frequency.ts  catalog/{items.ts,categories.ts,buckets.ts,retired.ts}  totals.ts  rules.ts  results.ts  __fixtures__/exampleBudget.ts
lib/
  format.ts  parseAmount.ts  csv.ts  download.ts  normalizeSearch.ts  classNames.ts  customId.ts
store/
  makeStore.ts  hooks.ts  StoreProvider.tsx  persistence.ts
features/
  budget/    budgetSlice.ts  selectors.ts  components/{BucketStep,PickedPanel,Row,ChipPicker,ItemSearch,EstimateToggle}.tsx
  wizard/    uiSlice.ts  components/{Progress,StepNav,StepHeading}.tsx
  tally/     components/{Tally,MobileBar,BalanceAnnouncer}.tsx
  results/   components/{ResultsView,IncomeFlowBar,TopExpenses,SpendingDonut,CompareSection,NextSteps,CopySummary}.tsx
  files/     schema.ts  migrations/  sanitize.ts  exportJson.ts  importJson.ts  exportCsv.ts  __fixtures__/  components/FileBox.tsx
  notices/   components/{UnsavedNotice,ConfirmDialog,Toaster}.tsx  useBeforeUnload.ts
  app/       BudgetApp.tsx  Header.tsx  LanguageLink.tsx  Footer.tsx
components/ui/            # §9.2
docs/                     # SPEC.md, PLAN.md, reference/artifact.html
```

Conventions:
- Files: components `PascalCase.tsx`, everything else `camelCase.ts` (e.g. `parseAmount.ts`, `budgetSlice.ts`), except Next.js file conventions (`opengraph-image.tsx`); tests next to code as `*.test.ts(x)`.
- Named exports only (except Next.js file conventions).
- Import direction: `app → features → (components/ui, store, i18n, lib, domain)`; `domain` and `lib` import nothing from above. Enforce with ESLint `no-restricted-imports`.
- No barrel files that re-export whole folders (keeps tree-shaking and test isolation simple).

---

## 16. Testing strategy

| Layer | Tooling | What |
| --- | --- | --- |
| domain, lib | Jest (node env via docblock `@jest-environment node`) | frequency, totals (example vector §7.5), rules (every band edge), results (top 5, next steps), parse/format (en & fr), csv escaping. Target ≥ 95% lines. |
| files | Jest | each migration, sanitize repairs, golden fixtures round-trip, future-version handling. |
| store | Jest | reducers, selectors, persistence debounce/flush (fake timers), leak test. |
| components | RTL + user-event + jest-axe | behaviour from the user's point of view (roles/names, not classes); one axe check per screen state. |
| i18n | Jest | key parity en/fr, every catalog id has a label, no empty strings except optional help/tip. |

Scripts: `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`, `pnpm typecheck` (`tsc --noEmit`). CI-ready (no network, no snapshots of large DOM).

---

## 17. Definition of done (every step)

- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` all pass.
- New logic has tests; UI has role-based tests + axe.
- Strings come from dictionaries in both languages (no hard-coded copy).
- No new dependency without a line in this spec explaining why.
- Works at 320px wide and with keyboard only.
