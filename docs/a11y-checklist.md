# Manual accessibility checklist

Run before every release (Spec §12). The automated checks (jest-axe on every screen state, `app/contrast.test.ts`, Lighthouse) catch markup problems. This script catches what they can't: what a screen reader actually says, focus order, and how the page feels by touch.

Test both `/en` and `/fr` with each pairing at least once per release, and switch languages at least once during the run:

| Screen reader | Browser | Device |
| --- | --- | --- |
| VoiceOver | Safari | iPhone (iOS, current) |
| VoiceOver | Safari | Mac (macOS, current) |
| NVDA | Firefox | Windows |
| TalkBack | Chrome | Android phone |

Start each run in a private window (empty storage). Record the date, versions and any failure in the PR, quoting what the screen reader said.

## 1. Page load and structure

- [ ] The page title is "Super Simple Budget — free monthly budget planner" ("Budget super simple — planificateur budgétaire mensuel gratuit"), and the language is announced correctly (French voice on `/fr`).
- [ ] The first Tab stop is "Skip to main content" ("Passer au contenu principal"), and activating it moves to `main`.
- [ ] The landmarks list shows banner, navigation "Progress", main, complementary "Running total" (desktop width) and contentinfo.
- [ ] The headings list shows one `h1` (app name), the step `h2` and `h3`s for panels. No levels are skipped.
- [ ] The language link reads "Show in English" / "Afficher en français", is spoken in the target language, and switching keeps the budget.

## 2. Wizard and focus

- [ ] "Next: Savings →" moves focus to the new step heading, which is read with the step's question. The page scrolls to the top and the tab title becomes "Savings — Super Simple Budget".
- [ ] The Progress buttons announce the current step ("current step"). Any step can be reached with Tab + Enter/Space.
- [ ] Below 860px wide, progress labels are hidden visually, but each button still reads its step name.
- [ ] Reloading the page on a saved step does **not** move focus or announce anything.

## 3. Picking and editing rows

- [ ] Chips read "Add {item}". Activating one moves focus to "{item} amount", which is an edit field with a decimal keypad on phones.
- [ ] "+ Something else" moves focus to "Item name".
- [ ] The frequency select reads "{item} frequency" with its current value. All 8 options are reachable.
- [ ] The tip button reads expanded/collapsed, and the tip text is reachable right after it.
- [ ] "Remove {item}" moves focus to the next row's remove button, else the previous one, else the "Tap what applies" heading. Nothing is lost silently.
- [ ] "Show {n} more" / "Show fewer" reads expanded/collapsed.
- [ ] Search: typing announces "{n} results" / "No match" (polite, not on every keystroke). Picking an item from another bucket announces "Added to {bucket}" and keeps focus in the search field.
- [ ] Rough total: the switch reads "Give a rough total instead", switch, off/on, with its hint as the description. Turning it on shows one amount row, and turning it off brings the items back.

## 4. Totals and announcements

- [ ] Typing amounts does **not** announce totals on every key. About 1 s after you stop, "Left over $X per month" / "Shortfall $X per month" is announced once.
- [ ] The Monthly/Yearly buttons read pressed/not pressed and change every amount on the screen.
- [ ] Balance colours always come with words ("Left over", "Shortfall"). On results, every badge reads "On track" / "A bit off" / "Needs attention".

## 5. Results

- [ ] Opening results focuses the headline `h2` ("You have $X left each month" etc.).
- [ ] Every chart card is a figure named by its heading. Its data is read as a list or table. The SVG chart itself is silent.
- [ ] Each comparison row reads the category, share, amount, status and its sentence, in that order.
- [ ] "Add your income" in Next steps moves focus to the Income step heading.
- [ ] "Copy summary" announces "Summary copied" and the clipboard holds the monthly text.

## 6. Files, notices and dialogs

- [ ] The header's "File" button announces as collapsed/expanded ("File, unsaved changes" while unsaved). Tab from it reaches the panel's buttons, each read with its hint; Esc closes the panel and returns focus to "File"; tabbing past the last item closes it.
- [ ] "Save budget" (File menu) downloads a `.json` file, announces "Budget saved", and focus is back on "File".
- [ ] "Open budget" with unsaved changes opens the dialog: focus is on "Save budget first", Tab stays inside, and Esc closes it and returns focus to "File". After "Continue without saving", the file picker opens.
- [ ] Opening a valid file moves to results and announces it. A broken file announces the error and changes nothing.
- [ ] "Clear budget" goes through the same dialog, then lands on the Income step heading with "Started a blank budget".
- [ ] The unsaved-changes notice ("Changes not saved to a file") is reachable. "Later" and "Save budget" move focus to the step heading.
- [ ] Leaving or reloading with unsaved changes shows the browser's "leave site?" prompt.

## 7. Visual, zoom and input

- [ ] At 320 CSS px wide and at 400% zoom there is no horizontal page scrolling and nothing is cut off. The mobile bar doesn't cover the footer.
- [ ] Every focusable element shows the 3px accent outline, in light and dark mode.
- [ ] With OS dark mode, every text and control boundary is readable. With reduced motion, there is no smooth scrolling and no chart animation.
- [ ] Touch: chips, icon buttons, progress steps and the language link are comfortable to hit (≥ 44px). Focusing an input on an iPhone doesn't zoom the page.
- [ ] Windows High Contrast / forced colours: controls, the switch state and focus remain visible.
