/** Target of the skip link: the step content. */
export const MAIN_ID = "main";

/** The first focusable element: jumps past the header and progress. */
export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href={`#${MAIN_ID}`}
      className="sr-only rounded-lg bg-surface px-4 py-2 font-bold text-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
    >
      {label}
    </a>
  );
}
