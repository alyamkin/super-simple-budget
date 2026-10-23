import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import type { Dictionary } from "@/i18n/dictionaries/en";

const AUTHOR = "Andrey Lyamkin";
const REPOSITORY_URL = "https://github.com/alyamkin/super-simple-budget";

/** "About this tool": privacy, advice, credits and authorship. Server-rendered. */
export function Footer({
  footer,
  year,
}: {
  footer: Dictionary["footer"];
  year: number;
}) {
  return (
    <footer className="mt-10 grid max-w-[72ch] gap-1.5 border-t border-line pt-[18px] text-[.84rem] text-muted">
      <h2 className="mb-0.5 text-[.95rem] font-bold text-ink">{footer.about}</h2>
      <p className="m-0">
        {footer.privacy} {footer.advice}
      </p>
      <p className="m-0">
        {footer.credit}{" "}
        <a
          href={footer.creditUrl}
          target="_blank"
          rel="noopener"
          className="text-accent underline"
        >
          {footer.creditLink}
          <VisuallyHidden> {footer.newTab}</VisuallyHidden>
        </a>
        . {footer.notAffiliated}
      </p>
      <p className="m-0">
        © {year} · {footer.madeBy} {AUTHOR} ·{" "}
        <a
          href={REPOSITORY_URL}
          target="_blank"
          rel="noopener"
          className="text-accent underline"
        >
          {footer.sourceLink}
          <VisuallyHidden> {footer.newTab}</VisuallyHidden>
        </a>
      </p>
    </footer>
  );
}
